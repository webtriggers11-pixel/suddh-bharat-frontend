// Site constants come from config/seo.json via ./seo (single source — DRY).
export { site } from "./seo";

// Shipping policy (paise) — shared by checkout's fee calc and the PDP trust
// line so the two can never state different thresholds.
export const FREE_SHIPPING_MINOR = 49900;
export const FLAT_SHIPPING_MINOR = 4900;

export type NavItem = { label: string; href: string; muted?: boolean };

/**
 * Non-category header links. Always present, always after the categories, and
 * the sidebar's secondary section is derived from these (`muted`) — one source
 * of truth for both call sites.
 */
export const SECONDARY_NAV: NavItem[] = [
  { label: "Our Standard", href: "/our-standard", muted: true },
  { label: "Sell on Shuddha", href: "/sell", muted: true },
  { label: "Journal", href: "/journal", muted: true },
];

/**
 * Header nav used when the catalogue cannot be reached (backend down, build
 * time before the API exists). Mirrors the seeded top-level categories so the
 * header degrades to something sensible rather than to "Shop" alone.
 */
export const NAV: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Food", href: "/shop?category=food" },
  { label: "Baby", href: "/shop?category=baby" },
  { label: "Beauty", href: "/shop?category=beauty" },
  { label: "Clothing", href: "/shop?category=clothing" },
  ...SECONDARY_NAV,
];

/**
 * Header nav from the live catalogue (FEAT-021): "Shop", then every active
 * top-level category in the admin's sort order, then the secondary links. An
 * empty catalogue falls back to `NAV` so a transient API failure never renders
 * a bare header.
 */
export function buildNav(
  categories: { name: string; slug: string }[],
): NavItem[] {
  if (categories.length === 0) return NAV;
  return [
    { label: "Shop", href: "/shop" },
    ...categories.map((c) => ({
      label: c.name,
      href: `/shop?category=${c.slug}`,
    })),
    ...SECONDARY_NAV,
  ];
}
