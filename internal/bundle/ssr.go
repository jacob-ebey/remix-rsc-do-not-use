package bundle

import (
	"fmt"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

func BundleSSR(
	ssrBundle ServerBundle,
	clientModules map[string]module_graph.Module,
	serverModules map[string]module_graph.Module,
	routes map[string]*RouteConfig,
	browserManifest string,
	workingDirectory string,
	production bool,
) (*esbuild.BuildResult, error) {
	defineMap := make(map[string]string, 1)
	if production {
		defineMap["process.env.NODE_ENV"] = "\"production\""
	} else {
		defineMap["process.env.NODE_ENV"] = "\"development\""
	}

	entryPoints := []string{ssrBundle.EntryPoint}

	plugins := []esbuild.Plugin{
		newSSRClientRuntimePlugin(workingDirectory, clientModules, browserManifest),
		newServerModulesClientPlugin(serverModules),
		newHttpExternalsPlugin(),
		newModuleResolverPlugin(ssrBundle.Resolver),
	}

	buildContext, buildError := esbuild.Context(esbuild.BuildOptions{
		AbsWorkingDir:     workingDirectory,
		AssetNames:        "_assets/[name]-[hash]",
		Bundle:            true,
		ChunkNames:        "_shared/[name]-[hash]",
		Define:            defineMap,
		EntryNames:        "[name]",
		EntryPoints:       entryPoints,
		Format:            esbuild.FormatESModule,
		Inject:            []string{"remix/webpack-polyfill.ssr"},
		JSX:               esbuild.JSXAutomatic,
		JSXDev:            !production,
		Metafile:          true,
		MinifyWhitespace:  production,
		MinifyIdentifiers: production,
		MinifySyntax:      production,
		Outdir:            ssrBundle.Output,
		Platform:          ssrBundle.Platform.ToESBuild(),
		Plugins:           plugins,
		Sourcemap:         esbuild.SourceMapLinked,
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
		return nil, fmt.Errorf("ssr bundle %q failed to build:\n%s", ssrBundle.Name, strings.Join(messages, "\n"))
	}

	return &buildResult, nil
}

func newSSRClientRuntimePlugin(
	workingDirectory string,
	clientModules map[string]module_graph.Module,
	browserManifest string,
) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "ssr-runtime",
		Setup: func(build esbuild.PluginBuild) {
			build.OnResolve(
				esbuild.OnResolveOptions{
					Filter: "^remix\\/ssr-runtime$",
				},
				func(args esbuild.OnResolveArgs) (esbuild.OnResolveResult, error) {
					return esbuild.OnResolveResult{
						Path:        args.Path,
						Namespace:   "ssr-runtime",
						SideEffects: esbuild.SideEffectsFalse,
					}, nil
				},
			)
			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter:    "^remix\\/ssr-runtime$",
					Namespace: "ssr-runtime",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					contents := "export async function importById(id) {\n"
					contents += "  switch (id) {\n"
					for _, clientModule := range clientModules {
						contents += fmt.Sprintf("    case %q: return import(%q);\n", clientModule.Hash, clientModule.Source)
					}
					contents += "    default: return Promise.resolve({});\n"
					contents += "  }\n"
					contents += "}\n"

					contents += "const browserManifest = " + browserManifest + ";\n"

					contents += `export const browserEntrypoint = browserManifest["browser-entry"];` + "\n"

					contents += "export const moduleMap = new Proxy({}, {\n"
					contents += "  get: (_, id) => {\n"
					contents += "    return new Proxy({}, {\n"
					contents += "      get: (_, name) => {\n"
					contents += `        return browserManifest[id+"#"+name];`
					contents += "      }\n"
					contents += "    });\n"
					contents += "  }\n"
					contents += "});\n"

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
