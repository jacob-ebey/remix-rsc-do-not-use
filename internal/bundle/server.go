package bundle

import (
	"fmt"
	"os"
	"path"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"
	"github.com/tdewolff/parse/v2"
	"github.com/tdewolff/parse/v2/js"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

func BundleServer(
	serverBundle ServerBundle,
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

	entryPoints := []string{serverBundle.EntryPoint}

	plugins := []esbuild.Plugin{
		newServerRuntimePlugin(workingDirectory, serverModules, browserManifest, routes, serverBundle.RouteIDs),
		newClientModulesPlugin(clientModules),
		newServerModulesServerPlugin(serverModules),
		newModuleResolverPlugin(serverBundle.Resolver),
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
		Inject:            []string{"remix/webpack-polyfill.server"},
		JSX:               esbuild.JSXAutomatic,
		JSXDev:            !production,
		Metafile:          true,
		MinifyWhitespace:  production,
		MinifyIdentifiers: production,
		MinifySyntax:      production,
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

func newServerRuntimePlugin(
	workingDirectory string,
	serverModules map[string]module_graph.Module,
	browserManifest string,
	routes map[string]*RouteConfig,
	routeIDs []string,
) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "server-runtime",
		Setup: func(build esbuild.PluginBuild) {
			build.OnResolve(
				esbuild.OnResolveOptions{
					Filter: "^remix\\/server-runtime$",
				},
				func(args esbuild.OnResolveArgs) (esbuild.OnResolveResult, error) {
					return esbuild.OnResolveResult{
						Path:        args.Path,
						Namespace:   "server-runtime",
						SideEffects: esbuild.SideEffectsFalse,
					}, nil
				},
			)
			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter:    "^remix\\/server-runtime$",
					Namespace: "server-runtime",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					contents := ""

					routesToInclude := map[string]bool{}
					for _, routeId := range routeIDs {
						routesToInclude[routeId] = true
					}

					// TODO: Should probably sort the imports by routeID so that the order is consistent.
					// The above is not needed if golang maps iterate in a deterministic order.
					routesSlice := []*RouteConfig{}
					routeImports := map[string]int{}
					index := 0
					for routeId, route := range routes {
						if _, ok := routesToInclude[routeId]; !ok {
							continue
						}
						if _, ok := routeImports[routeId]; ok {
							continue
						}
						contents += fmt.Sprintf("import * as route%d from %q;\n", index, route.Filename)
						routesSlice = append(routesSlice, route)
						routeImports[routeId] = index
						index += 1
						parentId := route.ParentID
						for parentId != "" {
							if _, ok := routeImports[parentId]; ok {
								break
							}
							parentRoute := routes[parentId]
							contents += fmt.Sprintf("import * as route%d from %q;\n", index, parentRoute.Filename)
							routesSlice = append(routesSlice, parentRoute)
							routeImports[parentId] = index
							index += 1
							parentId = parentRoute.ParentID
						}
					}

					serverRoutes := createServerRoutesJavascript(routesSlice, routeImports)

					contents += "export async function importById(id) {\n"
					contents += "  switch (id) {\n"
					for _, clientModule := range serverModules {
						contents += fmt.Sprintf("    case %q: return import(%q);\n", clientModule.Hash, clientModule.Source)
					}
					contents += "    default: throw new Error(`unknown ID: ${id}`);\n"
					contents += "  }\n"
					contents += "}\n"

					contents += fmt.Sprintf("export const browserManifest = %s;", browserManifest)

					contents += fmt.Sprintf("export const routes = %s;", serverRoutes)

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

func createServerRoutesJavascript(routes []*RouteConfig, routeImports map[string]int) string {
	contents := "["
	for _, route := range routes {
		if route.ParentID != "" {
			continue
		}
		if contents != "[" {
			contents += ",\n"
		}
		contents += createServerRouteJavascriptRecursive(route, routes, routeImports)
	}
	contents += "]"

	return contents
}

func createServerRouteJavascriptRecursive(route *RouteConfig, routes []*RouteConfig, routeImports map[string]int) string {
	contents := "{"
	contents += fmt.Sprintf("  ...route%d,", routeImports[route.ID])
	contents += fmt.Sprintf("  id: %q,", route.ID)
	if route.Path != "" {
		contents += fmt.Sprintf("  path: %q,", route.Path)
	}
	if route.Index {
		contents += "  index: true,"
	}

	children := ""
	for _, child := range routes {
		if child.ParentID != route.ID {
			continue
		}
		if children != "" {
			children += ",\n"
		}
		children += createServerRouteJavascriptRecursive(child, routes, routeImports)
	}

	if children != "" {
		contents += fmt.Sprintf("  children: [%s],", children)
	}

	contents += "}"
	return contents
}

func newClientModulesPlugin(clientModules map[string]module_graph.Module) esbuild.Plugin {
	return esbuild.Plugin{
		Name: "client-modules",
		Setup: func(build esbuild.PluginBuild) {
			build.OnLoad(
				esbuild.OnLoadOptions{
					Filter: ".*",
				},
				func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
					clientModule, ok := clientModules[args.Path]
					if !ok {
						return esbuild.OnLoadResult{}, nil
					}

					contents := `const CLIENT_REFERENCE = Symbol.for("react.client.reference");`

					for _, export := range clientModule.Exports {
						id := fmt.Sprintf("%s#%s", clientModule.Hash, export)
						reference := fmt.Sprintf(`{ $$typeof: CLIENT_REFERENCE, $$id: %q, async: true }`, id)

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

func newServerModulesServerPlugin(serverModules map[string]module_graph.Module) esbuild.Plugin {
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

					isCode, loader := module_graph.IsCodeModule(args.Path)
					if !isCode {
						return esbuild.OnLoadResult{}, nil
					}

					bytes, err := os.ReadFile(args.Path)
					if err != nil {
						return esbuild.OnLoadResult{}, err
					}

					transformed := esbuild.Transform(string(bytes), esbuild.TransformOptions{
						Format:     esbuild.FormatESModule,
						JSX:        esbuild.JSXAutomatic,
						Loader:     loader,
						Sourcefile: args.Path,
						Target:     esbuild.ESNext,
					})

					if len(transformed.Errors) > 0 {
						return esbuild.OnLoadResult{
							Errors: transformed.Errors,
						}, nil
					}

					// TODO: fork "github.com/tdewolff/parse/v2/js" and optimize parse for *just* directives, imports and exports
					// measure performance before and after
					ast, err := js.Parse(parse.NewInputBytes(transformed.Code), js.Options{})
					if err != nil {
						return esbuild.OnLoadResult{}, err
					}

					contents := ""

					exportsMap := map[string]bool{}
					for _, export := range serverModule.Exports {
						exportsMap[export] = true
					}

					seenExports := map[string]bool{}
					for _, node := range ast.List {
						switch node := node.(type) {
						case *js.ExportStmt:
							contents += node.JS() + ";"

							if node.Default {
								continue
							} else if node.List != nil {
								for _, export := range node.List {
									if export.Binding != nil {
										symbol := ""
										if export.Name != nil {
											symbol = string(export.Name)
										} else {
											symbol = string(export.Binding)
										}
										if symbol != "" {
											if _, ok := exportsMap[string(export.Binding)]; ok {
												if _, seen := seenExports[symbol]; !seen {
													seenExports[symbol] = true

													id := fmt.Sprintf(`%s#%s`, serverModule.Hash, export.Binding)

													contents += fmt.Sprintf("if (typeof %s === 'function') {", symbol)
													contents += fmt.Sprintf("Object.defineProperties(%s, {", symbol)
													contents += "$$typeof: { value: Symbol.for('react.server.reference') },"
													contents += fmt.Sprintf("$$id: { value: %q },", id)
													contents += "});"
													contents += "}"
												}
											}
										}
									}
								}
							}

						default:
							contents += node.JS() + ";"
						}
					}

					return esbuild.OnLoadResult{
						Contents:   &contents,
						ResolveDir: path.Dir(args.Path),
						Loader:     esbuild.LoaderJS,
					}, nil
				},
			)
		},
	}
}
