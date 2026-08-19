import type { Metadata } from "next";
import seo from "../config/seo.json";

/** Site-wide constants from config/seo.json (URL overridable per environment). */
export const site = {
  ...seo.site,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? seo.site.url,
};

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
