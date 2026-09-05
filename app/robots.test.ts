import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

let requestHost: string | null = "shuddha.in";
let forwardedHost: string | null = null;
vi.mock("next/headers", () => ({
  headers: async () =>
    ({
      get: (name: string) =>
        name === "x-forwarded-host" ? forwardedHost : requestHost,
    }) as unknown as Headers,
}));

const isIndexableHost = vi.fn((host?: string | null) => host === "shuddha.in");
vi.mock("./lib/seo", () => ({
  isIndexableHost: (host?: string | null) => isIndexableHost(host),
  absoluteUrl: (path: string) =>
    path === "/" ? "https://shuddha.in" : `https://shuddha.in${path}`,
}));

const { default: robots, DISALLOWED_PATHS } = await import("./robots");

beforeEach(() => {
  requestHost = "shuddha.in";
  forwardedHost = null;
});
afterEach(() => vi.clearAllMocks());

describe("robots.txt (FEAT-027)", () => {
  it("allows crawling and points at the absolute sitemap URL", async () => {
    const result = await robots();
    expect(result.sitemap).toBe("https://shuddha.in/sitemap.xml");
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
  });

  it("disallows every authenticated route", async () => {
    const rules = (await robots()).rules as { disallow: string[] };
    for (const path of [
      "/account",
      "/cart",
      "/checkout",
      "/orders",
      "/wishlist",
      "/login",
      "/register",
      "/auth/",
      "/api/",
    ]) {
      expect(rules.disallow).toContain(path);
    }
  });

  // Internal search results are thin, near-duplicate content; the products they
  // list are already in the sitemap under their own canonical URLs.
  it("keeps internal search results out", async () => {
    const rules = (await robots()).rules as { disallow: string[] };
    expect(rules.disallow).toContain("/search");
  });

  it("does not disallow anything a shopper should find", async () => {
    const rules = (await robots()).rules as { disallow: string[] };
    for (const path of ["/", "/shop", "/product", "/journal", "/our-standard", "/sell"]) {
      expect(rules.disallow).not.toContain(path);
    }
  });

  /**
   * A preview deploy or localhost resolves to a non-canonical host. Crawling it
   * would put duplicate content in the index competing with production.
   */
  it("blocks everything on a non-canonical host", async () => {
    requestHost = "shuddha-preview-abc123.up.railway.app";
    const result = await robots();
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(result.sitemap).toBeUndefined();
  });

  // Reading the request Host is the whole point — a preview that forgot to set
  // NEXT_PUBLIC_SITE_URL would otherwise report itself as production.
  it("decides from the request host, not the configured site URL", async () => {
    requestHost = "localhost:3005";
    await robots();
    expect(isIndexableHost).toHaveBeenLastCalledWith("localhost:3005");
  });

  // Behind a proxy, Host is the internal address; x-forwarded-host carries the
  // public one, so it has to win or production would look non-canonical.
  it("prefers x-forwarded-host when a proxy sets it", async () => {
    requestHost = "internal-service.railway.internal";
    forwardedHost = "shuddha.in";
    const result = await robots();
    expect(isIndexableHost).toHaveBeenLastCalledWith("shuddha.in");
    expect(result.sitemap).toBe("https://shuddha.in/sitemap.xml");
  });

  it("keeps the disallow list free of duplicates", () => {
    expect(new Set(DISALLOWED_PATHS).size).toBe(DISALLOWED_PATHS.length);
  });
});
