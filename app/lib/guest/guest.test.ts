import { describe, it, expect, beforeEach } from "vitest";
import {
  addGuestCartLine,
  clearGuestCart,
  getGuestCartLines,
  getGuestCartSummary,
  getGuestWishlist,
  hasGuestData,
  removeGuestCartLine,
  setGuestCartQty,
  toggleGuestWishlist,
  type GuestSnapshot,
} from "./guest";

const snap = (over: Partial<GuestSnapshot> = {}): GuestSnapshot => ({
  productId: "p1",
  name: "Atta",
  slug: "atta",
  image: "img",
  priceMinor: 34900,
  mrpMinor: 42000,
  stock: 10,
  isActive: true,
  ...over,
});

describe("guest cart", () => {
  beforeEach(() => localStorage.clear());

  it("adds, increments, and caps at stock", () => {
    addGuestCartLine(snap({ stock: 3 }), 2);
    addGuestCartLine(snap({ stock: 3 }), 5); // 2+5=7 capped to 3
    const lines = getGuestCartLines();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("derives a CartSummary with line totals (active only)", () => {
    addGuestCartLine(snap(), 2);
    addGuestCartLine(snap({ productId: "p2", isActive: false }), 1);
    const s = getGuestCartSummary();
    expect(s.itemCount).toBe(2);
    expect(s.totalMinor).toBe(34900 * 2); // inactive excluded
    expect(s.items[0].lineTotalMinor).toBe(69800);
  });

  it("sets quantity (removing at 0) and removes a line", () => {
    addGuestCartLine(snap(), 2);
    setGuestCartQty("p1", 5);
    expect(getGuestCartLines()[0].quantity).toBe(5);
    setGuestCartQty("p1", 0);
    expect(getGuestCartLines()).toHaveLength(0);
    addGuestCartLine(snap(), 1);
    removeGuestCartLine("p1");
    expect(getGuestCartLines()).toHaveLength(0);
  });

  it("clears the cart", () => {
    addGuestCartLine(snap(), 1);
    clearGuestCart();
    expect(getGuestCartLines()).toHaveLength(0);
  });
});

describe("guest wishlist", () => {
  beforeEach(() => localStorage.clear());

  it("toggles like on and off", () => {
    expect(toggleGuestWishlist("p1")).toBe(true);
    expect(getGuestWishlist()).toEqual(["p1"]);
    expect(toggleGuestWishlist("p1")).toBe(false);
    expect(getGuestWishlist()).toEqual([]);
  });

  it("hasGuestData reflects cart or wishlist presence", () => {
    expect(hasGuestData()).toBe(false);
    toggleGuestWishlist("p1");
    expect(hasGuestData()).toBe(true);
  });
});
