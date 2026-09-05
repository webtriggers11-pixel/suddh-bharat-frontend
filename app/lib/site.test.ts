import { describe, expect, it } from "vitest";
import { NAV, SECONDARY_NAV, buildNav } from "./site";

describe("buildNav (FEAT-021)", () => {
  it("puts Shop first, then the catalogue categories in the given order", () => {
    const nav = buildNav([
      { name: "Food & Pantry", slug: "food" },
      { name: "Baby", slug: "baby" },
    ]);
    expect(nav.slice(0, 3)).toEqual([
      { label: "Shop", href: "/shop" },
      { label: "Food & Pantry", href: "/shop?category=food" },
      { label: "Baby", href: "/shop?category=baby" },
    ]);
  });

  it("always ends with the secondary links, marked muted", () => {
    const nav = buildNav([{ name: "Baby", slug: "baby" }]);
    expect(nav.slice(-SECONDARY_NAV.length)).toEqual(SECONDARY_NAV);
    expect(nav.filter((i) => i.muted)).toEqual(SECONDARY_NAV);
  });

  // A transient API failure returns [] — the header must not collapse to "Shop".
  it("falls back to the static NAV when the catalogue is empty", () => {
    expect(buildNav([])).toBe(NAV);
  });

  it("reflects a category renamed in the admin dashboard", () => {
    const nav = buildNav([{ name: "Pantry Staples", slug: "food" }]);
    expect(nav).toContainEqual({
      label: "Pantry Staples",
      href: "/shop?category=food",
    });
    expect(nav.map((i) => i.label)).not.toContain("Food");
  });
});
