import { defineMixin, currentLocation } from "remix/server";

import { getCartById } from "../dataloaders/cart.js";

export const CartMixin = defineMixin({
  async loader({ context: { session } }: any) {
    const cartId = session.get("cartId");
    if (cartId) {
      return await getCartById(cartId);
    }
    return null;
  },
  async action({ context: { session }, request }: any) {
    let cartId = session.get("cartId");

    const formData = await request.formData();
    const variantId = formData.get("variantId");

    if (!cartId) {
      cartId = await createCart(variantId);
    } else {
      cartId = await addToCart(cartId, variantId);
    }
    session.set("cartId", cartId);

    return null;
  },
  Component({ Form, children }) {
    const location = currentLocation();

    return (
      <Form
        data-replace
        data-prevent-scroll
        id="add-to-cart"
        method="post"
        action={`${location.pathname}${location.search}`}
      >
        {children}
      </Form>
    );
  },
});

async function createCart(variantId) {
  const request = await fetch("https://mock.shop/api", {
    method: "POST",
    body: JSON.stringify({
      variables: {
        merchandiseId: variantId,
      },
      query: `
        mutation CartCreate($merchandiseId: ID!) {
          cartCreate(
            input: {
              lines: [
                {
                  quantity: 1
                  merchandiseId: $merchandiseId
                }
              ]
            }
          ) {
            cart {
              id
            }
          }
        }
      `,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  const response = await request.json();

  return response.data.cartCreate.cart.id;
}

async function addToCart(cartId, variantId) {
  const request = await fetch("https://mock.shop/api", {
    method: "POST",
    body: JSON.stringify({
      variables: {
        cartId,
        merchandiseId: variantId,
      },
      query: `
        mutation CartAdd($cartId: ID!, $merchandiseId: ID!) {
          cartLinesAdd(
            cartId: $cartId
            lines: [
              {
                quantity: 1
                merchandiseId: $merchandiseId
              }
            ]
          ) {
            cart {
              id
            }
          }
        }
      `,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  const response = await request.json();

  return response.data.cartLinesAdd.cart.id;
}
