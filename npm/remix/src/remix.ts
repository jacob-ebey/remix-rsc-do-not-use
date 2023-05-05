import type * as ServerRuntime from "./server-runtime.js";

interface CreateRequestContextArgs<ServerContext> {
  request: Request;
  serverContext: ServerContext;
}

export type CreateRequestContext<ServerContext, RequestContext> = (
  args: CreateRequestContextArgs<ServerContext>
) => RequestContext | Promise<RequestContext>;

export type Handler = (
  request: Request,
  serverContext: unknown
) => Promise<Response>;

export interface DefineHandlerArgs<
  RequestContext = unknown,
  ServerContext = unknown
> {
  runtime: typeof ServerRuntime;
  createRequestContext?: CreateRequestContext<ServerContext, RequestContext>;
  basename?: string;
}

export declare function defineHandler<
  RequestContext = unknown,
  ServerContext = unknown
>(args: DefineHandlerArgs<RequestContext, ServerContext>): Handler;
