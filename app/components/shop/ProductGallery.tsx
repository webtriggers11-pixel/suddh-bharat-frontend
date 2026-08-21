"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Product image gallery: large active image with a calm hover-zoom + a
 * thumbnail rail (horizontal-scroll on mobile). Design-system tokens only;
 * the hover-zoom is a CSS transform, so the global reduced-motion rule disables
 * it automatically.
 */
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
      <div className="group relative aspect-square overflow-hidden rounded-card border border-line bg-paper-dim">
        {list[active] ? (
          <Image
            src={list[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-gray">
            NO IMAGE
          </div>
        )}
        {list.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-chip bg-ink/70 px-2 py-1 font-mono text-[10px] tracking-wider text-paper">
            {active + 1} / {list.length}
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-chip border transition-colors duration-200 ${
                i === active
                  ? "border-forest ring-1 ring-forest"
                  : "border-line hover:border-sage"
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
