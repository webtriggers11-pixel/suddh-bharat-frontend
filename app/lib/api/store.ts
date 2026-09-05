// Storefront read of the shipping/COD policy an admin edits in the dashboard's
// Store Settings (FEAT-023). Money is integer paise (ADR-0010).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface StorePolicy {
  /** null = shipping is never free. */
  freeShippingThresholdMinor: number | null;
  flatShippingFeeMinor: number;
  codEnabled: boolean;
  codChargeMinor: number;
  minOrderMinor: number;
}

/**
 * Used when the backend is unreachable. These are the values the storefront
 * used to hardcode, so a failed fetch degrades to today's behaviour rather
 * than to free shipping on everything.
 */
export const FALLBACK_POLICY: StorePolicy = {
  freeShippingThresholdMinor: 49900,
  flatShippingFeeMinor: 4900,
  codEnabled: true,
  codChargeMinor: 0,
  minOrderMinor: 0,
};

/** Shipping/COD terms shown to shoppers. Cached under the `store-policy` tag,
 * which the backend busts whenever an admin saves Store Settings. */
export async function getStorePolicy(): Promise<StorePolicy> {
  try {
    const res = await fetch(`${API_URL}/store/policy`, {
      next: { revalidate: 300, tags: ["store-policy"] },
    });
    if (!res.ok) return FALLBACK_POLICY;
    return (await res.json()) as StorePolicy;
  } catch {
    return FALLBACK_POLICY;
  }
}

/** Shipping charged on a cart subtotal, per the live policy. */
export function shippingFeeMinor(
  subtotalMinor: number,
  policy: StorePolicy,
): number {
  const threshold = policy.freeShippingThresholdMinor;
  if (threshold !== null && subtotalMinor >= threshold) return 0;
  return policy.flatShippingFeeMinor;
}
