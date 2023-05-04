package api

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
)

var routeFiles = []string{"index", "route"}

func FlatRoutes(appDirectory string) (map[string]*RouteConfig, error) {
	routesDirectory := filepath.Join(appDirectory, "routes")

	routeEntries, err := os.ReadDir(routesDirectory)
	if err != nil {
		return nil, fmt.Errorf("could not read routes directory: %s", routesDirectory)
	}

	routeFiles := []string{}
	for _, routeEntry := range routeEntries {
		if routeEntry.IsDir() {
			routeFile := findRouteFileInDirectory(filepath.Join(routesDirectory, routeEntry.Name()))

			if routeFile != "" {
				routeFiles = append(routeFiles, routeFile)
			}

			continue
		}

		routeFilename := routeEntry.Name()
		if !module_graph.HasCodeExtension(routeFilename) {
			continue
		}

		routeFiles = append(routeFiles, filepath.Join(routesDirectory, routeFilename))
	}

	routeIDs := []string{}
	routeFileById := map[string]string{}
	for _, routeFile := range routeFiles {
		routeID := strings.TrimPrefix(routeFile, routesDirectory)
		routeID = routeID[1 : len(routeID)-len(filepath.Ext(routeID))]
		routeID = strings.ReplaceAll(routeID, string(filepath.Separator), "/")
		splitOnSlash := strings.Split(routeID, "/")

		routeID = splitOnSlash[0]
		routeIDs = insertSortedByLengthDescending(routeIDs, routeID)
		routeFileById[routeID] = routeFile
	}

	routeManifest := map[string]*RouteConfig{}

	chars := make(map[string]*routePrefixTrieNode)
	prefixTrie := &routePrefixTrieNode{
		end:   false,
		chars: &chars,
	}
	for _, routeID := range routeIDs {
		index := strings.HasSuffix(routeID, "_index")
		routeSegments, rawRouteSegments, err := getRouteSegments(routeID)
		if err != nil {
			return nil, err
		}

		path := createRoutePath(routeSegments, rawRouteSegments, index)

		fullRouteID := "routes/" + routeID
		routeManifest[fullRouteID] = &RouteConfig{
			Filename: routeFileById[routeID],
			ID:       fullRouteID,
			Index:    index,
			Path:     path,
		}

		childIDs := prefixTrie.findAndRemove(routeID)
		prefixTrie.add(routeID)

		for _, childID := range childIDs {
			child := routeManifest["routes/"+childID]
			child.ParentID = fullRouteID
		}
	}

	for _, routeID := range routeIDs {
		route, ok := routeManifest["routes/"+routeID]
		if !ok {
			return nil, fmt.Errorf("could not find route with id: %s", routeID)
		}
		if route.ParentID != "" {
			parent, ok := routeManifest[route.ParentID]
			if !ok {
				return nil, fmt.Errorf("could not find route with id: %s", route.ParentID)
			}
			ogPath := route.Path
			path := ogPath
			if parent.Path != "" && route.Path != "" {
				path = strings.TrimPrefix(path, parent.Path)
				path = strings.TrimPrefix(path, "/")
				path = strings.TrimSuffix(path, "/")
			}
			route.Path = path
			routeManifest["routes/"+routeID] = route
		}
	}

	rootFilepath := module_graph.FindFileWithCodeExtension(filepath.Join(appDirectory, "root"))
	if rootFilepath != "" {
		for _, routeConfig := range routeManifest {
			if routeConfig.ParentID == "" {
				routeConfig.ParentID = "root"
			}
		}
		routeManifest["root"] = &RouteConfig{
			Filename: rootFilepath,
			ID:       "root",
			Path:     "",
		}
	}

	return routeManifest, nil
}

func findRouteFileInDirectory(directory string) string {
	for _, routeFile := range routeFiles {
		routeFilePath := module_graph.FindFileWithCodeExtension(filepath.Join(directory, routeFile))
		if routeFilePath != "" {
			return routeFilePath
		}
	}

	return ""
}

func insertSortedByLengthDescending(ss []string, s string) []string {
	i := sort.Search(len(ss), func(i int) bool { return len(ss[i]) <= len(s) })
	ss = append(ss, "")
	copy(ss[i+1:], ss[i:])
	ss[i] = s
	return ss
}

type routePrefixTrieNode struct {
	end   bool
	chars *map[string]*routePrefixTrieNode
}

func (n *routePrefixTrieNode) add(s string) error {
	if len(s) == 0 {
		return fmt.Errorf("cannot add empty string to prefix trie")
	}

	c := n
	for _, c1 := range s {
		char := string(c1)
		var next *routePrefixTrieNode
		chars := *c.chars
		if n, ok := chars[char]; ok {
			next = n
		} else {
			newChars := make(map[string]*routePrefixTrieNode)
			next = &routePrefixTrieNode{
				end:   false,
				chars: &newChars,
			}
			chars[char] = next
		}
		c = next
	}
	c.end = true

	return nil
}

func (n *routePrefixTrieNode) findAndRemove(prefix string) []string {
	c := n
	for _, c1 := range prefix {
		char := string(c1)
		chars := *c.chars
		if next := chars[char]; next != nil {
			c = next
		} else {
			return []string{}
		}
	}
	values := []string{}
	return findAndRemoveRecursive(values, c, prefix, prefix)
}

func findAndRemoveRecursive(values []string, n *routePrefixTrieNode, prefix string, og string) []string {
	chars := *n.chars
	for char, next := range chars {
		values = findAndRemoveRecursive(values, next, prefix+string(char), og)
	}

	if n.end && isValidRouteChild(og, prefix) {
		n.end = false
		values = append(values, prefix)
	}

	return values
}

func isValidRouteChild(routeID string, value string) bool {

	c := string(strings.TrimPrefix(value, routeID)[0])

	return c == "." || c == "/"
}

func createRoutePath(
	routeSegments []string,
	rawRouteSegments []string,
	isIndex bool,
) string {
	result := []string{}

	if isIndex {
		routeSegments = routeSegments[:len(routeSegments)-1]
	}

	for i, segment := range routeSegments {
		rawSegment := rawRouteSegments[i]

		if strings.HasPrefix(segment, "_") && strings.HasPrefix(rawSegment, "_") {
			continue
		}

		if strings.HasSuffix(segment, "_") && strings.HasSuffix(rawSegment, "_") {
			segment = segment[:len(segment)-1]
		}
		result = append(result, segment)
	}

	if len(result) == 0 {
		return ""
	}

	return strings.Join(result, "/")
}

type parseState int

var NORMAL parseState = 0
var ESCAPE parseState = 1
var OPTIONAL parseState = 2
var OPTIONAL_ESCAPE parseState = 3

var ESCAPE_START byte = '['
var ESCAPE_END byte = ']'
var PARAM_PREFIX byte = '$'
var OPTIONAL_START byte = '('
var OPTIONAL_END byte = ')'

var UNSUPPORTED_ROUTER_CHAR_ERROR_TEXT = `Route segment "%s" for "%s" cannot contain "%s".\n` +
	`If this is something you need, upvote this proposal for React Router https://github.com/remix-run/react-router/discussions/9822.`

func getRouteSegments(routeID string) ([]string, []string, error) {
	routeSegments := []string{}
	rawRouteSegments := []string{}
	routeSegment := ""
	rawRouteSegment := ""
	state := NORMAL

	appendRouteSegment := func(routeSegment string, rawRouteSegment string) error {
		if routeSegment == "" {
			return nil
		}

		if strings.Contains(rawRouteSegment, "*") {
			return fmt.Errorf(UNSUPPORTED_ROUTER_CHAR_ERROR_TEXT, rawRouteSegment, routeID, "*")
		}
		if strings.Contains(rawRouteSegment, ":") {
			return fmt.Errorf(UNSUPPORTED_ROUTER_CHAR_ERROR_TEXT, rawRouteSegment, routeID, ":")
		}
		if strings.Contains(rawRouteSegment, "/") {
			return fmt.Errorf(UNSUPPORTED_ROUTER_CHAR_ERROR_TEXT, rawRouteSegment, routeID, "/")
		}

		routeSegments = append(routeSegments, routeSegment)
		rawRouteSegments = append(rawRouteSegments, rawRouteSegment)

		return nil
	}

	for i := 0; i < len(routeID); {
		char := routeID[i]
		i++

		switch state {
		case NORMAL:
			if isSegmentSeparator(char) {
				appendRouteSegment(routeSegment, rawRouteSegment)
				routeSegment = ""
				rawRouteSegment = ""
				state = NORMAL
				break
			}
			if char == ESCAPE_START {
				state = ESCAPE
				rawRouteSegment += string(char)
				break
			}
			if char == OPTIONAL_START {
				state = OPTIONAL
				rawRouteSegment += string(char)
				break
			}
			if routeSegment == "" && char == PARAM_PREFIX {
				if i == len(routeID) {
					routeSegment += "*"
					rawRouteSegment += string(char)
				} else {
					routeSegment += ":"
					rawRouteSegment += string(char)
				}
				break
			}
			routeSegment += string(char)
			rawRouteSegment += string(char)

		case ESCAPE:
			if char == ESCAPE_END {
				state = NORMAL
				rawRouteSegment += string(char)
				break
			}
			routeSegment += string(char)
			rawRouteSegment += string(char)

		case OPTIONAL:
			if char == OPTIONAL_END {
				routeSegment += "?"
				rawRouteSegment += string(char)
				state = NORMAL
				break
			}
			if char == ESCAPE_START {
				state = OPTIONAL_ESCAPE
				rawRouteSegment += string(char)
				break
			}
			if routeSegment == "" && char == PARAM_PREFIX {
				if i == len(routeID) {
					routeSegment += "*"
					rawRouteSegment += string(char)
				} else {
					routeSegment += ":"
					rawRouteSegment += string(char)
				}
				break
			}
			routeSegment += string(char)
			rawRouteSegment += string(char)

		case OPTIONAL_ESCAPE:
			if char == ESCAPE_END {
				state = OPTIONAL
				rawRouteSegment += string(char)
				break
			}
			routeSegment += string(char)
			rawRouteSegment += string(char)
		}
	}

	appendRouteSegment(routeSegment, rawRouteSegment)
	return routeSegments, rawRouteSegments, nil
}

func isSegmentSeparator(char byte) bool {
	return char == '.' || char == '/' || char == '\\'
}
