package bundle

import (
	"path"

	esbuild "github.com/evanw/esbuild/pkg/api"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

func newModuleResolverPlugin(resolver module_graph.Resolver) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "module-resolver",
		Setup: func(build esbuild.PluginBuild) {
			build.OnResolve(
				esbuild.OnResolveOptions{
					Filter: ".*",
				},
				func(args esbuild.OnResolveArgs) (esbuild.OnResolveResult, error) {
					if path.IsAbs(args.Path) {
						return esbuild.OnResolveResult{
							Path:        args.Path,
							SideEffects: esbuild.SideEffectsTrue,
						}, nil
					}

					resolved, err := resolver.ResolveImport(args.Path, args.ResolveDir)
					if err != nil {
						return esbuild.OnResolveResult{}, err
					}

					return esbuild.OnResolveResult{
						Path: resolved,
						// TODO: Detect side-effects
					}, nil
				},
			)
		},
	}
}
