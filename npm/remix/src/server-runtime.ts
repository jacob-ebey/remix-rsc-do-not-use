import type * as React from "react";

export function importById(id: string): Promise<any> {
  throw new Error(
    "This file should not be included in the bundle output.\n" +
      "It is generated by the bundler and should only be imported in code that runs in the browser."
  );
}

export interface BrowserManifestEntry {
  module: string;
  imports: string[];
}

export type BrowserManifest = Record<string, BrowserManifestEntry>;

export declare const browserManifest: BrowserManifest;

export interface LoaderArgs<Params extends string = string> {
  params: Record<Params, string>;
  url: URL;
}

export type LoaderFunction<Params extends string = string> = (
  args: LoaderArgs<Params>
) => unknown | Promise<unknown>;

export interface ServerRoute {
  children?: ServerRoute[];
  Component?: React.FC<{}>;
  id: string;
  index?: true;
  loader?: LoaderFunction;
  path?: string;
}

export declare const routes: ServerRoute[];