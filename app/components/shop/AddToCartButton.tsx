"use client";

import { useState } from "react";
import { useCart } from "../../lib/cart/CartProvider";
import { Tappable } from "../motion/Tappable";

/**
 * Quantity stepper + add-to-cart. Works for guests too — a signed-out shopper's
 * cart is held in localStorage (merged on login), so no login wall. Shows a
 * brief "Added" confirmation via Motion.
 */
export function AddToCartButton({
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
  const { add } = useCart();

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!inStock) {
    return (
      <p className="rounded-chip border border-line bg-paper-dim px-5 py-3 font-mono text-xs tracking-wide text-gray">
        This product is currently out of stock.
      </p>
    );
  }

  const onAdd = async () => {
    setBusy(true);
    setError(null);
    try {
      // Snapshot lets the guest cart render offline; ignored when signed in.
      await add(productId, qty, {
        productId,
        name,
        slug,
        image,
        priceMinor,
        mrpMinor,
        stock: maxQty,
        isActive: true,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  };

  const step = (delta: number) =>
    setQty((q) => Math.min(Math.max(1, q + delta), Math.max(1, maxQty)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-chip border border-ink">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="px-3 py-2 font-mono text-lg disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-8 text-center font-body text-sm font-semibold">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={qty >= maxQty}
            aria-label="Increase quantity"
            className="px-3 py-2 font-mono text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>

        <Tappable lift={0} className="flex-1">
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            className="w-full rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper transition-colors duration-200 hover:bg-forest-light disabled:opacity-60"
          >
            {busy ? "Adding…" : added ? "Added ✓" : "Add to cart"}
          </button>
        </Tappable>
      </div>

      {added && (
        <p role="status" className="font-mono text-[11px] tracking-wide text-forest">
          Added to your cart.{" "}
          <a href="/cart" className="underline">
            View cart
          </a>
        </p>
      )}
      {error && (
        <p role="alert" className="font-mono text-[11px] tracking-wide text-gold">
          {error}
        </p>
      )}
    </div>
  );
}
