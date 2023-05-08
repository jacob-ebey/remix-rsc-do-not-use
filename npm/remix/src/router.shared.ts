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

export type RouterServerContext = {
  matches: ServerMatch[];
};

export const ReactRouterServerContext = (React as any).createServerContext(
  "RouterServerContext",
  null
);
