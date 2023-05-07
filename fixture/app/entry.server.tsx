import { defineHandler } from "remix/server";
import * as runtime from "remix/server-runtime";

const store = new Map();

export default defineHandler({
  runtime,
  createRequestContext() {
    return {
      store,
    };
  },
});
