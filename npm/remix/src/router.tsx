import * as React from "react";
import type {
  AgnosticDataIndexRouteObject,
  AgnosticDataNonIndexRouteObject,
  Location,
  Params as RemixParams,
  StaticHandler,
  StaticHandlerContext,
} from "@remix-run/router";

import type { CreateRequestContext } from "./server.shared.js";
import {
  type RouterServerContext,
  ReactRouterServerContext,
} from "./router.shared.js";
import type * as ServerRuntime from "./server-runtime.js";

export type inferData<T> = T extends (...args: any[]) => infer U
  ? Awaited<U>
  : T;

export interface RouteProps<Loader = unknown, Action = unknown> {
  outlet: React.ReactNode;
  actionData?: inferData<Action>;
  loaderData: inferData<Loader>;
  location: Location;
  params: RemixParams;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
  mixins: Record<string, MixinInstance>;
}

export interface BoundaryProps<Loader = unknown, Action = unknown> {
  error: unknown;
  actionData?: inferData<Action>;
  loaderData?: inferData<Loader>;
  location: Location;
  params: RemixParams;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
}

export interface LoadingProps<Loader = unknown, Action = unknown> {
  actionData?: inferData<Action>;
  loaderData: inferData<Loader>;
  location: Location;
  params: RemixParams;
}

export interface MixinDataArgs<RequestContext = unknown> {
  context: RequestContext;
  params: RemixParams;
  request: Request;
}

export type MixinAction = (args: MixinDataArgs) => any;
export type MixinLoader = (args: MixinDataArgs) => any;

export type InternalMixinAction = (
  args: MixinDataArgs
) => Promise<[any, RemixParams]>;
export type InternalMixinLoader = (
  args: MixinDataArgs
) => Promise<[any, RemixParams]>;

export interface MixinProps<Loader = unknown, Action = unknown> {
  children?: React.ReactNode;
  actionData?: inferData<Action>;
  loaderData: inferData<Loader>;
  location: Location;
  params: RemixParams;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
}

export interface MixinBoundaryProps<Loader = unknown, Action = unknown> {
  error: unknown;
  actionData?: inferData<Action>;
  loaderData?: inferData<Loader>;
  location: Location;
  params: RemixParams;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
}

export interface MixinInstance {
  Outlet: React.FC<{ children?: React.ReactNode }>;
  params: RemixParams;
  loaderData: any;
  actionData?: any;
}

export interface MappedMixin {
  map: (args: MixinMapArgs) => RemixParams;
  definition: MixinDefinition;
  getMixinRef(params: string): { current: null | Promise<unknown> };
}

export interface MixinMapArgs {
  params: RemixParams;
  url: URL;
}

export interface MixinDefinition<
  Params extends Record<string, string> = RemixParams,
  Loader extends MixinLoader = MixinLoader,
  Action extends MixinAction = MixinAction
> {
  action?: Action;
  loader?: Loader;
  Component?: React.FC<MixinProps<Loader, Action>>;
  Boundary?: React.FC<MixinBoundaryProps<Loader, Action>>;
}

export interface Mixin<Params extends Record<string, string>> {
  map(map?: (args: MixinMapArgs) => Params): MappedMixin;
}

export type ServerRoute = (
  | AgnosticDataIndexRouteObject
  | (Exclude<AgnosticDataNonIndexRouteObject, "children"> & {
      children?: ServerRoute[];
    })
) & {
  Component?: React.FC<RouteProps>;
  Boundary?: React.FC<BoundaryProps>;
  Loading?: React.FC<LoadingProps>;
  mixins?: Record<string, MappedMixin>;
};

interface RouterContextRef {
  current: null | {
    location: Location;
    matchesToRender: StaticHandlerContext["matches"];
    url: URL;
  };
}

export const getRouterRef = React.cache(
  (): RouterContextRef => ({ current: null })
);

export interface RouterProps<
  RequestContext = unknown,
  ServerContext = unknown
> {
  createRequestContext?: CreateRequestContext<ServerContext, RequestContext>;
  request: Request;
  runtime: typeof ServerRuntime;
  serverContext: ServerContext;
  staticHandler: StaticHandler;
  onRequestContext(context: unknown): void;
  onResponseReady(status: number): void;
}

export async function Router({
  createRequestContext,
  request,
  serverContext,
  staticHandler,
  onRequestContext,
  onResponseReady,
}: RouterProps) {
  const requestContext = createRequestContext
    ? await createRequestContext({ request, serverContext })
    : undefined;

  onRequestContext?.(requestContext);

  const context = await staticHandler.query(request, { requestContext });

  const statusCode =
    context instanceof Response ? context.status : context.statusCode;

  if (context instanceof Response) {
    throw context;
  }

  onResponseReady(statusCode);

  const url = new URL(request.url);

  let matchesToRender = context.matches;
  if (context.errors) {
    matchesToRender = [];
    let deepestErrorBoundaryIdx = -1;
    let i = -1;
    for (const match of context.matches) {
      i++;
      if ((match.route as any).Boundary) {
        deepestErrorBoundaryIdx = i;
      }
    }
    if (deepestErrorBoundaryIdx > -1) {
      for (const match of context.matches) {
        matchesToRender.push(match);
        if (context.errors[match.route.id]) {
          break;
        }
      }
    }
  }

  const routerRef = getRouterRef();
  routerRef.current = {
    location: context.location,
    matchesToRender,
    url,
  };

  const routerServerContext = {
    matches: [],
  } as RouterServerContext;

  for (const match of matchesToRender) {
    routerServerContext.matches.push({
      params: match.params,
      pathname: match.pathname,
      pathnameBase: match.pathnameBase,
      route: {
        id: match.route.id,
        path: match.route.path,
        index: match.route.index,
      },
    });
  }

  let element: React.ReactNode = null;
  let errorToHandle = undefined;
  for (let i = matchesToRender.length - 1; i >= 0; i--) {
    const match = matchesToRender[i];
    const remixRoute = match.route as ServerRoute;

    const Form = React.forwardRef<
      HTMLFormElement,
      React.FormHTMLAttributes<HTMLFormElement>
    >((props, ref) => {
      let action = props.action;
      const method = (props.method || "GET").toUpperCase();
      if (!action) {
        const searchParams = new URLSearchParams();
        if (match.route.index && method === "POST") {
          searchParams.set("index", "");
        }
        action = url.pathname + "?" + searchParams.toString();
      }

      return <form {...props} ref={ref} action={action} />;
    });

    const mixinError = Array.from(
      Object.entries(context.loaderData[remixRoute.id]?.mixins || {}) as any
    ).find(([key, mixin]: [any, any]) => {
      return (
        mixin.loaderError &&
        !(match.route as any).mixins?.[key]?.definition?.Boundary
      );
    })?.[1]?.loaderError;

    errorToHandle =
      (context.errors && context.errors[remixRoute.id]) ??
      mixinError ??
      errorToHandle;

    if (typeof errorToHandle !== "undefined") {
      if (!remixRoute.Boundary) {
        continue;
      }
      element = React.createElement(remixRoute.Boundary, {
        error: errorToHandle,
        actionData: context.actionData?.[remixRoute.id]?.actionData,
        loaderData: context.loaderData[remixRoute.id]?.loaderData,
        location: context.location,
        params: match.params,
        Form,
      });
      errorToHandle = undefined;
    } else if (remixRoute.Component) {
      element = React.createElement(remixRoute.Component, {
        actionData: context.actionData?.[remixRoute.id]?.actionData,
        loaderData: context.loaderData[match.route.id]?.loaderData,
        location: context.location,
        params: match.params,
        outlet: element,
        Form,
        mixins: createMixinInstances(
          match.route,
          url,
          context.location,
          (match.route as any).mixins,
          context.loaderData[match.route.id]?.mixins,
          context.actionData?.[match.route.id]?.mixins
        ),
      });
    }

    if (remixRoute.Loading) {
      element = React.createElement(
        React.Suspense,
        {
          fallback: React.createElement(remixRoute.Loading, {
            actionData: context.actionData?.[remixRoute.id]?.actionData,
            loaderData: context.loaderData[match.route.id]?.loaderData,
            location: context.location,
            params: match.params,
          }),
        },
        element
      );
    }
  }

  return (
    <ReactRouterServerContext.Provider value={routerServerContext}>
      {element}
    </ReactRouterServerContext.Provider>
  );
}

function createMixinInstances(
  route: ServerRoute,
  ogURL: URL,
  location,
  mixins: Record<string, MappedMixin>,
  mixinLoaderData?: Record<
    string,
    { params: RemixParams; loaderData: unknown; loaderError: unknown }
  >,
  mixinActionData?: Record<
    string,
    { actionData: unknown; actionError: unknown }
  >
): Record<string, MixinInstance> {
  if (!mixins || (!mixinLoaderData && !mixinActionData)) return {};

  const instances: Record<string, MixinInstance> = {};
  for (const [key, mixin] of Object.entries(mixins)) {
    const url = new URL(ogURL);
    const Form = (props: React.FormHTMLAttributes<HTMLFormElement>) => {
      let action = props.action;
      const method = (props.method || "GET").toUpperCase();

      if (!action) {
        const searchParams = new URLSearchParams();
        if (route.index && method === "POST") {
          searchParams.set("index", "");
        }
        action = url.pathname + "?" + searchParams.toString();
      }

      const [path, query] = (action as string).split("?", 2);
      const searchParams = new URLSearchParams(query);
      searchParams.set("_mixin", key);
      action = path + "?" + searchParams.toString();

      return <form {...props} action={action} />;
    };

    instances[key] = {
      ...mixinLoaderData?.[key],
      Outlet: (props: any) => {
        if (!mixin.definition.Component) return null;

        const error =
          mixinActionData?.[key]?.actionError ||
          mixinLoaderData?.[key]?.loaderError;
        if (error) {
          if (!mixin.definition.Boundary) {
            throw error;
          }
          return (
            <mixin.definition.Boundary
              {...props}
              error={error}
              Form={Form}
              loaderData={mixinLoaderData[key]?.loaderData}
              location={location}
              params={mixinLoaderData[key].params}
              actionData={mixinActionData?.[key]?.actionData}
            />
          );
        }

        return (
          <mixin.definition.Component
            {...props}
            Form={Form}
            loaderData={mixinLoaderData[key].loaderData}
            location={location}
            params={mixinLoaderData[key].params}
            actionData={mixinActionData?.[key]?.actionData}
          />
        );
      },
    };
  }

  return instances;
}

export function defineMixin<Params extends string>(
  definition: MixinDefinition<RemixParams<Params>>
): Mixin<RemixParams<Params>> {
  const getMixinRef = React.cache(
    (param): { current: null | Promise<unknown> } => ({
      current: null,
    })
  );
  return {
    map(map = () => ({} as any)) {
      return {
        getMixinRef,
        definition,
        map,
      };
    },
  };
}
