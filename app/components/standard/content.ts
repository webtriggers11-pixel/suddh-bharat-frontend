// "Our Standard" copy — from business/website-content.md §2.
export const STANDARDS = [
  {
    index: "01",
    category: "Food & Pantry",
    criteria: [
      "No artificial colours, flavours, or synthetic preservatives",
      "No high-fructose corn syrup or hydrogenated oils",
      "Full ingredient disclosure required before listing",
      "Sourcing & manufacturing location disclosed on request",
    ],
  },
  {
    index: "02",
    category: "Baby",
    criteria: [
      "No parabens, phthalates, sulfates, or synthetic fragrance",
      "Dermatologically safe formulations for baby skin",
      "Toys & cloth: non-toxic materials and dyes only, safety-tested",
      "Priority given to brands with third-party safety certification",
    ],
  },
  {
    index: "03",
    category: "Beauty",
    criteria: [
      "No parabens, sulfates (SLS/SLES), or synthetic fragrance",
      "No microplastics or ingredients banned in the EU",
      "Full INCI ingredient list published per product",
      "Batch-level consistency checked on renewal",
    ],
  },
  {
    index: "04",
    category: "Clothing",
    criteria: [
      "Organic or natural fibres — cotton, linen, hemp, bamboo",
      "Natural or low-impact dyes only",
      "Fair-trade or ethically audited manufacturing preferred",
      "Material composition disclosed on every listing",
    ],
  },
] as const;

export const STANDARD_QUOTE =
  "We'd rather have 200 brands we trust completely than 2,000 we haven't checked.";
