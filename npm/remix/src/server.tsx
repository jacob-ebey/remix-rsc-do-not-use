import { getRouterRef } from "./router.js";

export { RouteProps } from "./router.js";

function requireRouter(name: string) {
  const router = getRouterRef().current;
  if (!router) {
    throw new Error(`${name} must be used within a <Router>`);
  }
  return router;
}

export function matches() {
  const router = requireRouter("matches()");
  return router.context.matches;
}

export function url(): URL {
  const router = requireRouter("url()");
  return router.url;
}
