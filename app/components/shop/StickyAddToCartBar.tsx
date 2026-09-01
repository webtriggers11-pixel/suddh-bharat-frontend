"use client";

import { useEffect, useRef, useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { formatINR } from "../../lib/api/catalog";

/**
 * Mobile-only sticky add-to-cart bar (CHORE-022). Renders an invisible
 * sentinel right where the main buy button lives; once that sentinel scrolls
 * out of view, a fixed bottom bar with the product name/price + the same
 * `AddToCartButton` appears, so the CTA stays in the thumb zone while
 * browsing description/reviews/related-products further down the page.
 * `md:hidden` — desktop keeps the inline button only.
 *
 * While visible, publishes its measured height as `--sticky-atc-height` (a
 * CSS custom property on the root, defined in globals.css) so other fixed
 * bottom surfaces on the same page — currently `PWABadge` — can shift up
 * instead of being overlapped by this bar.
 */
export function StickyAddToCartBar({
  productId,
  name,
  slug,
  image,
  priceMinor,
  mrpMinor,
  inStock,
  maxQty,
}: {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  priceMinor: number;
  mrpMinor: number;
  inStock: boolean;
  maxQty: number;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const height = visible ? (barRef.current?.offsetHeight ?? 0) : 0;
    root.style.setProperty("--sticky-atc-height", `${height}px`);
    return () => root.style.setProperty("--sticky-atc-height", "0px");
  }, [visible]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      {visible && (
        <div
          ref={barRef}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-safe-bottom shadow-card backdrop-blur md:hidden"
        >
          <div className="flex items-center gap-3 pb-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-semibold text-ink">
                {name}
              </p>
              <p className="font-body text-sm font-semibold text-forest">
                {formatINR(priceMinor)}
              </p>
            </div>
            <AddToCartButton
              productId={productId}
              name={name}
              slug={slug}
              image={image}
              priceMinor={priceMinor}
              mrpMinor={mrpMinor}
              inStock={inStock}
              maxQty={maxQty}
            />
          </div>
        </div>
      )}
    </>
  );
}
