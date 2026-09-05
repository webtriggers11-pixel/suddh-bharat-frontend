import { describe, expect, it } from "vitest";
import { CONFIGURED_HOST, absoluteUrl, isIndexableHost } from "./seo";

describe("isIndexableHost (FEAT-027)", () => {
  it("accepts the host this deployment declares itself to be", () => {
    expect(CONFIGURED_HOST).toBe("shuddha.in");
    expect(isIndexableHost("shuddha.in")).toBe(true);
  });

  /**
   * Serving at www while the config names the apex (or the reverse) must NOT
   * de-index production — that would be far worse than the preview-indexing
   * problem this gate exists to prevent.
   */
  it("treats www and the apex as the same site", () => {
    expect(isIndexableHost("www.shuddha.in")).toBe(true);
  });

  it("ignores the port and case", () => {
    expect(isIndexableHost("shuddha.in:443")).toBe(true);
    expect(isIndexableHost("Shuddha.IN")).toBe(true);
  });

  // The cases this exists for.
  it("rejects localhost and preview hosts", () => {
    expect(isIndexableHost("localhost:3005")).toBe(false);
    expect(isIndexableHost("shuddha-preview-abc.up.railway.app")).toBe(false);
  });

  /**
   * A chain of proxies (a CDN in front of the host) joins the forwarded values
   * into one header. The client-facing host is the first entry; comparing the
   * whole string would serve Disallow: / on the real production host.
   */
  it("takes the first entry of a proxy-chained forwarded host", () => {
    expect(isIndexableHost("shuddha.in, internal.railway.app")).toBe(true);
    expect(isIndexableHost("shuddha.in,internal.railway.app")).toBe(true);
    expect(isIndexableHost("preview.up.railway.app, shuddha.in")).toBe(false);
  });

  // A fully-qualified Host may carry a trailing dot.
  it("accepts a fully-qualified host with a trailing dot", () => {
    expect(isIndexableHost("shuddha.in.")).toBe(true);
    expect(isIndexableHost("www.shuddha.in.:443")).toBe(true);
  });

  // A look-alike domain must not be treated as our own site.
  it("rejects a host that merely contains the configured one", () => {
    expect(isIndexableHost("evil-shuddha.in")).toBe(false);
    expect(isIndexableHost("shuddha.in.attacker.com")).toBe(false);
    expect(isIndexableHost("notshuddha.in")).toBe(false);
  });

  /**
   * No header means we cannot tell. Allow — wrongly blocking production is
   * far more damaging than wrongly allowing a preview.
   */
  it("allows when there is no host header", () => {
    expect(isIndexableHost(null)).toBe(true);
    expect(isIndexableHost(undefined)).toBe(true);
    expect(isIndexableHost("")).toBe(true);
  });
});

describe("absoluteUrl", () => {
  it("returns the bare origin for the root", () => {
    expect(absoluteUrl("/")).toBe("https://shuddha.in");
  });

  it("joins a path onto the origin", () => {
    expect(absoluteUrl("/shop")).toBe("https://shuddha.in/shop");
    expect(absoluteUrl("shop")).toBe("https://shuddha.in/shop");
  });
});
