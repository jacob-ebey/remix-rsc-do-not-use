import { defineHandler } from "remix";
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
