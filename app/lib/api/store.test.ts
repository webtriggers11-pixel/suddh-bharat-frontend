import { describe, expect, it } from "vitest";
import { FALLBACK_POLICY, shippingFeeMinor, type StorePolicy } from "./store";

const policy = (over: Partial<StorePolicy> = {}): StorePolicy => ({
  ...FALLBACK_POLICY,
  ...over,
});

describe("shippingFeeMinor (FEAT-023)", () => {
  it("charges the flat fee below the admin's threshold", () => {
    expect(
      shippingFeeMinor(48900, policy({ freeShippingThresholdMinor: 49900 })),
    ).toBe(4900);
  });

  it("is free at exactly the threshold", () => {
    expect(
      shippingFeeMinor(49900, policy({ freeShippingThresholdMinor: 49900 })),
    ).toBe(0);
  });

  it("follows a threshold the admin lowers", () => {
    expect(
      shippingFeeMinor(30000, policy({ freeShippingThresholdMinor: 29900 })),
    ).toBe(0);
  });

  // An admin can clear the threshold entirely — "never free".
  it("always charges when the threshold is cleared", () => {
    expect(
      shippingFeeMinor(
        10_000_00,
        policy({ freeShippingThresholdMinor: null, flatShippingFeeMinor: 7900 }),
      ),
    ).toBe(7900);
  });
});
