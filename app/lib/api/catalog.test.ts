import { describe, it, expect } from "vitest";
import { formatINR, discountPct } from "./catalog";

describe("formatINR", () => {
  it("formats whole rupees with Indian grouping and no decimals", () => {
    expect(formatINR(129900)).toBe("₹1,299");
    expect(formatINR(34900)).toBe("₹349");
  });

  it("shows paise when not a whole rupee amount", () => {
    expect(formatINR(34950)).toBe("₹349.50");
  });

  it("groups lakhs the Indian way", () => {
    expect(formatINR(1000000)).toBe("₹10,000");
    expect(formatINR(12345600)).toBe("₹1,23,456");
  });
});

describe("discountPct", () => {
  it("computes rounded percentage off", () => {
    expect(discountPct(34900, 42000)).toBe(17);
  });

  it("returns 0 when there is no discount", () => {
    expect(discountPct(42000, 42000)).toBe(0);
    expect(discountPct(50000, 42000)).toBe(0);
    expect(discountPct(1000, 0)).toBe(0);
  });
});
