/// <reference types="node" />
import * as stream from "node:stream";

import * as React from "react";
import * as RSCServer from "react-server-dom-remix/server";
import { createStaticHandler } from "@remix-run/router";
import {
  type SignFunction,
  type UnsignFunction,
  createCookieFactory,
  createCookieSessionStorageFactory,
} from "@remix-run/server-runtime";

import { Router as AsyncRouter, RouterProps } from "./router.js";
import {
  type DefineHandlerArgs,
  type Handler,
  isRedirectResponse,
} from "./server.shared.js";

export * from "./server.shared.js";

const Router = AsyncRouter as unknown as React.FC<RouterProps>;

export function defineHandler<
  RequestContext = unknown,
  ServerContext = unknown
>({
  runtime,
  createRequestContext,
  commitRequestContext,
  basename,
}: DefineHandlerArgs<RequestContext, ServerContext>): Handler {
  const staticHandler = createStaticHandler(runtime.routes, { basename });

  return async (request, serverContext: ServerContext) => {
    let status: number | undefined;
    let thrownResponse: Response | undefined;
    let requestContext: RequestContext;
    let responseReady: () => void;
    const responseReadyPromise = new Promise<void>((resolve) => {
      responseReady = resolve;
    });

    const { abort, pipe } = RSCServer.renderToPipeableStream(
      <Router
        createRequestContext={createRequestContext}
        request={request}
        runtime={runtime}
        serverContext={serverContext}
        staticHandler={staticHandler}
        onRequestContext={(context: RequestContext) => {
          requestContext = context;
        }}
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

    const commitContext = (response: Response) => {
      if (!commitRequestContext) return response;
      return commitRequestContext({
        request,
        response,
        serverContext,
        requestContext,
      });
    };

    if (thrownResponse) {
      if (isRedirectResponse(thrownResponse)) {
        const headers = new Headers(thrownResponse.headers);
        headers.set(
          "X-Remix-Redirect",
          thrownResponse.headers.get("Location")!
        );
        headers.set("X-Remix-Status", thrownResponse.status.toString());
        headers.delete("Location");
        thrownResponse = new Response(null, {
          status: 204,
          headers,
        });
      }
      return commitContext(thrownResponse);
    }

    if (typeof status !== "number") {
      throw new Error("Internal Error: status code not set");
    }

    const body = new stream.PassThrough();
    pipe(body);

    return commitContext(
      new Response(stream.Readable.toWeb(body) as ReadableStream, {
        status,
        headers: {
          "Content-Type": "text/x-component; charset=utf-8",
        },
      })
    );
  };
}

const encoder = new TextEncoder();

const sign: SignFunction = async (value, secret) => {
  let key = await createKey(secret, ["sign"]);
  let data = encoder.encode(value);
  let signature = await crypto.subtle.sign("HMAC", key, data);
  let hash = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(
    /=+$/,
    ""
  );

  return value + "." + hash;
};

const unsign: UnsignFunction = async (signed, secret) => {
  let index = signed.lastIndexOf(".");
  let value = signed.slice(0, index);
  let hash = signed.slice(index + 1);

  let key = await createKey(secret, ["verify"]);
  let data = encoder.encode(value);
  let signature = byteStringToUint8Array(atob(hash));
  let valid = await crypto.subtle.verify("HMAC", key, signature, data);

  return valid ? value : false;
};

async function createKey(
  secret: string,
  usages: CryptoKey["usages"]
): Promise<CryptoKey> {
  let key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );

  return key;
}

function byteStringToUint8Array(byteString: string): Uint8Array {
  let array = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    array[i] = byteString.charCodeAt(i);
  }

  return array;
}

const createCookie = createCookieFactory({ sign, unsign });
export const createCookieSessionStorage =
  createCookieSessionStorageFactory(createCookie);
