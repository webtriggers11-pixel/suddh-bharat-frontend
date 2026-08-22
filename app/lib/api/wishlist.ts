// Typed client for the wishlist ("likes") API (requires a Bearer access token).
import { ApiError } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** A liked product with the snapshot the storefront needs to render a card. */
export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceMinor: number;
    mrpMinor: number;
    images: string[];
    stock: number;
    isActive: boolean;
    isNew: boolean;
    isBestseller: boolean;
    material: string | null;
    avgRating: number;
    reviewCount: number;
  };
}

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new ApiError(msg ?? "Request failed", res.status);
  }
  return (await res.json()) as T;
}

export const wishlistApi = {
  /** Full liked list with product snapshots (for the /wishlist page). */
  list: (token: string) => request<WishlistItem[]>("/wishlist", token),
  /** Lightweight liked product ids (to mark hearts across the app). */
  ids: (token: string) => request<string[]>("/wishlist/ids", token),
  /** Like a product. */
  add: (token: string, productId: string) =>
    request<WishlistItem>("/wishlist", token, {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  /** Unlike a product. */
  remove: (token: string, productId: string) =>
    request<{ productId: string }>(`/wishlist/${productId}`, token, {
      method: "DELETE",
    }),
};
