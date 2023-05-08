import { cache } from "react";

export const getAllProducts = cache(async () => {
  const url = new URL("https://mock.shop/api");
  url.searchParams.set(
    "query",
    `{
      collection(id: "gid://shopify/Collection/429512622102"){
        products(first: 20){
          edges {
            node {
              id
              title
              description
              featuredImage {
                id
                url
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }`
  );
  const request = await fetch(url);
  const response = await request.json();

  return response.data.collection.products.edges.map((edge) => edge.node);
});

export const getProductById = cache(async (id, selectedOptions) => {
  const url = new URL("https://mock.shop/api");
  url.searchParams.set(
    "query",
    `
    query($id: ID, $selectedOptions: [SelectedOptionInput!]!){
      product(id: $id) {
        id
        title
        description
        featuredImage {
          id
          url
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          id
          name
          values
        }
        variants(first: 1) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              selectedOptions {
                name
                value
              }
            }
          }
        }
        variantBySelectedOptions(selectedOptions: $selectedOptions) {
          id
          price {
            amount
            currencyCode
          }
          image {
            id
            url
          }
        }
      }
    }
  `
  );
  url.searchParams.set(
    "variables",
    JSON.stringify({
      id: `gid://shopify/Product/${id}`,
      selectedOptions: selectedOptions || [],
    })
  );

  const request = await fetch(url);
  const response = await request.json();

  return response.data.product;
});

export const getRecommendedProducts = cache(async (id) => {
  const url = new URL("https://mock.shop/api");
  url.searchParams.set(
    "query",
    `
      query($id: ID!){
        productRecommendations(productId: $id) {
          id
          title
          description
          featuredImage {
            id
            url
          }
          priceRange {
            minVariantPrice {
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
    JSON.stringify({ id: `gid://shopify/Product/${id}` })
  );

  const request = await fetch(url);
  const response = await request.json();

  return response.data.productRecommendations;
});
