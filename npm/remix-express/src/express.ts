import * as stream from "node:stream";

import * as express from "express";

import type { Handler } from "remix/server";
import type { Remote } from "remix/client";

export interface CreateServerContextArgs {
  request: Request;
  req: express.Request;
  res: express.Response;
}

export type CreateServerContext<ServerContext> = (
  args: CreateServerContextArgs
) => ServerContext | Promise<ServerContext>;

interface Flushable {
  flush(): void;
}

export function createServerHandler<ServerContext = unknown>(
  handler: Handler,
  createServerContext?: CreateServerContext<ServerContext>
): express.Handler {
  return async (req, res, next) => {
    try {
      if (!req.query["_rsc"]) {
        next();
        return;
      }
      const request = createRequest(req, res);

      const serverContext = createServerContext
        ? await createServerContext({ request, req, res })
        : undefined;

      const response = await handler(request, serverContext);

      await sendResponse(res, response);
    } catch (error) {
      next(error);
    }
  };
}

export function createClientHandler<ServerContext = unknown>(
  remote: Remote,
  createServerContext?: CreateServerContext<ServerContext>
): express.Handler {
  return async (req, res, next) => {
    try {
      const request = createRequest(req, res);
      const serverContext = await createServerContext({ req, request, res });
      const response = await remote(request, serverContext);
      await sendResponse(res, response);
    } catch (error) {
      next(error);
    }
  };
}

function createRequest(req: express.Request, res: express.Response) {
  const url = new URL(`${req.protocol}://${req.get("host")}${req.url}`);

  let body: RequestInit["body"] = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = stream.Readable.toWeb(req) as unknown as ReadableStream;
  }

  const headers = new Headers();
  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  const controller = new AbortController();
  res.on("close", () => controller.abort());

  let init: RequestInit & { duplex: "half" } = {
    body,
    headers,
    method: req.method,
    signal: controller.signal,
    duplex: "half",
  };

  return new Request(url, init);
}

async function sendResponse(res: express.Response, response: Response) {
  const responseHeaders: Record<string, string | string[]> = {};
  for (const [key, value] of response.headers) {
    if (!responseHeaders[key]) {
      responseHeaders[key] = value;
    } else if (Array.isArray(responseHeaders[key])) {
      (responseHeaders[key] as string[]).push(value);
    } else {
      responseHeaders[key] = [responseHeaders[key] as string, value];
    }
  }

  res.writeHead(response.status, response.statusText, responseHeaders);

  if (response.body) {
    const reader = response.body.getReader();
    let { done, value } = await reader.read();
    while (!done) {
      res.write(Buffer.from(value));
      let flushable = res as Partial<Flushable>;
      if (typeof flushable.flush === "function") {
        flushable.flush();
      }
      ({ done, value } = await reader.read());
    }
  }

  res.end();
}
