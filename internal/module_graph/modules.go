package module_graph

import (
	"os"
	"path/filepath"
	"strings"

	esbuild "github.com/evanw/esbuild/pkg/api"
)

func IsCodeModule(path string) (bool, esbuild.Loader) {
	if strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".mjs") || strings.HasSuffix(path, ".cjs") {
		return true, esbuild.LoaderJS
	} else if strings.HasSuffix(path, ".jsx") {
		return true, esbuild.LoaderJSX
	} else if strings.HasSuffix(path, ".ts") || strings.HasSuffix(path, ".mts") {
		return true, esbuild.LoaderTS
	} else if strings.HasSuffix(path, ".tsx") || strings.HasSuffix(path, ".mtsx") {
		return true, esbuild.LoaderTSX
	} else {
		return false, esbuild.LoaderEmpty
	}
}

func IsStyleModule(path string) bool {
	return strings.HasSuffix(path, ".css")
}

var CodeExtensions = []string{".tsx", ".ts", ".jsx", ".js"}

func FindFileWithCodeExtension(filenameWithoutExt string) string {
	for _, routeExtension := range CodeExtensions {
		routeFilePath := filenameWithoutExt + routeExtension
		if _, err := os.Stat(routeFilePath); err == nil {
			return routeFilePath
		}
	}

	return ""
}

func HasCodeExtension(filename string) bool {
	for _, routeExtension := range CodeExtensions {
		if filepath.Ext(filename) == routeExtension {
			return true
		}
	}

	return false
}
