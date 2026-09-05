import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Paginated, Product, ProductFilters } from "../../lib/api/catalog";

const products = vi.fn();
vi.mock("../../lib/api/catalog", () => ({
  catalogApi: { products: (f: ProductFilters) => products(f) },
}));

import { pickProducts } from "./FeaturedProducts";

const product = (id: string) => ({ id }) as Product;
const page = (items: Product[]): Paginated<Product> => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 4,
  totalPages: 1,
});

describe("pickProducts (FEAT-022)", () => {
  beforeEach(() => products.mockReset());

  it("shows the products an admin flagged Featured", async () => {
    products.mockResolvedValueOnce(page([product("a"), product("b")]));
    expect(await pickProducts()).toEqual([product("a"), product("b")]);
    expect(products).toHaveBeenCalledExactlyOnceWith({
      isFeatured: true,
      pageSize: 4,
    });
  });

  // Nobody has curated the flag yet — the homepage still shows the catalogue
  // rather than a hole where the shelf should be.
  it("falls back to the newest listing when nothing is flagged", async () => {
    products
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([product("c")]));
    expect(await pickProducts()).toEqual([product("c")]);
    expect(products).toHaveBeenLastCalledWith({ pageSize: 4 });
  });

  // catalogApi degrades to an empty page when the backend is unreachable.
  it("returns nothing when the catalogue is empty", async () => {
    products.mockResolvedValue(page([]));
    expect(await pickProducts()).toEqual([]);
  });
});
