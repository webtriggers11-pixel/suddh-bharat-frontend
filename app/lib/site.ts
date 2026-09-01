// Site constants come from config/seo.json via ./seo (single source — DRY).
export { site } from "./seo";

// Shipping policy (paise) — shared by checkout's fee calc and the PDP trust
// line so the two can never state different thresholds.
export const FREE_SHIPPING_MINOR = 49900;
export const FLAT_SHIPPING_MINOR = 4900;

export type NavItem = { label: string; href: string; muted?: boolean };

export const NAV: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Food", href: "/shop?category=food" },
  { label: "Baby", href: "/shop?category=baby" },
  { label: "Beauty", href: "/shop?category=beauty" },
  { label: "Clothing", href: "/shop?category=clothing" },
  { label: "Our Standard", href: "/our-standard", muted: true },
  { label: "Sell on Shuddha", href: "/sell", muted: true },
  { label: "Journal", href: "/journal", muted: true },
];
