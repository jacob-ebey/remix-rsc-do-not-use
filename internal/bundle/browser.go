package bundle

import (
	"encoding/json"
	"fmt"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"
	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

func BundleBrowser(
	browserEntries []string,
	clientModules map[string]module_graph.Module,
	serverModules map[string]module_graph.Module,
	workingDirectory string,
	buildDirectory string,
	publicPath string,
	production bool,
) (*esbuild.BuildResult, error) {
	defineMap := make(map[string]string, 1)
	if production {
		defineMap["process.env.NODE_ENV"] = "\"production\""
	} else {
		defineMap["process.env.NODE_ENV"] = "\"development\""
	}

	conditions := []string{"browser", "import", "require", "default"}

	resolver, err := module_graph.NewEnhancedResolver(module_graph.EnhancedResolverOptions{
		CWD:            workingDirectory,
		Conditions:     conditions,
		Extensions:     []string{".js", ".mjs", ".cjs", ".json"},
		ExtensionAlias: []string{".js:.js,.jsx,.ts,.tsx", ".mjs:.mjs,.mts,.mtsx", ".cjs:.cjs,.cts,.ctsx"},
		MainFields:     []string{"browser", "module", "main"},
	})
	if err != nil {
		return nil, err
	}
	go func() {
		defer resolver.Stop()
		err := resolver.Start()
		if err != nil {
			fmt.Println("could not start resolver: " + err.Error())
			panic(err)
		}
	}()

	plugins := []esbuild.Plugin{
		browserRuntimePlugin(workingDirectory, clientModules),
		newServerModulesPlugin(serverModules),
		newHttpExternalsPlugin(),
		newModuleResolverPlugin(resolver),
	}

	buildContext, buildError := esbuild.Context(esbuild.BuildOptions{
		AbsWorkingDir:     workingDirectory,
		AssetNames:        "_assets/[name]-[hash]",
		Bundle:            true,
		ChunkNames:        "_shared/[name]-[hash]",
		Define:            defineMap,
		EntryNames:        "[dir]/[name]-[hash]",
		EntryPoints:       browserEntries,
		Format:            esbuild.FormatESModule,
		JSX:               esbuild.JSXAutomatic,
		JSXDev:            !production,
		Metafile:          true,
		MinifyWhitespace:  production,
		MinifyIdentifiers: production,
		MinifySyntax:      true,
		Outdir:            buildDirectory,
		Plugins:           plugins,
		PublicPath:        publicPath,
		Sourcemap:         esbuild.SourceMapExternal,
		Splitting:         true,
		Target:            esbuild.ES2020,
		TreeShaking:       esbuild.TreeShakingTrue,
		Write:             false,
	})
	if buildError != nil {
		return nil, buildError
	}

	buildResult := buildContext.Rebuild()

	if len(buildResult.Errors) > 0 {
		messages := esbuild.FormatMessages(buildResult.Errors, esbuild.FormatMessagesOptions{
			Color: true,
			Kind:  esbuild.ErrorMessage,
		})
		return nil, fmt.Errorf("browser build failed:\n%s", strings.Join(messages, "\n"))
	}

	return &buildResult, nil
}

func browserRuntimePlugin(workingDirectory string, clientModules map[string]module_graph.Module) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "browser-runtime",
		Setup: func(build esbuild.PluginBuild) {
			build.OnResolve(
				esbuild.OnResolveOptions{
					Filter: "^remix\\/browser-runtime$",
				},
				func(args esbuild.OnResolveArgs) (esbuild.OnResolveResult, error) {
					return esbuild.OnResolveResult{
						Path:      args.Path,
						Namespace: "browser-runtime",
					}, nil
				},
			)
			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter:    "^remix\\/browser-runtime$",
					Namespace: "browser-runtime",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					contents := "export async function importById(id) {"
					contents += "switch (id) {"
					for _, clientModule := range clientModules {
						contents += fmt.Sprintf("case %q: return import(%q);", clientModule.Hash, clientModule.Source)
					}
					contents += "default: throw new Error(`unknown ID: ${id}`);"
					contents += "}"
					contents += "}"

					return esbuild.OnLoadResult{
						Contents:   &contents,
						Loader:     esbuild.LoaderJS,
						ResolveDir: workingDirectory,
					}, nil
				},
			)
		},
	}
}

func newServerModulesPlugin(serverModules map[string]module_graph.Module) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "server-modules",
		Setup: func(build esbuild.PluginBuild) {
			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter: ".*",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					serverModule, ok := serverModules[args.Path]
					if !ok {
						return esbuild.OnLoadResult{}, nil
					}

					contents := `const SERVER_REFERENCE = Symbol.for("react.server.reference");`

					for _, export := range serverModule.Exports {
						id := fmt.Sprintf(`"%s#%s"`, serverModule.Hash, export)
						jsonID, err := json.Marshal(id)
						if err != nil {
							return esbuild.OnLoadResult{}, err
						}
						reference := fmt.Sprintf(`{ $$typeof: SERVER_REFERENCE, $$id: %s }`, jsonID)

						if export == "default" {
							contents += fmt.Sprintf(`export default %s;`, reference)
						} else {
							contents += fmt.Sprintf(`export const %s = %s;`, export, reference)
						}
					}

					return esbuild.OnLoadResult{
						Contents: &contents,
						Loader:   esbuild.LoaderJS,
					}, nil
				},
			)
		},
	}
}

func newHttpExternalsPlugin() esbuild.Plugin {
	return esbuild.Plugin{
		Name: "http-externals",
		Setup: func(build esbuild.PluginBuild) {
			build.OnResolve(
				esbuild.OnResolveOptions{Filter: "^https?:\\/\\/"},
				func(args esbuild.OnResolveArgs) (esbuild.OnResolveResult, error) {
					return esbuild.OnResolveResult{
						Path:     args.Path,
						External: true,
					}, nil
				},
			)
		},
	}
}
