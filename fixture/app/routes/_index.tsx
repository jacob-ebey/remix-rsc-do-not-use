import { RouteProps } from "remix/server";

import { Layout } from "../components/layout.js";
import { ProductCard } from "../components/product.js";
import { getAllProducts } from "../dataloaders/product.js";

export async function loader() {
  const products = await getAllProducts();
  return { products };
}

export async function Component({ loaderData }: RouteProps<typeof loader>) {
  return (
    <section className="py-10 bg-gray-100">
      <div className="container mx-auto flex max-w-6xl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        </div>
      </div>
    </section>
  );
}
