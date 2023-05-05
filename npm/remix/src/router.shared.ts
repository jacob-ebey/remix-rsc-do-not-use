import * as React from "react";

export interface ServerMatchRoute {
  id: string;
  path: string;
  index: boolean;
}

export interface ServerMatch {
  params: Record<string, string>;
  pathname: string;
  pathnameBase: string;
  route: ServerMatchRoute;
}

export type RouterServerContext = React.ServerContextJSONValue & {
  matches: ServerMatch[];
};

export const ReactRouterServerContext =
  React.createServerContext<RouterServerContext | null>(
    "RouterServerContext",
    null
  );
