import { defineMixin } from "remix/server";

import { ProductDetails, ProductCard } from "../components/product.js";
import {
  getProductById,
  getRecommendedProducts,
} from "../dataloaders/product.js";

export const ProductDetailsMixin = defineMixin<"productId">({
  async loader({ request, params: { productId } }) {
    const url = new URL(request.url);
    const selectedOptions = Array.from(url.searchParams)
      .filter(([o]) => !o.startsWith("_"))
      .map(([name, value]) => ({ name, value }));
    const product = await getProductById(productId, selectedOptions);
    return {
      product,
    };
  },
  Component({ loaderData, params }) {
    return (
      <ProductDetails
        productId={params.productId}
        imageSrc={
          (loaderData.product.variantBySelectedOptions &&
            loaderData.product.variantBySelectedOptions.image &&
            loaderData.product.variantBySelectedOptions.image.url) ||
          loaderData.product.featuredImage.url
        }
        title={loaderData.product.title}
        description={loaderData.product.description}
        price={
          (loaderData.product.variantBySelectedOptions &&
            loaderData.product.variantBySelectedOptions.price) ||
          loaderData.product.priceRange.minVariantPrice
        }
        variantId={
          loaderData.product.variantBySelectedOptions &&
          loaderData.product.variantBySelectedOptions.id
        }
        options={loaderData.product.options}
      />
    );
  },
});

export const RecommendedProductsMixin = defineMixin<"productId">({
  async loader({ params: { productId } }) {
    const products = await getRecommendedProducts(productId);
    return {
      products,
    };
  },
  Component({ loaderData }) {
    return (
      <>
        {loaderData.products.map((product) => (
          <ProductCard
            key={product.id}
            productId={product.id.split("/").slice(-1)[0]}
            title={product.title}
            description={product.description}
            price={product.priceRange.minVariantPrice}
            imageSrc={product.featuredImage.url}
          />
        ))}
      </>
    );
  },
});
