import * as React from "react";
import RSCServer from "react-server-dom-webpack/server.edge";
import { createStaticHandler } from "@remix-run/router";

import type { DefineHandlerArgs, Handler } from "./server.shared.js";
export * from "./server.shared.js";
import { Router as AsyncRouter, RouterProps } from "./router.js";

const Router = AsyncRouter as unknown as React.FC<RouterProps>;

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
    let status: number | undefined;
    let thrownResponse: Response | undefined;
    let responseReady: () => void;
    const responseReadyPromise = new Promise<void>((resolve) => {
      responseReady = resolve;
    });

    const body: ReadableStream = await RSCServer.renderToReadableStream(
      <Router
        createRequestContext={createRequestContext}
        request={request}
        runtime={runtime}
        serverContext={serverContext}
        staticHandler={staticHandler}
        onResponseReady={(statusCode) => {
          status = statusCode;
          responseReady();
        }}
      />,
      runtime.browserManifest,
      {
        onError(error: unknown) {
          if (error instanceof Response) {
            thrownResponse = error;
            responseReady();
            return;
          }

          status = 500;
          responseReady();
        },
      }
    );

    await responseReadyPromise;

    if (thrownResponse) {
      await body.cancel().catch();
      return thrownResponse;
    }

    if (typeof status !== "number") {
      throw new Error("Internal Error: status code not set");
    }

    return new Response(body, {
      status,
      headers: {
        "Content-Type": "text/x-component; charset=utf-8",
      },
    });
  };
}
