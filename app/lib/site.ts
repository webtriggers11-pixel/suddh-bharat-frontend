// Site constants come from config/seo.json via ./seo (single source — DRY).
export { site } from "./seo";

export type NavItem = { label: string; href: string; muted?: boolean };

export const NAV: NavItem[] = [
  { label: "Food", href: "/#categories" },
  { label: "Baby", href: "/#categories" },
  { label: "Beauty", href: "/#categories" },
  { label: "Clothing", href: "/#categories" },
  { label: "Our Standard", href: "/our-standard", muted: true },
  { label: "Sell on Shuddha", href: "/sell", muted: true },
];
