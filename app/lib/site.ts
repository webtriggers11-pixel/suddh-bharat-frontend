// Site constants come from config/seo.json via ./seo (single source — DRY).
export { site } from "./seo";

export type NavItem = { label: string; href: string; muted?: boolean };

export const NAV: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Food", href: "/shop?category=food" },
  { label: "Baby", href: "/shop?category=baby" },
  { label: "Beauty", href: "/shop?category=beauty" },
  { label: "Clothing", href: "/shop?category=clothing" },
  { label: "Our Standard", href: "/our-standard", muted: true },
  { label: "Sell on Shuddha", href: "/sell", muted: true },
];
