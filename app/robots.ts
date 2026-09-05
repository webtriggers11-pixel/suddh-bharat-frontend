import { headers } from "next/headers";
import type { MetadataRoute } from "next";
import { absoluteUrl, isCanonicalHost } from "./lib/seo";

/**
 * Routes a crawler must never spend budget on (FEAT-027).
 *
 * The account/commerce routes are behind auth and are not linked from any
 * public page. `/search` is excluded because internal search-result pages are
 * thin, near-duplicate content — Google's own guidance is to keep them out of
 * the index, and the products they list are already in the sitemap under their
 * own canonical `/product/<slug>` URLs.
 *
 * `Disallow` stops crawling, not indexing — a URL linked from elsewhere can
 * still appear as a bare result. These pages are unlinked and authenticated, so
 * that is acceptable; adding `noindex` metadata to each is tracked separately
 * (CHORE-032).
 */
export const DISALLOWED_PATHS = [
  "/account",
  "/api/",
  "/auth/",
  "/cart",
  "/checkout",
  "/login",
  "/orders",
  "/register",
  "/search",
  "/wishlist",
] as const;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // A preview deployment or a local dev server must not be crawled at all — it
  // would compete with production for the same content in search results. Read
  // from the request host, not the configured URL, so a preview that forgets
  // NEXT_PUBLIC_SITE_URL is still blocked. Reading a header makes this route
  // dynamic; for a file this size that costs nothing.
  const host = (await headers()).get("host");
  if (!isCanonicalHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_PATHS],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
