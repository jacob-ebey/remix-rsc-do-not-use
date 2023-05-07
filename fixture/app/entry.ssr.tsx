import type { Handler } from "remix/server";
import { defineRemote } from "remix/client";
import * as runtime from "remix/ssr-runtime";

interface ServerContext {
  serverHandler: Handler;
}

export default defineRemote<ServerContext>({
  runtime,
  fetcherFactory: ({ serverContext }) => {
    const { serverHandler, ...rest } = serverContext;

    return (request) => serverHandler(request, rest);
  },
});
