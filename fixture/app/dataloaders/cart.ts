import { cache } from "react";

export const getCartById = cache(async (id, quantity = 10) => {
  const url = new URL("https://mock.shop/api");
  url.searchParams.set(
    "query",
    `
      query($id: ID!, $quantity: Int){
        cart(id: $id) {
          id
          lines(first: $quantity) {
          pageInfo {
        hasNextPage
      }
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    image {
                      id
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      featuredImage {
                        id
                        url
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    `
  );
  url.searchParams.set(
    "variables",
    JSON.stringify({ id, quantity: quantity + 1 })
  );

  const request = await fetch(url);
  const response = await request.json();

  if (!response.data || !response.data.cart) return null;

  return {
    id: response.data.cart.id,
    lines: response.data.cart.lines.edges
      .slice(0, quantity)
      .map(({ node: line }) => line),
    cost: response.data.cart.cost,
    hasMoreLines: response.data.cart.lines.edges.length > quantity,
  };
});
