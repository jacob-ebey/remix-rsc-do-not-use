package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gobwas/glob"

	"github.com/jacob-ebey/fast-remix/internal/module_graph"
	"github.com/jacob-ebey/fast-remix/pkg/api"
)

func main() {
	flags := flag.NewFlagSet(os.Args[0], flag.ExitOnError)

	cwd, _ := os.Getwd()
	workingDirectory := ""
	flags.StringVar(&workingDirectory, "wd", cwd, "working directory (default: current directory)")

	appDirectory := ""
	flags.StringVar(&appDirectory, "app", "app", "app directory (default: app)")

	browserEntry := ""
	flags.StringVar(&browserEntry, "browser", "", "client entry (default: app/entry.browser)")

	browserOutput := ""
	flags.StringVar(&browserOutput, "browser-output", "", "client output (default: public/build)")

	publicPath := ""
	flags.StringVar(&publicPath, "public", "", "public path (default: /build/)")

	var serverBundleFlags arrayFlags
	flags.Var(&serverBundleFlags, "server", "<name>:<glob> (default: remix:*)")

	var serverBundleEntryFlags arrayFlags
	flags.Var(&serverBundleEntryFlags, "server-entry", "<name>:<path> (default: app/entry.server)")

	var serverBundlePlatformFlags arrayFlags
	flags.Var(&serverBundlePlatformFlags, "server-platform", "<name>:<platform> (default: node | options: node, neutral, browser)")

	var serverBundleOutputFlags arrayFlags
	flags.Var(&serverBundleOutputFlags, "server-output", "<name>:<path> (default: build/<name>.js)")

	var serverBundleConditionFlags arrayFlags
	flags.Var(&serverBundleConditionFlags, "server-conditions", "<name>:<condition>,<condition> (default: remix:react-server,node,import,require,default)")

	var serverBundleMainFieldFlags arrayFlags
	flags.Var(&serverBundleMainFieldFlags, "server-main-fields", "<name>:<field>,<field> (default: remix:main)")

	if err := flags.Parse(os.Args[1:]); err != nil {
		fmt.Println("error parsing flags")
		os.Exit(1)
	}

	resolvedWorkingDirectory, err := filepath.Abs(workingDirectory)
	if err != nil || workingDirectory == "" {
		fmt.Println("could not determine working directory")
		os.Exit(1)
	}
	workingDirectory = resolvedWorkingDirectory

	appDirectory, err = filepath.Abs(filepath.Join(workingDirectory, appDirectory))
	if err != nil || appDirectory == "" {
		fmt.Println("could not resolve app directory")
		os.Exit(1)
	}

	if browserOutput == "" {
		browserOutput = filepath.Join(workingDirectory, "public", "build")
	} else {
		browserOutput, err = filepath.Abs(filepath.Join(workingDirectory, browserOutput))
		if err != nil {
			fmt.Println("could not resolve browser output")
			os.Exit(1)
		}
	}

	if publicPath == "" {
		publicPath = "/build/"
	}

	routes, err := api.FlatRoutes(appDirectory)
	if err != nil {
		fmt.Println("could not load routes from app directory:", err.Error())
		os.Exit(1)
	}

	if browserEntry == "" {
		browserEntry = module_graph.FindFileWithCodeExtension(filepath.Join(appDirectory, "entry.browser"))
	}

	serverBundles := parseServerBundleFlags(
		workingDirectory,
		appDirectory,
		serverBundleFlags,
		serverBundleEntryFlags,
		serverBundlePlatformFlags,
		serverBundleOutputFlags,
		serverBundleConditionFlags,
		serverBundleMainFieldFlags,
		routes,
	)

	args := flags.Args()

	command := ""
	if len(args) > 0 {
		command = args[0]
	}

	switch command {
	case "build":
		start := time.Now()
		err := api.Build(api.BuildOptions{
			BrowserEntry:     browserEntry,
			BrowserOutput:    browserOutput,
			Production:       false,
			PublicPath:       publicPath,
			Routes:           routes,
			ServerBundles:    serverBundles,
			WorkingDirectory: workingDirectory,
		})
		if err != nil {
			fmt.Println(err.Error())
			fmt.Println("build time: " + time.Since(start).String())
			os.Exit(1)
		}
		fmt.Println("build time: " + time.Since(start).String())
		os.Exit(0)

	case "":
		fmt.Println("no command specified")
		os.Exit(1)

	default:
		fmt.Println("unknown command: " + command)
		os.Exit(1)
	}
}

type arrayFlags []string

func (i *arrayFlags) String() string {
	return strings.Join(*i, ", ")
}

func (i *arrayFlags) Set(value string) error {
	*i = append(*i, value)
	return nil
}

func parseServerBundleFlags(
	workingDirectory string,
	appDirectory string,
	serverBundleFlags []string,
	serverBundleEntryFlags []string,
	serverBundlePlatformFlags []string,
	serverBundleOutputFlags []string,
	serverBundleConditionFlags []string,
	serverBundleMainFieldFlags []string,
	routes map[string]*api.RouteConfig,
) []api.ServerBundle {
	defaultEntryPoint := module_graph.FindFileWithCodeExtension(filepath.Join(appDirectory, "entry.server"))

	if len(serverBundleFlags) == 0 {
		serverBundleFlags = []string{"remix:routes/*"}
	}

	bundles := make(map[string]api.ServerBundle, len(serverBundleFlags))

	routeIDs := make([]string, len(routes))
	for k := range routes {
		routeIDs = append(routeIDs, k)
	}

	for _, serverBundleFlag := range serverBundleFlags {
		parts := strings.Split(serverBundleFlag, ":")
		if len(parts) != 2 {
			fmt.Println("invalid server bundle flag: " + serverBundleFlag)
			os.Exit(1)
		}

		g := glob.MustCompile(parts[1])

		routesToBundle := make(map[string]bool)
		for _, routeID := range routeIDs {
			if g.Match(routeID) {
				for curID := routeID; curID != ""; {
					routesToBundle[curID] = true
					curID = routes[curID].ParentID
				}
			}
		}

		defaultOutput := filepath.Join(workingDirectory, "build/"+parts[0]+"-server")

		bundle, ok := bundles[parts[0]]
		if ok {
			for _, routeId := range bundle.RouteIDs {
				routesToBundle[routeId] = true
			}
			routeIDs := []string{}
			for routeID := range routesToBundle {
				routeIDs = append(routeIDs, routeID)
			}
			bundle.RouteIDs = routeIDs
		} else {
			routeIDs := []string{}
			for routeID := range routesToBundle {
				routeIDs = append(routeIDs, routeID)
			}
			bundle = api.ServerBundle{
				EntryPoint: defaultEntryPoint,
				Name:       parts[0],
				Output:     defaultOutput,
				Platform:   api.ModulePlatformNode,
				RouteIDs:   routeIDs,
			}
		}

		bundles[parts[0]] = bundle
	}

	for _, serverBundleEntryFlags := range serverBundleEntryFlags {
		parts := strings.Split(serverBundleEntryFlags, ":")
		if len(parts) != 2 {
			fmt.Println("invalid server bundle entry flag: " + serverBundleEntryFlags)
			os.Exit(1)
		}

		bundle, ok := bundles[parts[0]]
		if !ok {
			fmt.Println("entry specified for unknown server bundle: " + parts[0])
			os.Exit(1)
		}

		resolved := filepath.Join(workingDirectory, parts[1])
		bundle.EntryPoint = resolved
		bundles[parts[0]] = bundle
	}

	for _, serverBundlePlatformFlag := range serverBundlePlatformFlags {
		parts := strings.Split(serverBundlePlatformFlag, ":")
		if len(parts) != 2 || (parts[1] != string(api.ModulePlatformBrowser) && parts[1] != string(api.ModulePlatformNeutral) && parts[1] != string(api.ModulePlatformNode)) {
			fmt.Println("invalid server bundle platform flag: " + serverBundlePlatformFlag)
			os.Exit(1)
		}

		bundle, ok := bundles[parts[0]]
		if !ok {
			fmt.Println("platform specified for unknown server bundle: " + parts[0])
			os.Exit(1)
		}

		bundle.Platform = api.ModulePlatform(parts[1])
		bundles[parts[0]] = bundle
	}

	seenOutputs := make(map[string]bool)
	for _, serverBundleOutputFlag := range serverBundleOutputFlags {
		parts := strings.Split(serverBundleOutputFlag, ":")
		if len(parts) != 2 {
			fmt.Println("invalid server bundle output flag: " + serverBundleOutputFlag)
			os.Exit(1)
		}

		bundle, ok := bundles[parts[0]]
		if !ok {
			fmt.Println("platform specified for unknown server bundle: " + parts[0])
			os.Exit(1)
		}

		resolvedOutput, err := filepath.Abs(filepath.Join(workingDirectory, parts[1]))
		if err != nil || resolvedOutput == "" {
			fmt.Println("could not determine bundle output directory")
			os.Exit(1)
		}

		if seenOutputs[resolvedOutput] {
			fmt.Println("duplicate bundle output directory: " + resolvedOutput)
			os.Exit(1)
		}

		bundle.Output = resolvedOutput
		bundles[parts[0]] = bundle
	}

	bundleResolverOptions := make(map[string]module_graph.EnhancedResolverOptions)
	for name := range bundles {
		bundleResolverOptions[name] = module_graph.EnhancedResolverOptions{
			CWD:            workingDirectory,
			Conditions:     []string{"react-server", "node", "import", "require", "default"},
			Extensions:     []string{".js", ".mjs", ".cjs", ".json", ".node"},
			ExtensionAlias: []string{".js:.js,.jsx,.ts,.tsx", ".mjs:.mjs,.mts,.mtsx", ".cjs:.cjs,.cts"},
			MainFields:     []string{"main"},
		}
	}

	for _, serverBundleConditionFlag := range serverBundleConditionFlags {
		parts := strings.Split(serverBundleConditionFlag, ":")
		if len(parts) != 2 {
			fmt.Println("invalid server bundle condition flag: " + serverBundleConditionFlag)
			os.Exit(1)
		}

		resolver, ok := bundleResolverOptions[parts[0]]
		if !ok {
			fmt.Println("condition specified for unknown server bundle: " + parts[0])
			os.Exit(1)
		}

		resolver.Conditions = strings.Split(parts[1], ",")
		bundleResolverOptions[parts[0]] = resolver
	}

	for _, serverBundleMainFieldFlag := range serverBundleMainFieldFlags {
		parts := strings.Split(serverBundleMainFieldFlag, ":")
		if len(parts) != 2 {
			fmt.Println("invalid server bundle main field flag: " + serverBundleMainFieldFlag)
			os.Exit(1)
		}

		resolver, ok := bundleResolverOptions[parts[0]]
		if !ok {
			fmt.Println("main field specified for unknown server bundle: " + parts[0])
			os.Exit(1)
		}

		resolver.MainFields = strings.Split(parts[1], ",")
		bundleResolverOptions[parts[0]] = resolver
	}

	results := []api.ServerBundle{}
	for _, bundle := range bundles {
		if bundle.EntryPoint == "" {
			fmt.Println("missing entry point for server bundle: " + bundle.Name)
			os.Exit(1)
		}

		resolver, err := module_graph.NewEnhancedResolver(bundleResolverOptions[bundle.Name])
		if err != nil {
			fmt.Println("could not create resolver: " + err.Error())
			os.Exit(1)
		}

		bundle.Resolver = resolver
		results = append(results, bundle)
	}

	return results
}
