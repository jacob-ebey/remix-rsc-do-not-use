import compression from "compression";
import express from "express";

import { createExpressHandler } from "@remix-run/express";

import remixHandler from "./build/remix-server/entry.server.js";

const app = express();

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

app.use(createExpressHandler(remixHandler));

const port = Number.parseInt(process.env.PORT || "3001");
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
