// Typed client for product reviews. Product listing is public; writing needs auth.
import { ApiError } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  userName: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}

async function req<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(b.message) ? b.message[0] : b.message;
    throw new ApiError(msg ?? "Request failed", res.status);
  }
  return (await res.json()) as T;
}

export const reviewApi = {
  /** Approved reviews for a product (public). */
  forProduct: (productId: string) =>
    req<Review[]>(`/reviews/product/${encodeURIComponent(productId)}`),
  /** Write a review (auth). */
  create: (token: string, input: CreateReviewInput) =>
    req<Review>("/reviews", { method: "POST", body: JSON.stringify(input) }, token),
};
