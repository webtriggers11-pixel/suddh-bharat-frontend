"use client";

import Image from "next/image";
import { useState } from "react";

/** Product image gallery: large active image + thumbnail strip. */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-paper-dim">
        {list[active] ? (
          <Image
            src={list[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-gray">
            NO IMAGE
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-3">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-20 overflow-hidden rounded-chip border ${
                i === active ? "border-forest" : "border-line"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
