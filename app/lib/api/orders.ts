// Typed client for addresses + orders/checkout (requires a Bearer access token).
import { ApiError } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type AddressType = "HOME" | "WORK" | "OTHER";

export interface Address {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  isLocked: boolean;
}

export interface AddressInput {
  type?: AddressType;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export type PaymentMethod = "COD" | "RAZORPAY" | "UPI";

export interface OrderItem {
  id: string;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amountMinor: number;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  couponCode: string | null;
  totalMinor: number;
  paymentMethod: PaymentMethod;
  shipName: string;
  shipPhone: string;
  shipLine1: string;
  shipLine2: string | null;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  placedAt: string | null;
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

export type StatusTone = "verified" | "accent" | "pending" | "neutral";

/** Human label for an order status (shared by /orders, /orders/[id], account). */
export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Awaiting payment",
    PLACED: "Order placed",
    CONFIRMED: "Order confirmed",
    PROCESSING: "Being prepared",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUND_INITIATED: "Refund initiated",
    REFUNDED: "Refunded",
  };
  return map[status] ?? status;
}

/** Maps an order status to a StatusPill tone. */
export function orderStatusTone(status: string): StatusTone {
  if (status === "DELIVERED" || status === "CONFIRMED") return "verified";
  if (status === "PENDING") return "pending";
  if (status === "CANCELLED" || status === "REFUNDED") return "neutral";
  return "neutral";
}

export const addressApi = {
  list: (token: string) => request<Address[]>("/addresses", token),
  create: (token: string, input: AddressInput) =>
    request<Address>("/addresses", token, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  setDefault: (token: string, id: string) =>
    request<Address>(`/addresses/${id}/default`, token, { method: "PATCH" }),
  remove: (token: string, id: string) =>
    request<{ id: string }>(`/addresses/${id}`, token, { method: "DELETE" }),
};

export interface CouponQuote {
  couponId: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountAmountMinor: number;
  finalTotalMinor: number;
}

export const couponApi = {
  /** Validate a code against a cart total (paise) → discount quote, or throws. */
  validate: (token: string, code: string, cartTotalMinor: number) =>
    request<CouponQuote>("/coupons/validate", token, {
      method: "POST",
      body: JSON.stringify({ code, cartTotalMinor }),
    }),
};

export const orderApi = {
  checkout: (
    token: string,
    input: {
      addressId: string;
      paymentMethod: PaymentMethod;
      couponCode?: string;
      notes?: string;
    },
  ) =>
    request<Order>("/orders", token, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  mine: (token: string) => request<Order[]>("/orders/me", token),
  get: (token: string, id: string) => request<Order>(`/orders/${id}`, token),
  cancel: (token: string, id: string) =>
    request<Order>(`/orders/${id}/cancel`, token, { method: "PATCH" }),
};
