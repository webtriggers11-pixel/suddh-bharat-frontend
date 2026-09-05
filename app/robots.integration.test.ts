import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Integration counterpart to `robots.test.ts`, which mocks `./lib/seo`
 * wholesale. That isolation is why the first version of this gate shipped
 * serving `Disallow: /` for `www.shuddha.in` and for the Railway production
 * host: the unit tests asserted against a stub and passed happily. Here only
 * the request headers are faked — the real `isIndexableHost` and `absoluteUrl`
 * run, against the real `config/seo.json`.
 */
let host: string | null = null;
let forwardedHost: string | null = null;

vi.mock("next/headers", () => ({
  headers: async () =>
    ({
      get: (name: string) =>
        name === "x-forwarded-host" ? forwardedHost : host,
    }) as unknown as Headers,
}));

const { default: robots } = await import("./robots");

const allows = async () => {
  const rules = (await robots()).rules as { allow?: string; disallow?: unknown };
  return rules.allow === "/";
};

beforeEach(() => {
  host = null;
  forwardedHost = null;
});

describe("robots.txt against the real seo config", () => {
  it("allows the production host and points at the real sitemap URL", async () => {
    host = "shuddha.in";
    const result = await robots();
    expect(await allows()).toBe(true);
    expect(result.sitemap).toBe("https://shuddha.in/sitemap.xml");
  });

  it.each([
    "www.shuddha.in",
    "shuddha.in:443",
    "SHUDDHA.IN",
    "shuddha.in.",
    "shuddha.in, edge-proxy.internal",
  ])("allows the production host as %s", async (value) => {
    host = value;
    expect(await allows()).toBe(true);
  });

  it.each([
    "localhost:3005",
    "shuddha-preview-abc.up.railway.app",
    "evil-shuddha.in",
    "shuddha.in.attacker.com",
  ])("blocks %s", async (value) => {
    host = value;
    expect(await allows()).toBe(false);
    expect((await robots()).sitemap).toBeUndefined();
  });

  it("uses the proxy's forwarded host over the internal one", async () => {
    host = "web.railway.internal";
    forwardedHost = "shuddha.in";
    expect(await allows()).toBe(true);
  });

  // No header at all: we cannot tell, and wrongly blocking production is far
  // worse than wrongly allowing a preview.
  it("allows when neither header is present", async () => {
    expect(await allows()).toBe(true);
  });
});
