import * as React from "react";
import { currentLocation } from "remix/server";

import { ShopifyImage } from "./images.js";
import { AddToCartButton } from "./product.client.js";

export function ProductCard({
  productId,
  imageSrc,
  title,
  description,
  price,
}: {
  productId: string;
  imageSrc: string;
  title: string;
  description?: string;
  price: { amount: number; currencyCode: string };
}) {
  return (
    <article className="rounded-xl bg-white p-3 shadow-lg hover:shadow-xl hover:transform hover:scale-105 duration-300 relative">
      <a
        data-testid="product-card"
        href={`/product/${productId}`}
        className="h-full flex flex-col"
      >
        <div className="relative flex items-end overflow-hidden rounded-xl">
          <ShopifyImage
            className="w-full object-cover aspect-[3.5/4]"
            src={imageSrc}
            alt="Hotel Photo"
            width={400}
          />
        </div>
        <div className="mt-1 p-2 flex flex-col flex-1">
          <h2 className="text-slate-700">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
          <div className="mt-3 flex items-end justify-between flex-1">
            <p className="text-lg font-bold text-blue-500">
              {price.amount}
              <small>{price.currencyCode}</small>
            </p>
            {/* <AddToCartButton variantId={variantId} /> */}
          </div>
        </div>
      </a>
    </article>
  );
}

export function ProductDetails({
  productId,
  imageSrc,
  title,
  description,
  price,
  variantId,
  options,
}) {
  const location = currentLocation();
  const searchParams = new URLSearchParams(location.search);

  const createSearchParams = (name, value) => {
    const newParams = new URLSearchParams(location.search);
    for (const key of searchParams.keys()) {
      if (key.startsWith("_")) {
        newParams.delete(key);
      }
    }
    newParams.set(name, value);
    return newParams.toString();
  };

  return (
    <article className="rounded-xl w-full bg-white p-3 md:gap-5 md:grid md:grid-cols-2">
      <div className="relative flex overflow-hidden rounded-xl">
        <React.Suspense
          fallback={<div className="w-full h-full bg-gray-200" />}
        >
          <ShopifyImage
            alt="Hotel Photo"
            className="w-full h-full object-cover aspect-[3.5/4]"
            src={imageSrc}
            width={800}
            wait
          />
        </React.Suspense>
      </div>
      <div className="mt-1 p-2">
        <h2 className="text-2xl mb-3 text-slate-700">{title}</h2>
        {description && (
          <p className="my-3 text-lg text-slate-400">{description}</p>
        )}
        <div className="my-6">
          {(options.length > 1 || options[0].values.length > 1) &&
            options.map((option) => (
              <div key={option.id} className="my-6">
                <p className="text-lg font-bold">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <a
                      key={value}
                      className={
                        "rounded-lg px-4 py-1.5 text-white duration-100 " +
                        (searchParams.get(option.name) === value
                          ? "bg-black"
                          : "bg-gray-500 hover:bg-gray-600")
                      }
                      href={`/product/${productId}?${createSearchParams(
                        option.name,
                        value
                      )}`}
                      data-replace
                      data-prevent-scroll
                    >
                      {value}
                    </a>
                  ))}
                </div>
              </div>
            ))}
        </div>
        <div className="mt-6 flex items-end justify-between">
          <p className="text-lg font-bold text-blue-500">
            {price.amount}
            <small>{price.currencyCode}</small>
          </p>
          <AddToCartButton variantId={variantId} />
        </div>
      </div>
    </article>
  );
}
