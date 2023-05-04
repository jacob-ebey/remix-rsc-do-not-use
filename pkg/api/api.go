package api

import (
	"fmt"
	"os"
	"path/filepath"

	esbuild "github.com/evanw/esbuild/pkg/api"

	"github.com/jacob-ebey/fast-remix/internal/bundle"
	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

type Resolver = module_graph.Resolver
type ModulePlatform = bundle.ModulePlatform

var ModulePlatformNode ModulePlatform = bundle.ModulePlatformNode
var ModulePlatformNeutral ModulePlatform = bundle.ModulePlatformNeutral
var ModulePlatformBrowser ModulePlatform = bundle.ModulePlatformBrowser

type ServerBundle = bundle.ServerBundle
type SSRBundle = bundle.ServerBundle

type BuildOptions struct {
	BrowserEntry     string
	BrowserOutput    string
	Production       bool
	PublicPath       string
	Routes           map[string]*RouteConfig
	ServerBundles    []ServerBundle
	SSRBundles       []SSRBundle
	WorkingDirectory string
}

func Build(options BuildOptions) error {
	moduleGraphByBundle := make(map[string]*module_graph.ModuleGraph)

	serverBundlesByName := make(map[string]ServerBundle)
	for _, bundle := range options.ServerBundles {
		serverBundlesByName[bundle.Name] = bundle
		go func() {
			defer bundle.Resolver.Stop()
			err := bundle.Resolver.Start()
			if err != nil {
				fmt.Println("could not start resolver: " + err.Error())
				panic(err)
			}
		}()
		entries := []string{}
		for _, routeID := range bundle.RouteIDs {
			entries = append(entries, options.Routes[routeID].Filename)
		}
		moduleGraph, err := module_graph.BuildModuleGraph(
			options.WorkingDirectory,
			entries,
			bundle.Resolver,
		)
		if err != nil {
			return err
		}

		moduleGraphByBundle[bundle.Name] = moduleGraph

	}

	browserEntries := []string{}
	clientModules := map[string]module_graph.Module{}
	serverModules := map[string]module_graph.Module{}
	for _, bundle := range moduleGraphByBundle {
		for clientModulePath, clientModule := range bundle.ClientModules {
			browserEntries = append(browserEntries, clientModulePath)
			clientModules[clientModulePath] = clientModule
		}
		for serverModulePath, serverModule := range bundle.ServerModules {
			serverModules[serverModulePath] = serverModule
		}
	}

	var browserBuildResult *esbuild.BuildResult
	if len(browserEntries) > 0 {
		if options.BrowserEntry == "" {
			return fmt.Errorf("'use client' directive found but no client entry was specified")
		}

		browserEntries = append([]string{options.BrowserEntry}, browserEntries...)

		var bundleError error
		browserBuildResult, bundleError = bundle.BundleBrowser(
			browserEntries,
			clientModules,
			serverModules,
			options.WorkingDirectory,
			options.BrowserOutput,
			options.PublicPath,
			options.Production,
		)
		if bundleError != nil {
			return bundleError
		}

		if browserBuildResult.Metafile == "" {
			return fmt.Errorf("no metafile was generated for the browser bundle")
		}
	}

	browserManifest := "{}"
	if browserBuildResult != nil {
		var err error
		browserManifest, err = bundle.CreateBrowserManifest(
			options.WorkingDirectory,
			options.BrowserOutput,
			options.PublicPath,
			browserBuildResult.Metafile,
			options.BrowserEntry,
			clientModules,
		)
		if err != nil {
			return err
		}
	}

	serverBuildResults := make(map[string]*esbuild.BuildResult, len(options.ServerBundles))
	for _, serverBundle := range options.ServerBundles {
		moduleGraph := moduleGraphByBundle[serverBundle.Name]
		buildResult, err := bundle.BundleServer(
			serverBundle,
			moduleGraph.ClientModules,
			moduleGraph.ServerModules,
			browserManifest,
			options.WorkingDirectory,
			options.Production,
		)
		if err != nil {
			return err
		}
		serverBuildResults[serverBundle.Name] = buildResult
	}

	// serverBundle := serverBundlesByName[name]
	for _, file := range browserBuildResult.OutputFiles {
		err := os.MkdirAll(filepath.Dir(file.Path), 0755)
		if err != nil {
			return err
		}
		err = os.WriteFile(file.Path, file.Contents, 0644)
		if err != nil {
			return err
		}
	}

	for _, serverBuildResult := range serverBuildResults {
		for _, file := range serverBuildResult.OutputFiles {
			err := os.MkdirAll(filepath.Dir(file.Path), 0755)
			if err != nil {
				return err
			}
			err = os.WriteFile(file.Path, file.Contents, 0644)
			if err != nil {
				return err
			}
		}
	}

	// fmt.Println(esbuild.AnalyzeMetafile(browserBuildResult.Metafile, esbuild.AnalyzeMetafileOptions{
	// 	Color:   true,
	// 	Verbose: false,
	// }))

	return nil
}
