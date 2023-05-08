import * as React from "react";
import { BoundaryProps, RouteProps } from "remix/server";
import { ScrollRestoration } from "remix/scroll-restoration";

import { Layout } from "./components/layout.js";
import { CartMixin } from "./mixins/cart.js";

export const mixins = {
  cart: CartMixin.map(),
};

export function Component({ mixins, outlet }: RouteProps) {
  return <App cart={mixins.cart.loaderData}>{outlet}</App>;
}

export function Boundary({ error, location }: BoundaryProps) {
  console.error(error);
  return (
    <App>
      <h1>Oops</h1>
      <p>
        <a href={location.pathname}>Recover from client error</a>
      </p>
      <p>
        <a href="/">Go Home</a>
      </p>
    </App>
  );
}

function App({ cart, children }: { cart?: any; children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>mock.shop</title>
        <meta name="description" content="mock.shop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="/nprogress.css"
        />
        <link
          rel="stylesheet"
          href="/styles.css"
        />
      </head>
      <body className="bg-white">
        <Layout cart={cart}>{children}</Layout>
        <ScrollRestoration />
      </body>
    </html>
  );
}
