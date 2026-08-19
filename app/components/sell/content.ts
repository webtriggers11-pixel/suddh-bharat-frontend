// "Sell on Shuddha" copy — from business/website-content.md §4.
export const STATS = [
  { value: "₹0", label: "LISTING FEE — WE EARN WHEN YOU DO" },
  { value: "12–15%", label: "COMMISSION PER ORDER, NO HIDDEN COSTS" },
] as const;

export const FEATURES = [
  { index: "01", title: "A ready audience", copy: "A storefront on a platform where every visitor is already looking for what you make." },
  { index: "02", title: "The Shuddha badge", copy: "Instant credibility with new customers on every listing you have." },
  { index: "03", title: "Zero listing fees", copy: "We only earn when you do — no upfront or monthly cost to join." },
  { index: "04", title: "You stay in control", copy: "Keep control of inventory, packaging, and fulfilment — always." },
] as const;

export const ASKS = [
  "Full ingredient, fabric, or sourcing disclosure for review",
  "Consistent, timely fulfilment — dispatch within 24–48 hrs",
  "Honesty if your formulation changes — tell us before your customers find out",
] as const;

export const TERMS = [
  { label: "Listing fee", value: "₹0" },
  { label: "Commission", value: "12–15% per order" },
  { label: "Payout cycle", value: "Bi-weekly" },
  { label: "Fulfilment", value: "Brand-managed" },
] as const;

export const SELL_CATEGORIES = ["Food & Pantry", "Baby", "Beauty", "Clothing"] as const;
