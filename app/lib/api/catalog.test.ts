import { describe, it, expect, vi } from "vitest";
import {
  catalogApi,
  discountPct,
  fetchAllProducts,
  formatINR,
  type Product,
} from "./catalog";

describe("formatINR", () => {
  it("formats whole rupees with Indian grouping and no decimals", () => {
    expect(formatINR(129900)).toBe("₹1,299");
    expect(formatINR(34900)).toBe("₹349");
  });

  it("shows paise when not a whole rupee amount", () => {
    expect(formatINR(34950)).toBe("₹349.50");
  });

  it("groups lakhs the Indian way", () => {
    expect(formatINR(1000000)).toBe("₹10,000");
    expect(formatINR(12345600)).toBe("₹1,23,456");
  });
});

describe("discountPct", () => {
  it("computes rounded percentage off", () => {
    expect(discountPct(34900, 42000)).toBe(17);
  });

  it("returns 0 when there is no discount", () => {
    expect(discountPct(42000, 42000)).toBe(0);
    expect(discountPct(50000, 42000)).toBe(0);
    expect(discountPct(1000, 0)).toBe(0);
  });
});

describe("fetchAllProducts (FEAT-027)", () => {
  const page = (items: string[], totalPages: number, pageNo: number) => ({
    items: items.map((slug) => ({ slug }) as Product),
    total: totalPages * 100,
    page: pageNo,
    pageSize: 100,
    totalPages,
  });

  /**
   * The backend caps pageSize at 100, so a single request would silently
   * truncate the sitemap the moment the catalogue outgrows one page.
   */
  it("pages until the catalogue is exhausted", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValueOnce(page(["a", "b"], 3, 1))
      .mockResolvedValueOnce(page(["c"], 3, 2))
      .mockResolvedValueOnce(page(["d"], 3, 3));

    const all = await fetchAllProducts();

    expect(all.map((p) => p.slug)).toEqual(["a", "b", "c", "d"]);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 100 });
    expect(spy).toHaveBeenNthCalledWith(3, { page: 3, pageSize: 100 });
    spy.mockRestore();
  });

  it("stops after a single page when that is all there is", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValue(page(["a"], 1, 1));
    expect(await fetchAllProducts()).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  // A backend that reports a wrong totalPages must not spin forever.
  it("honours the maxPages safety stop", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValue(page(["a"], 9999, 1));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await fetchAllProducts(3);
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
    warn.mockRestore();
  });

  /**
   * Stopping on the bound means a truncated sitemap — the exact failure this
   * function exists to prevent. It must not be silent.
   */
  it("warns when it truncates at the bound", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValue(page(["a"], 9999, 1));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await fetchAllProducts(2);
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toMatch(/truncated/i);
    spy.mockRestore();
    warn.mockRestore();
  });

  it("does not warn when the catalogue ends naturally", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValue(page(["a"], 1, 1));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await fetchAllProducts(1);
    expect(warn).not.toHaveBeenCalled();
    spy.mockRestore();
    warn.mockRestore();
  });

  // An empty page ends the loop even if totalPages disagrees.
  it("stops on an empty page", async () => {
    const spy = vi
      .spyOn(catalogApi, "products")
      .mockResolvedValue(page([], 5, 1));
    expect(await fetchAllProducts()).toEqual([]);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
