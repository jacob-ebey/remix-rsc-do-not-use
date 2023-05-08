package module_graph

import (
	"crypto/md5"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"

	esbuild "github.com/evanw/esbuild/pkg/api"
	parse "github.com/tdewolff/parse/v2"
	"github.com/tdewolff/parse/v2/js"
)

type Module struct {
	Exports []string
	Hash    string
	Source  string
}

type ModuleGraph struct {
	ClientModules map[string]Module
	ServerModules map[string]Module
}

func BuildModuleGraph(workingDirectory string, entryPoints []string, resolver Resolver) (*ModuleGraph, error) {
	if len(entryPoints) == 0 {
		return nil, fmt.Errorf("no entry points provided")
	}

	modulesLock := sync.RWMutex{}
	clientModules := make(map[string]Module)
	serverModules := make(map[string]Module)
	plugins := []esbuild.Plugin{
		{
			Name: "module-graph",
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

						if resolved == "___external___" {
							return esbuild.OnResolveResult{
								Path:        args.Path,
								External:    true,
								SideEffects: esbuild.SideEffectsFalse,
							}, nil
						}

						return esbuild.OnResolveResult{
							Path:        resolved,
							SideEffects: esbuild.SideEffectsTrue,
						}, nil
					})

				build.OnLoad(
					esbuild.OnLoadOptions{
						Filter: ".*",
					},
					func(args esbuild.OnLoadArgs) (esbuild.OnLoadResult, error) {
						bytes, err := os.ReadFile(args.Path)
						if err != nil {
							return esbuild.OnLoadResult{}, err
						}

						isCode, loader := IsCodeModule(args.Path)
						if !isCode {
							contents := ""
							return esbuild.OnLoadResult{
								Contents: &contents,
								Loader:   esbuild.LoaderEmpty,
							}, nil
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
						clientModule := false
						serverModule := false
						exportsMap := make(map[string]bool)
						for _, node := range ast.List {
							switch node := node.(type) {
							case *js.ImportStmt:
								contents += node.JS() + ";\n"
							case *js.ExportStmt:
								if clientModule || serverModule {
									if node.Default {
										exportsMap["default"] = true
										continue
									}
									if node.List != nil {
										for _, export := range node.List {
											if export.Binding != nil {
												name := string(export.Binding)
												exportsMap[name] = true
											}
										}
									}
								}
							case *js.DirectivePrologueStmt:
								stmt := string(node.Value)
								if stmt == `"use client"` || stmt == "'use client'" {
									clientModule = true
								} else if stmt == `"use server"` || stmt == "'use server'" {
									serverModule = true
								}
							}
						}

						if clientModule || serverModule {
							modulesLock.RLock()
							_, ok := clientModules[args.Path]
							modulesLock.RUnlock()
							if ok {
								moduleType := "client"
								if serverModule {
									moduleType = "server"
								}

								return esbuild.OnLoadResult{}, fmt.Errorf("module %s already defined as %s module", args.Path, moduleType)
							}
						}

						if clientModule && serverModule {
							return esbuild.OnLoadResult{}, fmt.Errorf("module %s cannot be both client and server", args.Path)
						}

						if clientModule || serverModule {
							exports := make([]string, 0, len(exportsMap))
							for name := range exportsMap {
								exports = append(exports, name)
							}
							rel, err := filepath.Rel(workingDirectory, args.Path)
							if err != nil {
								return esbuild.OnLoadResult{}, err
							}
							h := md5.New()
							h.Write([]byte(rel))
							s := h.Sum(nil)
							hash := base64.StdEncoding.EncodeToString(s[:])
							hash = strings.TrimSuffix(hash, "==")
							module := Module{
								Exports: exports,
								Hash:    hash,
								Source:  args.Path,
							}
							if clientModule {
								modulesLock.Lock()
								clientModules[args.Path] = module
								modulesLock.Unlock()
							} else if serverModule {
								modulesLock.Lock()
								serverModules[args.Path] = module
								modulesLock.Unlock()
							}
						}

						return esbuild.OnLoadResult{
							Contents:   &contents,
							Loader:     esbuild.LoaderJS,
							ResolveDir: path.Dir(args.Path),
						}, nil
					},
				)
			},
		},
	}

	buildContext, err := esbuild.Context(esbuild.BuildOptions{
		Bundle:      true,
		EntryPoints: entryPoints,
		Format:      esbuild.FormatESModule,
		JSX:         esbuild.JSXAutomatic,
		Outdir:      "/tmp/fast-remix",
		Platform:    esbuild.PlatformNode,
		Plugins:     plugins,
		Target:      esbuild.ESNext,
		TreeShaking: esbuild.TreeShakingFalse,
		Write:       false,
	})
	if err != nil {
		return nil, err
	}

	buildResult := buildContext.Rebuild()

	if len(buildResult.Errors) > 0 {
		messages := esbuild.FormatMessages(buildResult.Errors, esbuild.FormatMessagesOptions{
			Color: true,
			Kind:  esbuild.ErrorMessage,
		})
		return nil, fmt.Errorf("failed to build module graph:\n%s", strings.Join(messages, "\n"))
	}

	return &ModuleGraph{
		ClientModules: clientModules,
		ServerModules: serverModules,
	}, nil
}
