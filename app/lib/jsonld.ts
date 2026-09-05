// JSON-LD builders (FEAT-028). Kept separate from `seo.ts`, which owns page
// <meta>, so each file has one job. All money arrives as integer paise
// (ADR-0010) and is formatted here, at the edge.
//
// Guiding rule, from Google's structured-data spam policy: never mark up
// something the page does not actually show, and never invent a value we do
// not have. A missing recommended property is a Search Console warning; a
// fabricated one risks a manual action that removes rich-result eligibility
// site-wide. So `brand`, `sku`, `shippingDetails`, `hasMerchantReturnPolicy`
// and `priceValidUntil` are all deliberately absent — we have no real data for
// them.
import { absoluteUrl, site } from "./seo";
import type { Product } from "./api/catalog";
import type { JournalArticle } from "../journal/content";

const SCHEMA = "https://schema.org";

/** Stable node ids, so nodes can cross-reference instead of being duplicated. */
const ID = {
  organization: `${site.url}/#organization`,
  website: `${site.url}/#website`,
  product: (slug: string) => `${absoluteUrl(`/product/${slug}`)}#product`,
  article: (slug: string) => `${absoluteUrl(`/journal/${slug}`)}#article`,
  breadcrumb: (path: string) => `${absoluteUrl(path)}#breadcrumb`,
};

/**
 * Integer paise → a schema.org price string, e.g. 129900 → "1299.00".
 *
 * Integer arithmetic on purpose: `paise / 100` is float division and
 * 1234567 / 100 stringifies as "12345.669999999998". schema.org also requires
 * a `.` decimal point with no thousands separator and no currency symbol —
 * the currency belongs in `priceCurrency`.
 */
export function schemaPrice(minor: number): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(minor));
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Site-wide identity. Homepage only — Google wants one instance per site. */
export function organizationGraph() {
  return {
    "@context": SCHEMA,
    "@graph": [
      {
        // OnlineStore is the subtype Google recommends for e-commerce.
        "@type": "OnlineStore",
        "@id": ID.organization,
        name: site.name,
        url: site.url,
        description: site.description,
        slogan: site.tagline,
      },
      {
        "@type": "WebSite",
        "@id": ID.website,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": ID.organization },
        inLanguage: "en-IN",
      },
    ],
  };
}

/** One crumb of a visible breadcrumb trail. `url` is omitted on the last one. */
export interface Crumb {
  name: string;
  path?: string;
}

/**
 * BreadcrumbList mirroring a trail the page actually renders. Only call this
 * where a visible breadcrumb exists — marking up an invisible one is the
 * "content not visible to readers" violation.
 */
export function breadcrumbJsonLd(pagePath: string, crumbs: Crumb[]) {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    "@id": ID.breadcrumb(pagePath),
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

/**
 * Product + a single Offer — the markup that earns price, availability and
 * stars in search results. `Offer` (not `AggregateOffer`) because Shuddha is
 * the seller; that is what makes the page eligible as a merchant listing.
 */
export function productJsonLd(
  product: Product,
  options: { categoryName?: string | null } = {},
) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const onSale = product.mrpMinor > product.priceMinor;

  return {
    "@context": SCHEMA,
    "@type": "Product",
    "@id": ID.product(product.slug),
    name: product.name,
    url,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images.length ? { image: product.images } : {}),
    ...(options.categoryName ? { category: options.categoryName } : {}),
    ...(product.color ? { color: product.color } : {}),
    ...(product.material ? { material: product.material } : {}),
    // Only when real reviews back it. A rating of 0 from 0 reviewers is both
    // out of the 1-5 range and unsupported by anything on the page.
    ...(product.reviewCount > 0 && product.avgRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: schemaPrice(product.priceMinor),
      priceCurrency: "INR",
      availability: `${SCHEMA}/${product.stock > 0 ? "InStock" : "OutOfStock"}`,
      itemCondition: `${SCHEMA}/NewCondition`,
      seller: { "@id": ID.organization },
      // The strikethrough MRP, expressed the way Google documents it: the
      // active price plus a second, StrikethroughPrice-typed specification.
      // Only when the MRP is genuinely higher — an equal "MRP" would be a fake
      // discount, which the spam policy treats as deceptive.
      ...(onSale
        ? {
            priceSpecification: [
              {
                "@type": "UnitPriceSpecification",
                price: schemaPrice(product.priceMinor),
                priceCurrency: "INR",
              },
              {
                "@type": "UnitPriceSpecification",
                priceType: `${SCHEMA}/StrikethroughPrice`,
                price: schemaPrice(product.mrpMinor),
                priceCurrency: "INR",
              },
            ],
          }
        : {}),
    },
  };
}

/** BlogPosting for a journal article. */
export function articleJsonLd(article: JournalArticle) {
  const url = absoluteUrl(`/journal/${article.slug}`);
  return {
    "@context": SCHEMA,
    "@type": "BlogPosting",
    "@id": ID.article(article.slug),
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt,
    // The articles are house editorial with no bylined author, so the
    // publisher is the author — a reference, not a fabricated Person.
    author: { "@id": ID.organization },
    publisher: { "@id": ID.organization },
    inLanguage: "en-IN",
  };
}
