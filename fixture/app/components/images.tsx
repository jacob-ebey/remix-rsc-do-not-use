"use client";

import * as React from "react";

const imageCache = new Map<string, Promise<void>>();
function loadImage(src, rejectOnError = false) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = rejectOnError ? reject : () => resolve();
        img.src = src;
      })
    );
  }
  return imageCache.get(src);
}

export function ShopifyImage({
  required,
  src,
  height: _,
  wait,
  width,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  required?: boolean;
  src: string;
  wait?: boolean;
  width: number;
}) {
  const imageSrc = src.replace(/(\.\w+)(\?.*)?$/, (_, ext, query) => {
    return `_${width}x${width}${ext}${query ?? ""}`;
  });

  if (wait && typeof document !== "undefined")
    React.use(loadImage(imageSrc, required));

  return <img {...rest} src={imageSrc} />;
}
