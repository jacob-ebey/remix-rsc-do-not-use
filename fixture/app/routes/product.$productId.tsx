import { RouteProps } from "remix/server";

import { getProductById } from "../dataloaders/product.js";
import { CartMixin } from "../mixins/cart.js";
import {
  ProductDetailsMixin,
  RecommendedProductsMixin,
} from "../mixins/product.js";

export const mixins = {
  cart: CartMixin.map(),
  product: ProductDetailsMixin.map(({ params }) => ({
    productId: params.productId,
  })),
  relatedProducts: RecommendedProductsMixin.map(({ params }) => ({
    productId: params.productId,
  })),
};

export async function loader({ request, params: { productId } }) {
  const url = new URL(request.url);
  const selectedOptions = Array.from(url.searchParams)
    .filter(([o]) => !o.startsWith("_"))
    .map(([name, value]) => ({ name, value }));
  const product = await getProductById(productId, selectedOptions);

  if (!product) throw new Response(null, { status: 404 });

  if (!product.variantBySelectedOptions) {
    const searchParams = new URLSearchParams(url.search);

    for (const option of product.options) {
      if (!searchParams.has(option.name)) {
        searchParams.set(option.name, option.values[0]);
      }
    }
    for (const key of searchParams.keys()) {
      if (!product.options.find((o) => o.name === key)) {
        searchParams.delete(key);
      }
    }

    throw new Response(null, {
      status: 302,
      headers: {
        Location: `/product/${productId}?${searchParams.toString()}`,
      },
    });
  }
  return null;
}

export function Component({ mixins }: RouteProps) {
  return (
    <>
      <title>{mixins.product.loaderData.product.title + " | mock.shop"}</title>
      <meta
        name="description"
        content={mixins.product.loaderData.product.title}
      />
      <mixins.cart.Outlet />
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto flex max-w-6xl px-6">
          <mixins.product.Outlet />
        </div>
      </section>
      <section className="py-10 bg-gray-100">
        <div className="container mx-auto flex max-w-6xl">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <mixins.relatedProducts.Outlet />
          </div>
        </div>
      </section>
    </>
  );
}
