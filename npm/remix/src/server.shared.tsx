import * as React from "react";
import { ErrorResponse } from "@remix-run/router";

import { getRouterRef, type ServerRoute } from "./router.js";
import type * as ServerRuntime from "./server-runtime.js";

export type {
  BoundaryProps,
  LoadingProps,
  RouteProps,
  ServerRoute,
} from "./router.js";
export { defineMixin } from "./router.js";

export interface CreateRequestContextArgs<ServerContext> {
  request: Request;
  serverContext: ServerContext;
}

export type CreateRequestContext<ServerContext, RequestContext> = (
  args: CreateRequestContextArgs<ServerContext>
) => RequestContext | Promise<RequestContext>;

export type Handler<ServerContext = unknown> = (
  request: Request,
  serverContext: ServerContext
) => Promise<Response>;

export interface DefineHandlerArgs<
  RequestContext = unknown,
  ServerContext = unknown
> {
  basename?: string;
  createRequestContext?: CreateRequestContext<ServerContext, RequestContext>;
  runtime: typeof ServerRuntime;
}

export declare function defineHandler<
  RequestContext = unknown,
  ServerContext = unknown
>(
  args: DefineHandlerArgs<RequestContext, ServerContext>
): Handler<ServerContext>;

export function internal_defineRoute(_route: unknown): unknown {
  const route = _route as ServerRoute;
  let action = route.action;
  let loader = route.loader;

  if (loader || route.mixins) {
    loader = async (args) => {
      const mixinPromises = [];
      const mixins = {};
      const url = new URL(args.request.url);
      for (const [key, mixin] of Object.entries(route.mixins ?? {})) {
        if (mixin.definition.loader) {
          const params = mixin.map({ params: args.params, url });
          const flatParams = Object.entries(params)
            .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
            .flat();
          const mixinRef = mixin.getMixinRef(JSON.stringify(flatParams));
          let promise = mixinRef.current;
          if (!promise) {
            promise = (async () =>
              mixin.definition.loader({
                context: args.context,
                params,
                request: args.request,
              }))();

            mixinRef.current = promise;
          }
          mixinPromises.push(
            promise
              .then((res) => {
                mixins[key] = { params, loaderData: res };
              })
              .catch((error) => {
                mixins[key] = { params, loaderError: error };
              })
          );
        }
      }

      const loaderData = route.loader ? route.loader(args) : null;

      await mixinPromises;

      return {
        loaderData,
        mixins,
      };
    };
  }

  if (action || route.mixins) {
    action = async ({ context, params, request }) => {
      const url = new URL(request.url);

      const mixinKey = url.searchParams.get("_mixin");
      if (mixinKey) {
        const mixin = route.mixins?.[mixinKey];
        if (!mixin?.definition?.action) {
          throw new ErrorResponse(
            405,
            "Method Not Allowed",
            new Error(
              `You made a ${request.method.toUpperCase()} request to "${
                url.pathname
              }" but ` +
                `did not provide an \`action\` for mixin ${mixinKey} on route "${route.id}", ` +
                `so there is no way to handle the request.`
            )
          );
        }

        const mixinResult = await (async () =>
          mixin.definition.action({
            context,
            params: mixin.map({ params, url }),
            request,
          }))()
          .then((actionData) => ({ actionData }))
          .catch((error) => ({ actionError: error }));

        return {
          mixins: { [mixinKey]: mixinResult },
        };
      }

      const actionData = route.action
        ? route.action({ context, params, request })
        : null;

      return {
        actionData,
      };
    };
  }

  return {
    ...route,
    action,
    loader,
  };
}

function requireRouter(name: string) {
  const router = getRouterRef().current;
  if (!router) {
    throw new Error(`${name} must be used within a <Router>`);
  }
  return router;
}

export function matches() {
  const router = requireRouter("matches()");
  return router.matchesToRender;
}

export function url(): URL {
  const router = requireRouter("url()");
  return router.url;
}
