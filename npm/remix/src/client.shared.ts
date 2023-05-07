import type * as SSRRuntime from "./ssr-runtime.js";

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

export declare function createRemoteFetcher(hostname: string): RemoteFetcher;

export declare function defineRemote<ServerContext = unknown>(
  args: DefineRemoteArgs<ServerContext>
): Remote;
