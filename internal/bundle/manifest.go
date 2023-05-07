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
	Name   string   `json:"name"`
	Id     string   `json:"id"`
	Chunks []string `json:"chunks"`
	Async  bool     `json:"async"`
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

		chunks := []string{}
		for _, imp := range output.Imports {
			if imp.Kind != "import-statement" {
				continue
			}
			rel, err := filepath.Rel(browserOutput, filepath.Join(workingDirectory, imp.Path))
			if err != nil {
				return "", err
			}
			chunks = append(chunks, publicPath+rel)
		}

		if entryPoint == browserEntry {
			outputFilepath := filepath.Join(workingDirectory, outputFile)
			rel, err := filepath.Rel(browserOutput, outputFilepath)
			if err != nil {
				return "", err
			}
			module := publicPath + rel

			manifest["browser-entry"] = browserManifestEntry{
				Id:     module,
				Chunks: chunks,
			}
			continue
		}

		clientModule, hasClientModule := clientModules[entryPoint]
		if !hasClientModule {
			continue
		}

		for _, export := range clientModule.Exports {
			id := clientModule.Hash + "#" + export
			manifest[id] = browserManifestEntry{
				Name:   export,
				Id:     clientModule.Hash,
				Chunks: append([]string{clientModule.Hash}, chunks...),
				Async:  true,
			}
		}
	}

	manifestString, err := json.Marshal(manifest)
	if err != nil {
		return "", err
	}

	return string(manifestString), nil
}
