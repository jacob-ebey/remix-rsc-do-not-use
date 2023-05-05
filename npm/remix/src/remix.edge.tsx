import * as React from "react";
import { renderToReadableStream } from "react-server-dom-webpack/server.edge";
import { createStaticHandler } from "@remix-run/router";

import type { DefineHandlerArgs, Handler } from "./remix.js";
export * from "./remix.js";
import { Router } from "./router.js";

export function defineHandler<
  RequestContext = unknown,
  ServerContext = unknown
>({
  runtime,
  createRequestContext,
  basename,
}: DefineHandlerArgs<RequestContext, ServerContext>): Handler {
  const staticHandler = createStaticHandler(runtime.routes, { basename });

  return async (request, serverContext: ServerContext) => {
    const requestContext = createRequestContext
      ? await createRequestContext({ request, serverContext })
      : undefined;

    const context = await staticHandler.query(request, { requestContext });

    if (context instanceof Response) {
      return context;
    }

    const url = new URL(request.url);

    let status = context.statusCode;
    const body = await renderToReadableStream(
      <Router context={context} url={url} />,
      runtime.browserManifest,
      {
        onError(error: unknown) {
          status = 500;
          console.error(error);
        },
      }
    );

    return new Response(body, {
      status,
      headers: {
        "Content-Type": "text/x-component; charset=utf-8",
      },
    });
  };
}
