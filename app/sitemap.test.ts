import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Category, Product } from "./lib/api/catalog";

const categories = vi.fn();
const fetchAllProducts = vi.fn();
vi.mock("./lib/api/catalog", () => ({
  catalogApi: { categories: () => categories() },
  fetchAllProducts: () => fetchAllProducts(),
}));
// `./lib/seo` is deliberately NOT mocked: the URLs below are built by the real
// `absoluteUrl` against the real config/seo.json, so the "every URL is
// absolute and canonical" criterion is proven against production behaviour
// rather than a stub that would agree with anything.
vi.mock("./journal/content", () => ({
  ARTICLES: [{ slug: "why-we-built-shuddha", publishedAt: "2026-09-01" }],
}));

const { default: sitemap } = await import("./sitemap");

const category = (over: Partial<Category>): Category => ({
  id: "c",
  name: "Food",
  slug: "food",
  description: null,
  image: null,
  parentId: null,
  sortOrder: 0,
  isActive: true,
  ...over,
});
const product = (slug: string): Product => ({ slug }) as Product;

beforeEach(() => {
  categories.mockResolvedValue([]);
  fetchAllProducts.mockResolvedValue([]);
});

const urls = async () => (await sitemap()).map((e) => e.url);

describe("sitemap.xml (FEAT-027)", () => {
  it("lists the public static pages and nothing private", async () => {
    const list = await urls();
    expect(list).toEqual([
      "https://shuddha.in",
      "https://shuddha.in/shop",
      "https://shuddha.in/our-standard",
      "https://shuddha.in/sell",
      "https://shuddha.in/journal",
      "https://shuddha.in/journal/why-we-built-shuddha",
    ]);
    for (const path of ["/cart", "/checkout", "/account", "/orders", "/search"]) {
      expect(list).not.toContain(`https://shuddha.in${path}`);
    }
  });

  it("includes every active product", async () => {
    fetchAllProducts.mockResolvedValue([product("atta"), product("makhana")]);
    const list = await urls();
    expect(list).toContain("https://shuddha.in/product/atta");
    expect(list).toContain("https://shuddha.in/product/makhana");
  });

  /**
   * `?category=` maps to the backend's `categorySlug`, which resolves against
   * `parentId: null` only — a subcategory URL renders an empty grid, i.e. a
   * soft 404 advertised in the sitemap.
   */
  it("lists top-level categories only, never subcategories", async () => {
    categories.mockResolvedValue([
      category({
        id: "food",
        slug: "food",
        children: [category({ id: "staples", slug: "staples", parentId: "food" })],
      }),
      category({ id: "staples", slug: "staples", parentId: "food" }),
    ]);
    fetchAllProducts.mockResolvedValue([
      { slug: "atta", categoryId: "staples" } as Product,
    ]);
    const list = await urls();
    expect(list).toContain("https://shuddha.in/shop?category=food");
    expect(list).not.toContain("https://shuddha.in/shop?category=staples");
  });

  /**
   * A top-level category with no products renders the same empty grid a
   * subcategory URL would — the soft-404 the top-level-only rule exists to
   * avoid. Reuses the already-fetched product list, so it costs no request.
   */
  it("skips a top-level category that has no products", async () => {
    categories.mockResolvedValue([
      category({ id: "food", slug: "food" }),
      category({ id: "empty", slug: "empty" }),
    ]);
    fetchAllProducts.mockResolvedValue([
      { slug: "atta", categoryId: "food" } as Product,
    ]);
    const list = await urls();
    expect(list).toContain("https://shuddha.in/shop?category=food");
    expect(list).not.toContain("https://shuddha.in/shop?category=empty");
  });

  // Products hang off subcategories, so a parent counts as populated when any
  // of its children has one.
  it("keeps a category whose products sit in its subcategories", async () => {
    categories.mockResolvedValue([
      category({
        id: "food",
        slug: "food",
        children: [category({ id: "staples", slug: "staples", parentId: "food" })],
      }),
    ]);
    fetchAllProducts.mockResolvedValue([
      { slug: "atta", categoryId: "staples" } as Product,
    ]);
    expect(await urls()).toContain("https://shuddha.in/shop?category=food");
  });

  it("uses the category's real updatedAt as lastModified", async () => {
    categories.mockResolvedValue([
      category({ id: "food", updatedAt: "2026-09-01T10:00:00.000Z" }),
    ]);
    fetchAllProducts.mockResolvedValue([
      { slug: "atta", categoryId: "food" } as Product,
    ]);
    const entry = (await sitemap()).find((e) => e.url.includes("?category="));
    expect(entry?.lastModified).toEqual(new Date("2026-09-01T10:00:00.000Z"));
  });

  it("uses the article's publish date as lastModified", async () => {
    const entry = (await sitemap()).find((e) => e.url.includes("/journal/"));
    expect(entry?.lastModified).toEqual(new Date("2026-09-01"));
  });

  /**
   * Product rows carry no `updatedAt` (the storefront projection omits it by
   * design). A fabricated date would tell Google everything changed on every
   * crawl, which teaches it to ignore our lastmod entirely — so we send none.
   */
  it("sends no lastModified for products rather than a fabricated one", async () => {
    fetchAllProducts.mockResolvedValue([product("atta")]);
    const entry = (await sitemap()).find((e) => e.url.includes("/product/"));
    expect(entry?.lastModified).toBeUndefined();
  });

  it("percent-encodes slugs so no raw character reaches the XML", async () => {
    fetchAllProducts.mockResolvedValue([product("a b&c")]);
    expect(await urls()).toContain("https://shuddha.in/product/a%20b%26c");
  });

  // catalogApi degrades to empty on a backend failure; the sitemap must still
  // be valid rather than throwing and serving a 500 to the crawler.
  it("degrades to the static pages when the catalogue is unreachable", async () => {
    const list = await urls();
    expect(list).toContain("https://shuddha.in");
    expect(list.some((u) => u.includes("/product/"))).toBe(false);
  });

  it("emits an absolute URL for every entry", async () => {
    categories.mockResolvedValue([category({ id: "food" })]);
    fetchAllProducts.mockResolvedValue([
      { slug: "atta", categoryId: "food" } as Product,
    ]);
    for (const url of await urls()) {
      expect(url.startsWith("https://shuddha.in")).toBe(true);
    }
  });
});
