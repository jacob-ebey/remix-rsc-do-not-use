import * as React from "react";
import * as ReactDOM from "react-dom/server.edge";
import RSCClient from "react-server-dom-webpack/client.edge";
import IsBot from "isbot";

import type {
  DefineRemoteArgs,
  Remote,
  RemoteFetcher,
} from "./client.shared.js";
export * from "./client.shared.js";
import { Router as ClientRouter } from "./router.client.js";

export function createRemoteFetcher(hostname: string): RemoteFetcher {
  return (request) => {
    const url = new URL(request.url);
    url.hostname = hostname;
    url.searchParams.set("_rsc", "1");

    return fetch(url, request);
  };
}

const bootstrapScriptContent = `
  window.__rsc_encoder = new TextEncoder();
  window.__rsc_body = new ReadableStream({
    start(controller) {
      window.__rsc_controller = controller;
    }
  });
`;

export function defineRemote<ServerContext = unknown>(
  args: DefineRemoteArgs<ServerContext>
): Remote {
  const fetcherFactory = args.fetcherFactory;
  const handleError = args?.onError ?? console.error;
  const shouldBuffer =
    args?.shouldBuffer ??
    (() => {
      const isbot = IsBot.spawn();
      isbot.exclude(["chrome-lighthouse"]);
      return isbot;
    })();
  return async (request, serverContext: ServerContext) => {
    const fetcher = fetcherFactory({ request, serverContext });
    const response = await fetcher(request);

    if (response.status >= 300 && response.status <= 399) {
      return response;
    }

    const [rscBodyA, rscBodyB] = response.body.tee();

    let buffer = "";
    const decoder = new TextDecoder();
    const rscScriptsPromise = (async () => {
      const reader = rscBodyA.getReader();
      let read = await reader.read();
      while (!read.done) {
        buffer += decoder.decode(read.value, { stream: true });
        read = await reader.read();
      }
    })().catch(() => {});

    const encoder = new TextEncoder();
    const htmlDecoder = new TextDecoder("utf-8");
    const rscTransform = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        controller.enqueue(chunk);

        const decoded = htmlDecoder.decode(chunk, { stream: true });

        if (decoded.match(/((<\/)\w+(>))$/)) {
          let idx = buffer.indexOf("\n");
          while (idx != -1) {
            const line = buffer.slice(0, idx + 1);
            controller.enqueue(
              encoder.encode(`<script>
  window.__rsc_controller.enqueue(
    window.__rsc_encoder.encode(
      ${JSON.stringify(line)}
    )
  );
</script>`)
            );
            buffer = buffer.slice(idx + 1);
            idx = buffer.indexOf("\n");
          }
        }
      },
      async flush(controller) {
        await rscScriptsPromise;
        let toSend = "<script>";
        buffer += decoder.decode();
        if (buffer) {
          toSend += `
  window.__rsc_controller.enqueue(window.__rsc_encoder.encode(
    ${JSON.stringify(buffer)}
  ));`;
        }
        toSend += "window.__rsc_controller.close();</script>";
        controller.enqueue(encoder.encode(toSend));
      },
    });

    new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    const rscChunk = RSCClient.createFromReadableStream(rscBodyB, {
      moduleMap: args.runtime.moduleMap,
    });

    let status = response.status;
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    const body: ReadableStream<Uint8Array> & { allReady: Promise<void> } =
      await ReactDOM.renderToReadableStream(
        <React.StrictMode>
          <ClientRouter
            callServer={() => {
              throw new Error("Can not call server actions from an SSR client");
            }}
            initialChunk={rscChunk}
          />
        </React.StrictMode>,
        {
          bootstrapModules: [
            ...args.runtime.browserEntrypoint.chunks,
            args.runtime.browserEntrypoint.id,
          ],
          bootstrapScriptContent,
          onError(error) {
            status = 500;
            handleError(error);
          },
        }
      );

    if (shouldBuffer(request.headers.get("user-agent") || "")) {
      await body.allReady;
    }

    body.pipeTo(rscTransform.writable);

    return new Response(rscTransform.readable, {
      headers,
      status,
    });
  };
}
