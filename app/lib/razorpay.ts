// Loads the Razorpay Checkout browser SDK on demand and exposes a typed handle.
import type { RazorpayCallback } from "./api/payment";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayCallback) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: (payload: unknown) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

/** Ensure the SDK script is present. Resolves false if it cannot be loaded. */
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    // A prior tag may already exist but have finished (loaded OR errored). Its
    // load/error events won't fire again, so DON'T just attach listeners and
    // wait forever — remove a stale/errored tag and re-inject a fresh one.
    const stale = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (stale) stale.remove();

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    // Hard timeout so a hung/blocked load can never wedge the checkout button.
    const timeout = setTimeout(() => resolve(false), 12000);
    const done = (ok: boolean) => {
      clearTimeout(timeout);
      resolve(ok && Boolean(window.Razorpay));
    };
    script.onload = () => done(true);
    script.onerror = () => done(false);
    document.body.appendChild(script);
  });
}

/** Open the Razorpay checkout modal. Caller must have loaded the SDK first. */
export function openRazorpay(options: RazorpayOptions): RazorpayInstance {
  if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");
  const rzp = new window.Razorpay(options);
  rzp.open();
  return rzp;
}
