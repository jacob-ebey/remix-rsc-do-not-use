import "source-map-support/register.js";

import compression from "compression";
import express from "express";

import { createClientHandler, createServerHandler } from "@remix-run/express";

import serverHandler from "./build/remix-server/entry.server.js";
import ssrHandler from "./build/remix-ssr/entry.ssr.js";

const app = express();
app.disable("x-powered-by");

app.use(compression());

app.use(
  "/build",
  express.static("public/build", {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(
  express.static("public", {
    maxAge: "5m",
  })
);

app.use(createServerHandler(serverHandler));
app.use(createClientHandler(ssrHandler, () => ({ serverHandler })));

const port = Number.parseInt(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
