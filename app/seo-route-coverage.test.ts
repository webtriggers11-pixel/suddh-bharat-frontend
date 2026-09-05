import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DISALLOWED_PATHS } from "./robots";

/**
 * Drift guard. Every other SEO test asserts against a hardcoded list, so a
 * route added later — a new marketing page, a new account screen — would land
 * in neither the sitemap nor robots.txt and nobody would notice.
 *
 * This walks `app/` for real top-level routes and fails until each one is
 * explicitly either published (in the sitemap) or hidden (in robots.txt). The
 * fix when it fails is to make that decision, not to extend a list silently.
 */
const APP_DIR = join(import.meta.dirname);

/** Top-level route segments that render a page, ignoring dynamic segments. */
function topLevelRoutes(): string[] {
  return readdirSync(APP_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("_") && !name.startsWith("[") && !name.startsWith("("))
    .filter((name) => existsSync(join(APP_DIR, name, "page.tsx")))
    .map((name) => `/${name}`);
}

/** Published in the sitemap (static entries + the dynamic sections they head). */
const PUBLISHED = ["/shop", "/our-standard", "/sell", "/journal", "/product"];

describe("every route is either published or hidden", () => {
  it("finds the routes it is supposed to be guarding", () => {
    // If this ever returns nothing the whole suite would vacuously pass.
    expect(topLevelRoutes().length).toBeGreaterThan(5);
  });

  it.each(topLevelRoutes())("%s is accounted for", (route) => {
    const published = PUBLISHED.includes(route);
    const hidden = DISALLOWED_PATHS.some(
      (path) => route === path || route.startsWith(path),
    );
    expect(
      published || hidden,
      `${route} is in neither the sitemap nor robots.txt — decide which it should be`,
    ).toBe(true);
  });

  it("never both publishes and hides the same route", () => {
    for (const route of PUBLISHED) {
      expect(
        DISALLOWED_PATHS.some((path) => route === path || route.startsWith(path)),
        `${route} is in the sitemap AND disallowed in robots.txt`,
      ).toBe(false);
    }
  });

  /**
   * A stale entry is as misleading as a missing one. Checks the directory
   * exists rather than a top-level `page.tsx`, because a namespace can hold
   * only nested routes (`/auth` → `auth/callback/page.tsx`) or route handlers
   * (`/api` → `api/revalidate/route.ts`).
   */
  it.each(DISALLOWED_PATHS)("%s corresponds to a real route", (path) => {
    const segment = path.replace(/^\//, "").replace(/\/$/, "").split("/")[0];
    expect(
      existsSync(join(APP_DIR, segment)),
      `robots.txt disallows /${segment}, which no longer exists under app/`,
    ).toBe(true);
  });
});
