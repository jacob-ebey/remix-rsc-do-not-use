import * as stream from "node:stream";

import * as express from "express";

import type { Handler } from "remix";

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

export function createExpressHandler<ServerContext = unknown>(
  handler: Handler,
  createServerContext?: CreateServerContext<ServerContext>
): express.Handler {
  return async (req, res, next) => {
    try {
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

      const request = new Request(url, {
        body,
        headers,
        method: req.method,
        signal: controller.signal,
      });

      const serverContext = createServerContext
        ? await createServerContext({ request, req, res })
        : undefined;

      const response = await handler(request, serverContext);

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
          res.write(value);
          let flushable = res as Partial<Flushable>;
          if (typeof flushable.flush === "function") {
            flushable.flush();
          }
          ({ done, value } = await reader.read());
        }
      }

      res.end();
    } catch (error) {
      next(error);
    }
  };
}
