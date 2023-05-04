package bundle

import (
	"fmt"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

func BundleServer(
	serverBundle ServerBundle,
	clientModules map[string]module_graph.Module,
	serverModules map[string]module_graph.Module,
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

	entryPoints := []string{serverBundle.EntryPoint}

	plugins := []esbuild.Plugin{}

	buildContext, buildError := esbuild.Context(esbuild.BuildOptions{
		AbsWorkingDir:     workingDirectory,
		AssetNames:        "_assets/[name]-[hash]",
		Bundle:            true,
		ChunkNames:        "_shared/[name]-[hash]",
		Define:            defineMap,
		EntryNames:        "[name]",
		EntryPoints:       entryPoints,
		Format:            esbuild.FormatESModule,
		JSX:               esbuild.JSXAutomatic,
		JSXDev:            !production,
		Metafile:          true,
		MinifyWhitespace:  production,
		MinifyIdentifiers: production,
		MinifySyntax:      true,
		Outdir:            serverBundle.Output,
		Platform:          serverBundle.Platform.ToESBuild(),
		Plugins:           plugins,
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
		return nil, fmt.Errorf("server bundle %q failed to build:\n%s", serverBundle.Name, strings.Join(messages, "\n"))
	}

	return &buildResult, nil
}
