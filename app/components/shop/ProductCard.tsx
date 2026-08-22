import Image from "next/image";
import Link from "next/link";
import { Tappable } from "../motion/Tappable";
import { LikeButton } from "./LikeButton";
import {
  discountPct,
  formatINR,
  type Product,
} from "../../lib/api/catalog";

/**
 * Storefront product tile. Design-system tokens only (paper/line/forest/gold,
 * 4px card radius, Fraunces title). Subtle hover-lift via the shared Tappable
 * primitive plus a calm image zoom + elevation on hover (CSS transitions, which
 * the global reduced-motion rule already disables). Money is formatted from
 * integer paise at the edge.
 */
export function ProductCard({ product }: { product: Product }) {
  const off = discountPct(product.priceMinor, product.mrpMinor);
  const image = product.images[0];
  const soldOut = product.stock === 0;
  const badge = product.isNew
    ? "NEW"
    : product.isBestseller
      ? "BESTSELLER"
      : null;

  return (
    <Tappable className="h-full">
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[box-shadow,border-color] duration-300 hover:border-sage hover:shadow-card"
      >
        <div className="relative aspect-square overflow-hidden bg-paper-dim">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                soldOut ? "opacity-70" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-gray">
              NO IMAGE
            </div>
          )}

          <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
            <div className="pointer-events-none flex flex-col items-start gap-1.5">
              {badge && (
                <span className="rounded-chip bg-forest px-2 py-1 font-mono text-[10px] tracking-wider text-paper">
                  {badge}
                </span>
              )}
              {off > 0 && (
                <span className="rounded-chip bg-gold px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-ink">
                  {off}% OFF
                </span>
              )}
            </div>
            <LikeButton
              productId={product.id}
              redirectTo={`/product/${product.slug}`}
            />
          </div>

          {soldOut && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-ink/70 py-2">
              <span className="font-mono text-[11px] tracking-[0.18em] text-paper">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-[17px] font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-forest">
            {product.name}
          </h3>
          {product.material && (
            <p className="mt-1 font-body text-[13px] text-gray">
              {product.material}
            </p>
          )}

          {product.reviewCount > 0 && (
            <p className="mt-2 font-mono text-[11px] tracking-wide text-gray">
              <span className="text-gold">★</span> {product.avgRating.toFixed(1)}
              <span className="text-line"> · </span>
              {product.reviewCount}
            </p>
          )}

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            <span className="font-body text-[17px] font-semibold text-forest">
              {formatINR(product.priceMinor)}
            </span>
            {off > 0 && (
              <span className="font-body text-sm text-gray line-through">
                {formatINR(product.mrpMinor)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Tappable>
  );
}
