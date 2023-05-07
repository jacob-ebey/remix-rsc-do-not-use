import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import { createFromFetch } from "react-server-dom-webpack/client.browser";
import {
  createStaticRouter,
  type StaticHandlerContext,
} from "react-router-dom/server.js";

export interface RouterProps {
  callServer: (...args: any[]) => Promise<any>;
  initialChunk: React.Usable<React.ReactElement>;
}

let browserRouter: ReturnType<typeof createBrowserRouter>;
export function Router({ callServer, initialChunk }: RouterProps) {
  const router = React.useMemo(() => {
    if (typeof document === "undefined") {
      return createStaticRouter(
        [
          {
            id: "router",
            path: "/*",
            loader: () => null,
          },
        ],
        {
          loaderData: {
            router: { chunk: initialChunk },
          },
          matches: [
            {
              route: { id: "router" },
            },
          ],
        } as unknown as StaticHandlerContext
      );
    }
    let actionCount = 0;
    let actionData = undefined;
    let loaderHandled = 0;
    return (
      browserRouter ??
      (browserRouter = createBrowserRouter(
        [
          {
            id: "router",
            path: "/*",
            loader: ({ request }) => {
              if (loaderHandled < actionCount) {
                loaderHandled = actionCount;
                return actionData;
              }
              const url = new URL(request.url);
              url.searchParams.set("_rsc", "1");

              const rscResponsePromise = fetch(url, request);

              const chunk = createFromFetch(rscResponsePromise, {
                callServer,
              });

              return {
                chunk,
              };
            },
            action: async ({ request }) => {
              actionCount++;
              const url = new URL(request.url);
              url.searchParams.set("_rsc", "1");

              const init: RequestInit = {
                body: request.body,
                headers: request.headers,
                method: request.method,
                mode: "same-origin",
              };

              const contentType = request.headers.get("Content-Type");
              init.body =
                // Check between word boundaries instead of startsWith() due to the last
                // paragraph of https://httpwg.org/specs/rfc9110.html#field.content-type
                contentType &&
                /\bapplication\/x-www-form-urlencoded\b/.test(contentType)
                  ? new URLSearchParams(await request.text())
                  : await request.formData();

              const rscResponsePromise = fetch(url, init);

              const chunk = createFromFetch(rscResponsePromise, {
                callServer,
              });

              actionData = {
                chunk,
              };
              return actionData;
            },
          },
        ],
        {
          hydrationData: {
            loaderData: {
              router: { chunk: initialChunk },
            },
          },
        }
      ))
    );
  }, []);
  const [rscChunk, setRSCChunk] = React.useState(
    () => router.state.loaderData.router.chunk
  );
  const [transitioning, startTransition] = React.useTransition();

  React.useEffect(() => {
    return router.subscribe((state) => {
      startTransition(() => {
        setRSCChunk(state.loaderData.router.chunk);
      });
    });
  }, []);

  React.useEffect(() => {
    const routeFromForm =
      /**
       * @param {HTMLFormElement | HTMLButtonElement} node
       * @param {string | null} method
       * @param {string | null} action
       * @param {string | null} enctype
       */
      (node, formMethod, action, formEncType, buttonInput) => {
        // only valid elements
        if (!node || !node.getAttribute) return;

        const replace = !!node.getAttribute("data-replace"),
          preventScrollReset = !!node.getAttribute("data-prevent-scroll");

        formMethod = (formMethod || "GET").toUpperCase();
        formEncType = formEncType || "application/x-www-form-urlencoded";
        const url = new URL(
          action || router.state.location.pathname,
          window.location.href
        );

        const formData = new FormData(node);
        if (buttonInput) {
          formData.append(buttonInput.name, buttonInput.value);
        }

        return router.navigate(url.pathname + url.search, {
          replace,
          preventScrollReset,
          formData,
          formEncType,
          formMethod,
        });
      };

    const handleSubmit = (e: SubmitEvent) => {
      let t = e.target as HTMLElement,
        method,
        enctype,
        action;
      let buttonInput;
      do {
        let form;
        if (t.localName === "button") {
          const name = t.getAttribute("name");
          if (name) {
            buttonInput = { name, value: t.getAttribute("value") || "" };
          }
          const formId = t.getAttribute("form");
          if (formId) {
            form = document.getElementById(formId);
            if (form) {
              action = action || form.action;
              enctype = enctype || form.enctype;
              method = method || form.method;
            }
          }
          action = t.getAttribute("formaction") || action;
          enctype = t.getAttribute("formenctype") || enctype;
          method = t.getAttribute("formmethod") || method;
        } else if (t.localName === "form") {
          if (t.hasAttribute("data-native") || t.hasAttribute("native")) return;
          const target = t.getAttribute("target");
          if (target && target.match(/^_?self$/i)) {
            return;
          }
          const f = t as HTMLFormElement;
          action = action || f.action;
          enctype = enctype || f.enctype;
          method = method || f.method;
          form = t;
        }
        if (form) {
          // if form is handled by the router, prevent browser defaults
          if (routeFromForm(form, method, action, enctype, buttonInput)) {
            return prevent(e);
          }
        }
      } while ((t = t.parentNode as HTMLElement));
    };

    /**
     * @param {Element} node
     */
    const routeFromLink = (node) => {
      // only valid elements
      if (!node || !node.getAttribute) return;

      let href = node.getAttribute("href"),
        target = node.getAttribute("target"),
        replace = !!node.getAttribute("data-replace"),
        preventScrollReset = !!node.getAttribute("data-prevent-scroll");

      // ignore links with targets and non-path URLs
      if (!href || (target && !target.match(/^_?self$/i))) return;

      const url = new URL(href, window.location.href);

      return router.navigate(
        {
          hash: url.hash,
          pathname: url.pathname,
          search: url.search,
        },
        { replace, preventScrollReset }
      );
    };

    /**
     * @param {MouseEvent} e
     */
    const handleClick = (e) => {
      // ignore events the browser takes care of already:
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;

      let t = /** @type {Element} */ e.target;
      do {
        if (t.localName === "button" && t.getAttribute("type") === "submit") {
          return handleSubmit(e);
        } else if (t.localName === "a" && t.getAttribute("href")) {
          if (t.hasAttribute("data-native") || t.hasAttribute("native")) return;
          // if link is handled by the router, prevent browser defaults
          if (routeFromLink(t)) {
            return prevent(e);
          }
          return;
        }
      } while ((t = /** @type {Element} */ t.parentNode));
    };

    addEventListener("click", handleClick);
    addEventListener("submit", handleSubmit);
    return () => {
      removeEventListener("click", handleClick);
      removeEventListener("submit", handleSubmit);
    };
  }, []);

  return React.use(rscChunk) as React.ReactElement;
}

function prevent(e: Event) {
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (e.stopPropagation) e.stopPropagation();
  e.preventDefault();
  return false;
}
