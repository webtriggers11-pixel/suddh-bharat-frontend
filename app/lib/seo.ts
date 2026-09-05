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

/** Lowercase, drop any port, and treat `www.x` and `x` as the same site. */
function normalizeHost(host: string): string {
  return host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");
}

/**
 * Whether a request arriving on `requestHost` is this site's own public host,
 * and therefore safe to let search engines index (FEAT-027).
 *
 * Compared against `site.url` — what this deployment says it is — NOT against
 * a hardcoded production domain. That matters: the app is deployed on Railway
 * (`railway.json`), so before a custom domain is attached the public host is a
 * `*.up.railway.app` URL. Hardcoding shuddha.in would have served
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
export function structuredData() {
  const org = { "@id": `${site.url}/#organization` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        ...org,
        name: site.name,
        url: site.url,
        description: site.description,
        slogan: site.tagline,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: org,
        inLanguage: "en-IN",
      },
    ],
  };
}
