"use client";

// Guest cart + wishlist held in localStorage for signed-out shoppers. On login
// these are merged into the server (server-authoritative) and cleared. Every
// access is SSR-safe and wrapped in try/catch — storage can be blocked/cleared.

import type { CartSummary } from "../api/cart";

const CART_KEY = "shuddha_guest_cart";
const WISH_KEY = "shuddha_guest_wishlist";

/** A guest cart line — carries a product snapshot so the cart renders offline. */
export interface GuestLine {
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  image: string | null;
  priceMinor: number;
  mrpMinor: number;
  stock: number;
  isActive: boolean;
}

/** The snapshot the UI passes when a guest adds an item. */
export type GuestSnapshot = Omit<GuestLine, "quantity">;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked — ignore */
  }
}

// ---- Guest cart -------------------------------------------------------------

export function getGuestCartLines(): GuestLine[] {
  return read<GuestLine[]>(CART_KEY, []);
}

/** Derive the same CartSummary shape the server returns, from guest lines. */
export function getGuestCartSummary(): CartSummary {
  const lines = getGuestCartLines();
  const items = lines.map((l) => ({
    id: l.productId,
    productId: l.productId,
    name: l.name,
    slug: l.slug,
    image: l.image,
    priceMinor: l.priceMinor,
    quantity: l.quantity,
    lineTotalMinor: l.priceMinor * l.quantity,
    stock: l.stock,
    isActive: l.isActive,
  }));
  const totalMinor = items
    .filter((i) => i.isActive)
    .reduce((s, i) => s + i.lineTotalMinor, 0);
  return { items, itemCount: items.length, totalMinor };
}

export function addGuestCartLine(
  snapshot: GuestSnapshot,
  quantity: number,
): void {
  const lines = getGuestCartLines();
  const existing = lines.find((l) => l.productId === snapshot.productId);
  const next = Math.min(
    (existing?.quantity ?? 0) + quantity,
    Math.max(1, snapshot.stock),
  );
  if (existing) existing.quantity = next;
  else lines.push({ ...snapshot, quantity: next });
  write(CART_KEY, lines);
}

export function setGuestCartQty(productId: string, quantity: number): void {
  const lines = getGuestCartLines()
    .map((l) => (l.productId === productId ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  write(CART_KEY, lines);
}

export function removeGuestCartLine(productId: string): void {
  write(CART_KEY, getGuestCartLines().filter((l) => l.productId !== productId));
}

export function clearGuestCart(): void {
  write(CART_KEY, []);
}

// ---- Guest wishlist ---------------------------------------------------------

export function getGuestWishlist(): string[] {
  return read<string[]>(WISH_KEY, []);
}

export function toggleGuestWishlist(productId: string): boolean {
  const ids = getGuestWishlist();
  const liked = ids.includes(productId);
  write(
    WISH_KEY,
    liked ? ids.filter((id) => id !== productId) : [...ids, productId],
  );
  return !liked;
}

/** Remove a single id from the guest wishlist (used by the merge-on-login flow). */
export function removeGuestWishlistItem(productId: string): void {
  write(WISH_KEY, getGuestWishlist().filter((id) => id !== productId));
}

export function clearGuestWishlist(): void {
  write(WISH_KEY, []);
}

export function hasGuestData(): boolean {
  return getGuestCartLines().length > 0 || getGuestWishlist().length > 0;
}
