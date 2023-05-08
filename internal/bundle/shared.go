package bundle

import (
	"fmt"
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
					resolved := args.Path

					sideEffects := esbuild.SideEffectsTrue

					if !path.IsAbs(args.Path) {
						// TODO: Detect side-effects
						// resolvedImport, sideEffects, err := ...
						resolvedImport, err := resolver.ResolveImport(args.Path, args.ResolveDir)
						if err != nil {
							return esbuild.OnResolveResult{}, err
						}
						if resolvedImport == "___external___" {
							return esbuild.OnResolveResult{
								Path:        args.Path,
								External:    true,
								SideEffects: esbuild.SideEffectsFalse,
							}, nil
						}
						resolved = resolvedImport
					}

					if module_graph.IsStyleModule(resolved) {
						// TODO: Track CSS imports for inclusion in manifest
						sideEffects = esbuild.SideEffectsFalse
					}

					return esbuild.OnResolveResult{
						Path:        resolved,
						SideEffects: sideEffects,
					}, nil
				},
			)

			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter:    ".*",
					Namespace: "file",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					if module_graph.IsStyleModule(args.Path) {
						contents := ""
						return esbuild.OnLoadResult{
							Contents: &contents,
							Loader:   esbuild.LoaderEmpty,
						}, nil
					}

					return esbuild.OnLoadResult{}, nil
				},
			)
		},
	}
}

func newServerModulesClientPlugin(serverModules map[string]module_graph.Module) esbuild.Plugin {
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
						id := fmt.Sprintf(`%s#%s`, serverModule.Hash, export)
						reference := fmt.Sprintf(`{ $$typeof: SERVER_REFERENCE, $$id: %q }`, id)

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
