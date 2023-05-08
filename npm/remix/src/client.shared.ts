import type * as SSRRuntime from "./ssr-runtime.js";

export {
  type Location,
  type Navigation,
  useNavigation,
  useLocation,
  useMatches,
} from "./router.client.js";

export type RemoteFetcher = (request: Request) => Promise<Response>;

export type Remote<ServerContext = unknown> = (
  request: Request,
  serverContext: ServerContext
) => Promise<Response>;

export interface FetcherFactoryArgs<ServerContext = unknown> {
  request: Request;
  serverContext: ServerContext;
}

export type FetcherFactory<ServerContext> = (
  args: FetcherFactoryArgs<ServerContext>
) => RemoteFetcher;

export interface DefineRemoteArgs<ServerContext> {
  fetcherFactory: FetcherFactory<ServerContext>;
  runtime: typeof SSRRuntime;
  onError?(error: unknown): void;
  shouldBuffer?: (userAgent: string) => boolean;
}

export declare function defineRemote<ServerContext = unknown>(
  args: DefineRemoteArgs<ServerContext>
): Remote;

export function createRemoteFetcher(hostname: string): RemoteFetcher {
  return (request) => {
    const url = new URL(request.url);
    url.hostname = hostname;
    url.searchParams.set("_rsc", "1");

    return fetch(url, request);
  };
}
