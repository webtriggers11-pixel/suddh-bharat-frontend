import type { Metadata } from "next";
import seo from "../config/seo.json";

/** Site-wide constants from config/seo.json (URL overridable per environment). */
export const site = {
  ...seo.site,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? seo.site.url,
};

/** The host this deployment declares itself to be (env override wins). */
export const CONFIGURED_HOST = (() => {
  try {
    return new URL(site.url).host;
  } catch {
    return new URL(seo.site.url).host;
  }
})();

/**
 * Reduce a Host / X-Forwarded-Host value to a comparable hostname.
 *
 * Every step here exists because getting it wrong serves `Disallow: /` on the
 * real site:
 * - a chain of proxies (a CDN in front of the host) joins the forwarded values
 *   into `"shuddha.in, internal.railway.app"` — the first entry is the client-
 *   facing one;
 * - a fully-qualified Host can carry a trailing dot (`shuddha.in.`);
 * - the port is not part of the site's identity;
 * - apex and `www.` are the same site.
 */
function normalizeHost(host: string): string {
  return host
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

/**
 * Whether a request arriving on `requestHost` is this site's own public host,
 * and therefore safe to let search engines index (FEAT-027).
 *
 * Compared against `site.url` — what this deployment says it is — NOT against
 * a hardcoded production domain. That matters: the backend already deploys to
 * Railway (`apps/suddh-bharat-backend/railway.json`) and the storefront is
 * expected to follow, so before a custom domain is attached the public host is
 * a `*.up.railway.app` URL. Hardcoding shuddha.in would have served
 * `Disallow: /` on the real production site. Setting `NEXT_PUBLIC_SITE_URL` to
 * whatever the deployment actually serves is the single source of truth.
 *
 * `www.` is stripped from both sides, so serving at the apex or at www is the
 * same site either way — getting that wrong would de-index production.
 *
 * A missing header means we cannot tell, so we allow: wrongly blocking
 * production is far more damaging than wrongly allowing a preview.
 */
export function isIndexableHost(requestHost?: string | null): boolean {
  if (!requestHost) return true;
  return normalizeHost(requestHost) === normalizeHost(CONFIGURED_HOST);
}

/** Absolute URL on the resolved site origin, e.g. "/shop" → "https://…/shop". */
export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/+$/, "");
  return path === "/" ? base : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageSeo = {
  path: string;
  title: string;
  description?: string;
  keywords?: string[];
  openGraph?: { title?: string; description?: string };
  twitter?: { title?: string; description?: string };
};

export type PageKey = keyof typeof seo.pages;

/** Path for a page defined in config/seo.json — the same value `pageMetadata`
 * builds the canonical from, so the sitemap cannot drift from it. */
export function pagePath(key: PageKey): string {
  return (seo.pages[key] as { path: string }).path;
}

/**
 * Build Next `Metadata` for a page from config/seo.json. DRY: description falls
 * back to the site description; OG/Twitter titles fall back to the page title;
 * OG/Twitter descriptions fall back to the resolved description. Only overrides
 * that actually differ live in the JSON.
 */
export function pageMetadata(key: PageKey): Metadata {
  const page = seo.pages[key] as PageSeo;
  const description = page.description ?? site.description;
  return {
    title: page.title,
    description,
    keywords: page.keywords,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: new URL(page.path, site.url).toString(),
      locale: site.locale,
      title: page.openGraph?.title ?? page.title,
      description: page.openGraph?.description ?? description,
    },
    twitter: {
      card: "summary_large_image",
      title: page.twitter?.title ?? page.title,
      description: page.twitter?.description ?? description,
    },
  };
}

/** Organization + WebSite JSON-LD, derived from the site config (no repetition). */
