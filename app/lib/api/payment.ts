// Typed client for the Razorpay payment flow (requires a Bearer access token).
import { ApiError } from "./auth";
import type { Order } from "./orders";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Response from POST /payment/initiate — everything the browser SDK needs. */
export interface PaymentInitiateResponse {
  razorpayOrderId: string;
  gatewayOrderId: string;
  keyId: string; // public key id — safe in the browser
  amountPaise: number;
  currency: string;
  orderNumber: string;
  transactionId: string;
}

/** The three fields the Razorpay checkout handler returns on success. */
export interface RazorpayCallback {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

async function request<T>(
  path: string,
  token: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(b.message) ? b.message[0] : b.message;
    throw new ApiError(msg ?? "Payment request failed", res.status);
  }
  return (await res.json()) as T;
}

export interface VerifyPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const paymentApi = {
  /** Create a Razorpay order for a PENDING online order. */
  initiate: (token: string, orderId: string) =>
    request<PaymentInitiateResponse>("/payment/initiate", token, { orderId }),

  /** Verify the checkout signature server-side; advances the order to PLACED. */
  verify: (token: string, payload: VerifyPayload) =>
    request<Order>("/payment/verify", token, payload),
};

/**
 * Verify is idempotent server-side, so a transient failure (network blip) is
 * safe to retry — always prefer this over re-initiating, which could open a
 * second gateway order and double-charge a captured payment.
 */
export async function verifyWithRetry(
  token: string,
  payload: VerifyPayload,
  attempts = 3,
): Promise<Order> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await paymentApi.verify(token, payload);
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Verification failed");
}
