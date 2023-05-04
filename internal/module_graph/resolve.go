package module_graph

import (
	"embed"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"sync"

	"github.com/zealic/go2node"
)

type Resolver interface {
	ResolveImport(importPath string, importerPath string) (string, error)
	Start() error
	Stop() error
}

type resolveRequest struct {
	id           string
	importPath   string
	importerPath string
	resultChan   chan string
	errChan      chan error
}

//go:embed dist/resolve.js
var resolveScript embed.FS

type enhancedResolver struct {
	id         int
	idLock     *sync.Mutex
	conditions []string
	extensions []string
	// TODO: Make this a map[string][]string
	extensionAlias []string
	mainFields     []string
	cwd            string
	doneChan       chan bool
	requests       chan resolveRequest
	cmd            *exec.Cmd
}

type EnhancedResolverOptions struct {
	Conditions     []string
	CWD            string
	Extensions     []string
	ExtensionAlias []string
	MainFields     []string
}

func NewEnhancedResolver(options EnhancedResolverOptions) (Resolver, error) {
	return &enhancedResolver{
		conditions:     options.Conditions,
		cwd:            options.CWD,
		extensions:     options.Extensions,
		extensionAlias: options.ExtensionAlias,
		mainFields:     options.MainFields,
		id:             0,
		idLock:         &sync.Mutex{},
		doneChan:       make(chan bool),
		requests:       make(chan resolveRequest),
	}, nil
}

func (r *enhancedResolver) Start() error {
	r.requests = make(chan resolveRequest)
	if r.cmd != nil {
		return fmt.Errorf("resolver already running")
	}

	scriptBytes, err := resolveScript.ReadFile("dist/resolve.js")
	if err != nil {
		return err
	}

	flags := []string{"-e", string(scriptBytes), " -- ", "--cwd", r.cwd}

	for _, condition := range r.conditions {
		flags = append(flags, "--condition", condition)
	}
	for _, extension := range r.extensions {
		flags = append(flags, "--extension", extension)
	}
	for _, extensionAlias := range r.extensionAlias {
		flags = append(flags, "--extension-alias", extensionAlias)
	}
	for _, mainField := range r.mainFields {
		flags = append(flags, "--main-field", mainField)
	}

	cmd := exec.Command("node", flags...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	r.cmd = cmd

	node, err := go2node.ExecNode(cmd)
	if err != nil {
		return err
	}

	resultChansLock := sync.Mutex{}
	resultChans := make(map[string]resolveRequest)

	go func() {
		for {
			msg, err := node.Read()
			if err != nil {
				fmt.Println("FAILED TO READ", err)
				panic(err)
			}
			data := make(map[string]string)
			err = msg.Unmarshal(&data)
			if err != nil {
				panic(err)
			}

			responseId, ok := data["id"]
			if !ok {
				panic("Missing id")
			}

			resultChansLock.Lock()
			request, ok := resultChans[responseId]
			resultChansLock.Unlock()
			if !ok {
				panic("Unknown request id")
			}

			resolved, ok := data["resolved"]
			if !ok {
				errMsg, ok := data["error"]
				if !ok {
					request.errChan <- fmt.Errorf("unknown error")
				} else {
					request.errChan <- fmt.Errorf(errMsg)
				}
			}
			request.resultChan <- resolved
		}
	}()

	for {
		select {
		case <-r.doneChan:
			return nil
		case request := <-r.requests:
			resultChansLock.Lock()
			resultChans[request.id] = request
			resultChansLock.Unlock()
			requestJSON, err := json.Marshal(map[string]string{
				"id":           request.id,
				"importPath":   request.importPath,
				"importerPath": request.importerPath,
			})
			if err != nil {
				return err
			}

			err = node.Write(&go2node.NodeMessage{
				Message: requestJSON,
			})
			if err != nil {
				fmt.Println("could not write to node process: " + err.Error())
				panic(err)
			}
		}
	}
}

func (r *enhancedResolver) Stop() error {
	r.doneChan <- true
	close(r.requests)
	if r.cmd == nil {
		return fmt.Errorf("resolver not running")
	}
	err := r.cmd.Process.Kill()
	r.cmd = nil
	return err
}

func (r *enhancedResolver) ResolveImport(importPath string, importerPath string) (string, error) {
	r.idLock.Lock()
	id := fmt.Sprint(r.id)
	r.id += 1
	r.idLock.Unlock()
	resultChan := make(chan string, 1)
	errChan := make(chan error, 1)
	r.requests <- resolveRequest{
		id:           id,
		importPath:   importPath,
		importerPath: importerPath,
		resultChan:   resultChan,
		errChan:      errChan,
	}

	select {
	case resolved := <-resultChan:
		close(errChan)
		return resolved, nil
	case err := <-errChan:
		close(resultChan)
		return "", err
	}
}
