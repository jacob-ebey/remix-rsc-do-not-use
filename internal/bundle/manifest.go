package bundle

import (
	"encoding/json"
	"path/filepath"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

type metafileImport struct {
	Path     string `json:"path"`
	Kind     string `json:"kind"`
	External bool   `json:"external"`
}

type MetafileOutput struct {
	EntryPoint string           `json:"entryPoint"`
	Exports    []string         `json:"exports"`
	Imports    []metafileImport `json:"imports"`
}

type Metafile struct {
	Outputs map[string]MetafileOutput `json:"outputs"`
}

type browserManifestEntry struct {
	Module  string   `json:"module"`
	Imports []string `json:"imports"`
}

func CreateBrowserManifest(
	workingDirectory string,
	browserOutput string,
	publicPath string,
	metafileString string,
	browserEntry string,
	clientModules map[string]module_graph.Module,
) (string, error) {
	var metafile Metafile
	err := json.Unmarshal([]byte(metafileString), &metafile)
	if err != nil {
		return "", err
	}

	manifest := make(map[string]browserManifestEntry)
	for outputFile, output := range metafile.Outputs {
		if output.EntryPoint == "" {
			continue
		}
		entryPoint := filepath.Join(workingDirectory, output.EntryPoint)
		clientModule, hasClientModule := clientModules[entryPoint]
		key := "entry"
		if hasClientModule {
			key = clientModule.Hash
		} else if entryPoint != browserEntry {
			continue
		}

		outputFilepath := filepath.Join(workingDirectory, outputFile)
		rel, err := filepath.Rel(browserOutput, outputFilepath)
		if err != nil {
			return "", err
		}
		module := publicPath + rel

		imports := []string{}
		for _, imp := range output.Imports {
			if imp.Kind != "import-statement" {
				continue
			}
			rel, err := filepath.Rel(browserOutput, filepath.Join(workingDirectory, imp.Path))
			if err != nil {
				return "", err
			}
			imports = append(imports, publicPath+rel)
		}

		manifest[key] = browserManifestEntry{
			Module:  module,
			Imports: imports,
		}
	}

	manifestString, err := json.Marshal(manifest)
	if err != nil {
		return "", err
	}

	return string(manifestString), nil
}
