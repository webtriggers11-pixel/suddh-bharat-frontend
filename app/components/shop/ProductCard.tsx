import Image from "next/image";
import Link from "next/link";
import { Tappable } from "../motion/Tappable";
import {
  discountPct,
  formatINR,
  type Product,
} from "../../lib/api/catalog";

/**
 * Storefront product tile. Design-system tokens only (paper/line/forest/gold,
 * 4px card radius, Fraunces title). Subtle hover-lift via the shared Tappable
 * motion primitive. Money is formatted from integer paise at the edge.
 */
export function ProductCard({ product }: { product: Product }) {
  const off = discountPct(product.priceMinor, product.mrpMinor);
  const image = product.images[0];
  const badge = product.isNew
    ? "NEW"
    : product.isBestseller
      ? "BESTSELLER"
      : null;

  return (
    <Tappable className="h-full">
      <Link
        href={`/product/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white"
      >
        <div className="relative aspect-square overflow-hidden bg-paper-dim">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-gray">
              NO IMAGE
            </div>
          )}
          {badge && (
            <span className="absolute left-3 top-3 rounded-chip bg-forest px-2 py-1 font-mono text-[10px] tracking-wider text-paper">
              {badge}
            </span>
          )}
          {off > 0 && (
            <span className="absolute right-3 top-3 rounded-chip bg-gold px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-ink">
              {off}% OFF
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-[17px] font-semibold leading-snug text-ink">
            {product.name}
          </h3>
          {product.material && (
            <p className="mt-1 font-body text-[13px] text-gray">
              {product.material}
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
          {product.stock === 0 && (
            <p className="mt-2 font-mono text-[11px] tracking-wide text-gold">
              OUT OF STOCK
            </p>
          )}
        </div>
      </Link>
    </Tappable>
  );
}
