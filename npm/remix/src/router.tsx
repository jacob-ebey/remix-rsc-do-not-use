/// <reference types="react/experimental" />
import * as React from "react";
import type {
  AgnosticDataIndexRouteObject,
  AgnosticDataNonIndexRouteObject,
  Location,
  Params,
  StaticHandlerContext,
} from "@remix-run/router";

import {
  type RouterServerContext,
  ReactRouterServerContext,
} from "./router.shared.js";

export interface RouteProps {
  outlet: React.ReactNode;
  actionData?: unknown;
  loaderData?: unknown;
  location: Location;
  params: Params;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
}

export interface BoundaryProps {
  error: unknown;
  actionData?: unknown;
  loaderData?: unknown;
  location: Location;
  params: Params;
  Form: React.ForwardRefExoticComponent<
    React.FormHTMLAttributes<HTMLFormElement> &
      React.RefAttributes<HTMLFormElement>
  >;
}

export type ServerRoute = (
  | AgnosticDataIndexRouteObject
  | (Exclude<AgnosticDataNonIndexRouteObject, "children"> & {
      children?: ServerRoute[];
    })
) & {
  Component?: React.FC<RouteProps>;
  Boundary?: React.FC<BoundaryProps>;
};

interface RouterContextRef {
  current: null | {
    context: StaticHandlerContext;
    url: URL;
  };
}

export const getRouterRef = React.cache(
  (): RouterContextRef => ({ current: null })
);

export interface RouterProps {
  context: StaticHandlerContext;
  url: URL;
}

export function Router({ context, url }: RouterProps) {
  const routerRef = getRouterRef();
  routerRef.current = {
    context,
    url,
  };

  const routerServerContext: RouterServerContext = {
    matches: [],
  };

  for (const match of context.matches) {
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
  for (let i = context.matches.length - 1; i >= 0; i--) {
    const match = context.matches[i];
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

    errorToHandle =
      (context.errors && context.errors[remixRoute.id]) || errorToHandle;
    if (typeof errorToHandle !== "undefined") {
      if (!match.route.hasErrorBoundary || !remixRoute.Boundary) {
        continue;
      }
      element = React.createElement(remixRoute.Boundary, {
        error: errorToHandle,
        actionData:
          context.actionData &&
          context.actionData[remixRoute.id] &&
          context.actionData[remixRoute.id].actionData,
        loaderData:
          context.loaderData[remixRoute.id] &&
          context.loaderData[remixRoute.id].loaderData,
        location: context.location,
        params: match.params,
        Form,
      });
      errorToHandle = undefined;
      continue;
    }

    if (remixRoute.Component) {
      element = React.createElement(remixRoute.Component, {
        actionData:
          context.actionData &&
          context.actionData[remixRoute.id] &&
          context.actionData[remixRoute.id].actionData,
        loaderData:
          context.loaderData[match.route.id] &&
          context.loaderData[match.route.id].loaderData,
        location: context.location,
        params: match.params,
        outlet: element,
        Form,
        // mixins:
        //   context.loaderData[remixRoute.id] ||
        //   (context.actionData && context.actionData[remixRoute.id])
        //     ? createMixinsInstances(
        //         match.route,
        //         url,
        //         context.loaderData[remixRoute.id] &&
        //           context.loaderData[remixRoute.id].mixins,
        //         context.actionData &&
        //           context.actionData[remixRoute.id] &&
        //           context.actionData[remixRoute.id].mixins
        //       )
        //     : {},
        // scripts,
      });
    }
  }

  return (
    <ReactRouterServerContext.Provider value={routerServerContext}>
      {element}
    </ReactRouterServerContext.Provider>
  );
}
