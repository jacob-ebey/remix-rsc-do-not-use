import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createFromFetch, encodeReply } from "react-server-dom-remix/client";

import { Router } from "./router.client.js";

declare global {
  interface Window {
    __rsc_body: ReadableStream;
  }
}

export function defaultGetInitialRSCResponse() {
  return Promise.resolve(new Response(window.__rsc_body));
}

export async function defaultCallServer(id, args) {
  const url = new URL(window.location.href);
  url.searchParams.set("_rsc", id);
  const response = fetch(url, {
    method: "POST",
    body: await encodeReply(args),
  });
  return createFromFetch(response, {
    callServer: defaultCallServer,
  });
}

export interface HydrateArgs {
  callServer?: typeof defaultCallServer;
  getInitialRSCResponse?: typeof defaultGetInitialRSCResponse;
}

export function hydrate(target: Document | HTMLElement, args?: HydrateArgs) {
  const callServer = args?.callServer ?? defaultCallServer;
  const getInitialRSCResponse =
    args?.getInitialRSCResponse ?? defaultGetInitialRSCResponse;

  React.startTransition(() => {
    const rscResponse = getInitialRSCResponse();

    const initialChunk = createFromFetch(rscResponse, {
      callServer,
    });

    ReactDOM.hydrateRoot(
      target,
      <React.StrictMode>
        <Router callServer={callServer} initialChunk={initialChunk} />
      </React.StrictMode>
    );
  });
}
