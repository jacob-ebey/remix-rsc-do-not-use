package bundle

import (
	esbuild "github.com/evanw/esbuild/pkg/api"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

type ModulePlatform string

var ModulePlatformNode ModulePlatform = "node"
var ModulePlatformNeutral ModulePlatform = "neutral"
var ModulePlatformBrowser ModulePlatform = "browser"

type RouteConfig struct {
	Filename string
	ID       string
	Index    bool
	ParentID string
	Path     string
}

func (platform ModulePlatform) ToESBuild() esbuild.Platform {
	switch platform {
	case ModulePlatformNode:
		return esbuild.PlatformNode
	case ModulePlatformNeutral:
		return esbuild.PlatformNeutral
	case ModulePlatformBrowser:
		return esbuild.PlatformBrowser
	default:
		panic("Unknown platform")
	}
}

type ServerBundle struct {
	EntryPoint string
	Name       string
	Output     string
	Platform   ModulePlatform
	RouteIDs   []string
	Resolver   module_graph.Resolver
}

type SSRBundle struct {
}
