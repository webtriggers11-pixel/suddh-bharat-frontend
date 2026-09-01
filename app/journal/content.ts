// Journal — editorial copy (FEAT-018). Data separate from presentation per
// CLAUDE.md DRY rule. FIRST DRAFT: real, on-brand copy written to be concrete
// and grounded rather than generic — the human reviews/edits before this is
// treated as final marketing content (spec §Open questions).

export type JournalArticle = {
  slug: string;
  title: string;
  eyebrow: string;
  excerpt: string;
  body: string[];
  publishedAt: string; // ISO date
};

export const ARTICLES: JournalArticle[] = [
  {
    slug: "what-shuddha-verified-actually-checks",
    title: "What “Shuddha Verified” actually checks for",
    eyebrow: "VERIFICATION",
    excerpt:
      "“Verified” is a word we don't hand out for a good photo and a nice story. Here's exactly what a brand has to clear before it carries our mark.",
    publishedAt: "2026-08-18",
    body: [
      "Every brand on Shuddha gets checked against a published standard before it's allowed to list a single product — not once, but on every renewal. We built the standard category by category, because “clean” means something different for a jar of ghee than it does for a baby's cloth diaper, and treating them the same is exactly how vague labels happen in the first place.",
      "For food and pantry, that means no artificial colours, flavours, or synthetic preservatives, no high-fructose corn syrup or hydrogenated oils, and full ingredient disclosure before we'll even review the listing — sourcing and manufacturing location are shared on request, not hidden behind a customer-care email. For beauty, we check the full INCI list against a standing exclusion list (parabens, sulfates, synthetic fragrance, anything on the EU's banned-ingredients list) and re-check it at renewal, because formulations change quietly and a brand that passed a year ago isn't automatically clean today.",
      "For baby products we go further: no parabens, phthalates, sulfates, or synthetic fragrance, dermatologically safe formulations, and for toys and cloth, materials and dyes that are non-toxic and safety-tested — we give priority to brands that already carry third-party safety certification, because a baby's skin doesn't get the benefit of the doubt. Clothing gets checked for fibre (organic or natural — cotton, linen, hemp, bamboo), dye process (natural or low-impact only), and manufacturing conditions, with material composition disclosed on every single listing, not buried in a size chart.",
      "None of this is a one-time badge. A brand that stops disclosing, changes a formulation without telling us, or fails a spot re-check loses the mark — the same way it earned it. We'd rather list 200 brands we've actually checked than 2,000 we're taking on faith, and we say that to founders directly when they apply, not just to customers after the fact.",
    ],
  },
  {
    slug: "why-clean-labels-matter-in-india",
    title: "Why a “clean” label means something different in India",
    eyebrow: "STANDARDS",
    excerpt:
      "“Natural,” “chemical-free,” and “organic” aren't protected words on an Indian shelf the way you'd assume — here's what that gap actually costs shoppers.",
    publishedAt: "2026-08-25",
    body: [
      "Walk down any aisle — online or offline — and you'll see “100% natural,” “chemical-free,” or “Ayurvedic” printed across packaging that has never been independently checked against any of those words. FSSAI regulates safety and nutritional labelling, but marketing claims like “natural” or “clean” aren't a legally defined, independently policed category the way “organic” is meant to be under India Organic certification — and even that certification is easy for a shopper to miss on a crowded label. The result is a market where the word carries no weight until someone actually checks it.",
      "That gap matters more here than it might elsewhere, for a simple reason: household purchasing in India is disproportionately about what goes on or into a baby, and disproportionately trust-based rather than review-based. A parent buying a baby lotion or a first solid food isn't reading a peer-reviewed ingredient breakdown — they're trusting a brand name, a relative's recommendation, or a label claim, because that's how the category has always worked. When that trust is misplaced, the cost isn't a bad Amazon review; it's actual exposure for someone who can't advocate for themselves.",
      "It also matters because India's beauty, baby, and food-adjacent D2C market has grown faster than any independent verification layer has kept pace with. Hundreds of new “clean” and “natural” brands launch every year, many of them genuinely good, some of them printing the word because it sells and betting no one checks. A shopper has no practical way to tell the two apart from a product photo and a founder story — which is precisely the gap a real, published, category-specific standard is supposed to close.",
      "So when we say a brand is “Shuddha Verified,” we mean it's been checked against a specific list, in a specific category, by us, before you ever add it to cart — not that it used the right adjectives in its Instagram bio.",
    ],
  },
  {
    slug: "why-we-built-shuddha",
    title: "Why we built Shuddha",
    eyebrow: "FOUNDER'S NOTE",
    excerpt:
      "A short note on the moment that started this — and why we decided the fix was a marketplace with a standard attached, not another wellness blog.",
    publishedAt: "2026-09-01",
    body: [
      "This started with a fairly ordinary moment: standing in front of a shelf, phone in hand, trying to decide whether a baby product's “natural fragrance” claim meant anything at all, and realising there was no fast way to find out. Not because the information didn't exist somewhere — a determined person could dig through an ingredient list and cross-reference it against banned substances — but because no one had done that work and put it in front of the shopper at the moment they needed it. Every purchase decision was being made on trust with no mechanism behind it.",
      "We didn't want to build another blog telling people which ten ingredients to avoid, because that puts the entire burden back on the shopper — read the fine print, remember the banned list, do the work yourself, every single time, for every category, forever. That's not a solution, it's homework. What felt like an actual fix was flipping the order: check the brand before it's ever allowed on the shelf, publish exactly what we checked, and let the shopper spend their attention on choosing what they like, not on defending themselves.",
      "So Shuddha is a marketplace, but the marketplace part is really just the delivery mechanism. The actual product is the standard — the category-by-category checklist every brand has to clear, the willingness to say no to a brand that won't disclose, and the discipline to re-check instead of treating verification as a one-time stamp. We'd rather grow slowly with 200 brands we've genuinely checked than fast with 2,000 we're hoping are fine.",
      "We're early, and this catalogue is small on purpose — we're not going to claim we've checked a brand we haven't just to make the homepage look fuller. If you're a shopper, that means everything you see here has already been through the standard. If you're a brand that meets it, we'd like to hear from you.",
    ],
  },
];

export function getArticle(slug: string): JournalArticle | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

/** "18 Aug 2026" — consistent date formatting for index + article views. */
export function formatArticleDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
