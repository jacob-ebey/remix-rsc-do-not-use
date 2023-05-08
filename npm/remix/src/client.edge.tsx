import * as React from "react";
import * as ReactDOM from "react-dom/server.edge";
import * as RSCClient from "react-server-dom-remix/client";
import IsBot from "isbot";

import type { DefineRemoteArgs, Remote } from "./client.shared.js";
import { Router as ClientRouter } from "./router.client.js";

export * from "./client.shared.js";

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

    const redirectLocation = response.headers.get("X-Remix-Redirect")!;
    const redirectStatus = response.headers.get("X-Remix-Status")!;
    if (response.status === 204 && redirectLocation && redirectStatus) {
      return new Response(null, {
        status: Number.parseInt(redirectStatus),
        headers: { Location: redirectLocation },
      });
    }

    if (
      !response.headers.get("Content-Type")?.match(/\btext\/x-component\b/) ||
      !response.body
    ) {
      return response;
    }

    if (!response.body?.tee) return response;

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
    let buffered = "";
    let foundBootstrap = false;
    const rscTransform = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        controller.enqueue(chunk);

        const decoded = htmlDecoder.decode(chunk, { stream: true });

        if (!foundBootstrap) {
          buffered += decoded;
          if (buffered.match(/window\.__rsc_controller/)) {
            foundBootstrap = true;
          }
          return;
        }

        if (foundBootstrap && decoded.match(/((<\/)\w+(>))$/)) {
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
