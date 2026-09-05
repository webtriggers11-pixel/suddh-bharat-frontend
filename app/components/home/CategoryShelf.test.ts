import { describe, expect, it } from "vitest";
import { gridSpan, toTile, toneFor, type Tile } from "./CategoryShelf";
import { CATEGORY_SHELF } from "./content";
import type { Category } from "../../lib/api/catalog";

const category = (over: Partial<Category> = {}): Category => ({
  id: "c1",
  name: "Food & Pantry",
  slug: "food",
  description: null,
  image: null,
  parentId: null,
  sortOrder: 0,
  isActive: true,
  ...over,
});

describe("toTile (FEAT-021)", () => {
  it("numbers and labels the tile from the catalogue entry", () => {
    const tile = toTile(category(), 0);
    expect(tile.index).toBe("01 / FOOD & PANTRY");
    expect(tile.slug).toBe("food");
    expect(tile.featured).toBe(true);
  });

  it("keeps the editorial headline for a known slug", () => {
    expect(toTile(category({ slug: "baby", name: "Baby" }), 1).title).toBe(
      "Non-toxic, always",
    );
  });

  // A category the admin invents has no editorial entry — fall back to its name
  // rather than rendering an empty headline.
  it("falls back to the category name for an unknown slug", () => {
    const tile = toTile(category({ slug: "wellness", name: "Wellness" }), 4);
    expect(tile.title).toBe("Wellness");
    expect(tile.copy).toBe("");
    expect(tile.index).toBe("05 / WELLNESS");
  });

  // The admin's own description is the override — that's how they edit the copy.
  it("prefers the category description over the editorial copy", () => {
    const tile = toTile(
      category({ description: "Admin-written copy." }),
      0,
    );
    expect(tile.copy).toBe("Admin-written copy.");
  });
});

describe("toneFor", () => {
  it("anchors the grid with the dark tile, then alternates", () => {
    expect([0, 1, 2, 3, 4].map(toneFor)).toEqual([
      "dark",
      "light",
      "gold",
      "light",
      "gold",
    ]);
  });
});

describe("gridSpan", () => {
  const tile = (position: number, featured = false): Tile => ({
    slug: `c${position}`,
    position,
    index: "",
    title: "",
    copy: "",
    tone: "light",
    featured,
  });

  it("makes the featured tile double-height", () => {
    expect(gridSpan(tile(0, true), 4)).toBe("lg:row-span-2");
  });

  // Featured takes one column across two rows, so an even count leaves the last
  // tile alone on its row — let it span rather than leave a hole.
  it("spans the last tile of an even grid", () => {
    expect(gridSpan(tile(3), 4)).toBe("lg:col-span-2");
    expect(gridSpan(tile(2), 4)).toBe("");
  });

  it("leaves an odd grid alone", () => {
    expect(gridSpan(tile(4), 5)).toBe("");
  });
});

describe("CATEGORY_SHELF.headline", () => {
  it("counts what is actually in the catalogue", () => {
    expect(CATEGORY_SHELF.headline(4)).toBe(
      "Four categories. One published standard.",
    );
    expect(CATEGORY_SHELF.headline(5)).toBe(
      "Five categories. One published standard.",
    );
  });

  it("says 'category' for one", () => {
    expect(CATEGORY_SHELF.headline(1)).toBe(
      "One category. One published standard.",
    );
  });

  // Beyond the word list, a digit beats "undefined categories".
  it("falls back to digits past ten", () => {
    expect(CATEGORY_SHELF.headline(12)).toBe(
      "12 categories. One published standard.",
    );
  });
});
