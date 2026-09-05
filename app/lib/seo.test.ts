import { describe, expect, it } from "vitest";
import { CANONICAL_HOST, absoluteUrl, isCanonicalHost } from "./seo";

describe("isCanonicalHost (FEAT-027)", () => {
  it("accepts the production host", () => {
    expect(CANONICAL_HOST).toBe("shuddha.in");
    expect(isCanonicalHost("shuddha.in")).toBe(true);
  });

  it("ignores the port, so a proxied production host still matches", () => {
    expect(isCanonicalHost("shuddha.in:443")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isCanonicalHost("Shuddha.IN")).toBe(true);
  });

  // The cases this exists for.
  it("rejects localhost and preview hosts", () => {
    expect(isCanonicalHost("localhost:3005")).toBe(false);
    expect(isCanonicalHost("shuddha-preview-abc.up.railway.app")).toBe(false);
  });

  // A look-alike domain must not be treated as production.
  it("rejects a host that merely ends with the canonical one", () => {
    expect(isCanonicalHost("evil-shuddha.in")).toBe(false);
    expect(isCanonicalHost("shuddha.in.attacker.com")).toBe(false);
  });

  it("falls back to the configured URL when there is no host header", () => {
    expect(isCanonicalHost(null)).toBe(true);
    expect(isCanonicalHost(undefined)).toBe(true);
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
