// Typed client for the per-user cart API (requires a Bearer access token).
import { ApiError } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface CartLine {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  priceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  stock: number;
  isActive: boolean;
}

export interface CartSummary {
  items: CartLine[];
  itemCount: number;
  totalMinor: number;
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

export const cartApi = {
  get: (token: string) => request<CartSummary>("/cart", token),
  add: (token: string, productId: string, quantity = 1) =>
    request<CartSummary>("/cart", token, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  setQuantity: (token: string, productId: string, quantity: number) =>
    request<CartSummary>(`/cart/${productId}`, token, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  remove: (token: string, productId: string) =>
    request<CartSummary>(`/cart/${productId}`, token, { method: "DELETE" }),
  clear: (token: string) =>
    request<CartSummary>("/cart", token, { method: "DELETE" }),
};
