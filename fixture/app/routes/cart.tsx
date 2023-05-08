import { RouteProps } from "remix/server";

import { CartMixin } from "../mixins/cart.js";

export const mixins = {
  cart: CartMixin.map(),
};

export function Component({ mixins }: RouteProps) {
  return (
    <>
      <h1>Cart!</h1>
      <pre>
        <code>{JSON.stringify(mixins.cart.loaderData, null, 2)}</code>
      </pre>
    </>
  );
}
