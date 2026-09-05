import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";
import { catalogApi, fetchAllProducts } from "./lib/api/catalog";
import { ARTICLES } from "./journal/content";

/**
 * Static, always-present pages. `/search` is deliberately absent — it is
 * disallowed in robots.txt as thin/duplicate content.
 */
const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/our-standard", priority: 0.7 },
  { path: "/sell", priority: 0.6 },
  { path: "/journal", priority: 0.5 },
];

/**
 * Storefront sitemap (FEAT-027). Without it, products past the first 24 have no
 * crawlable path at all: `/shop` pages by infinite scroll, so a crawler that
 * does not run the client fetch never sees them.
 *
 * Cached like any other Data-Cache read — the `products` and `categories` tags
 * the backend already busts on every admin write refresh this too, so a product
 * added or hidden in the dashboard is reflected here without a redeploy.
 *
 * `lastModified` is set only where a real date exists (category `updatedAt`,
 * article `publishedAt`). Product rows do not carry `updatedAt` — the
 * storefront projection omits it by design — and inventing one would tell
 * Google every product changed on every crawl, which teaches it to ignore our
 * `lastmod` entirely. See the spec for the tradeoff.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    catalogApi.categories(),
    fetchAllProducts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: "weekly",
    priority: page.priority,
  }));

  // Only top-level categories: `?category=` maps to the backend's
  // `categorySlug`, which resolves against `parentId: null` only, so a
  // subcategory URL would render an empty grid — a soft 404 in the sitemap.
  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => category.parentId === null)
    .map((category) => ({
      url: absoluteUrl(`/shop?category=${encodeURIComponent(category.slug)}`),
      lastModified: category.updatedAt ? new Date(category.updatedAt) : undefined,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${encodeURIComponent(product.slug)}`),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: absoluteUrl(`/journal/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...productEntries,
    ...articleEntries,
  ];
}
