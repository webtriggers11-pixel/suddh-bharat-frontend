// Homepage content — copy from business/website-content.md, kept separate from
// presentation so sections stay reusable and the copy is editable in one place.

export const LEDGER = [
  "Ingredient & fabric checked",
  "No sulfates, parabens, HFCS",
  "Verified before listing",
  "Direct from small, honest brands",
] as const;

export type CategoryTone = "dark" | "light" | "gold";

/**
 * Editorial headline + copy per category slug. The catalogue is the source of
 * truth for WHICH categories exist and what they are called (FEAT-021); this
 * supplies the homepage's brand voice, which the DB has no column for. An
 * admin overrides the copy by filling the category's description; a category
 * with neither falls back to its own name.
 */
export const CATEGORY_EDITORIAL: Record<
  string,
  { title: string; copy: string }
> = {
  food: {
    title: "Additive-free staples & snacks",
    copy: "Everyday essentials checked for artificial colours, preservatives, and hidden sugar.",
  },
  baby: {
    title: "Non-toxic, always",
    copy: "Skincare, food, cloth & toys checked before they touch your child.",
  },
  beauty: {
    title: "Paraben & sulfate-free",
    copy: "Full ingredient list published on every product. No exceptions.",
  },
  clothing: {
    title: "Organic fibre, natural dye",
    copy: "Slow fashion from fair-trade and ethically audited makers.",
  },
};

export const STEPS = [
  {
    n: 1,
    title: "Full disclosure",
    copy: "Brand submits complete ingredient, fabric, or sourcing information for review.",
  },
  {
    n: 2,
    title: "Standard review",
    copy: "Checked category-by-category against Shuddha's published clean standard.",
  },
  {
    n: 3,
    title: "Badge & listing",
    copy: "Approved brands get the Shuddha badge, shown on every product page.",
  },
] as const;

// Placeholder founders until real brands are onboarded (names distinct so the
// section doesn't ship four identical headings).
export const BRANDS = [
  { mark: "Food", name: "Honest Pantry", quote: "We stopped using preservatives the day our own kids started eating it." },
  { mark: "Baby", name: "Little Sprout", quote: "Every batch is tested before it goes near a baby's skin." },
  { mark: "Beauty", name: "Bare Beauty", quote: "No fragrance list means no fragrance we can't explain." },
  { mark: "Clothing", name: "Slow Thread", quote: "Natural dye takes longer. We think that's the point." },
] as const;
