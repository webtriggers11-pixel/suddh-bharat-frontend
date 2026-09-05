import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationGraph,
  productJsonLd,
  schemaPrice,
} from "./jsonld";
import type { Product } from "./api/catalog";

const product = (over: Partial<Product> = {}): Product =>
  ({
    id: "p1",
    name: "Stone-Ground Atta",
    slug: "stone-ground-atta",
    description: "Whole wheat, nothing else.",
    priceMinor: 34900,
    mrpMinor: 42000,
    stock: 10,
    images: ["https://cdn.test/atta-1.jpg", "https://cdn.test/atta-2.jpg"],
    categoryId: "food",
    tags: [],
    collection: null,
    material: null,
    color: null,
    isActive: true,
    isHandmade: true,
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    avgRating: 0,
    reviewCount: 0,
    ...over,
  }) as Product;

describe("schemaPrice", () => {
  it("formats integer paise as a decimal rupee string", () => {
    expect(schemaPrice(129900)).toBe("1299.00");
    expect(schemaPrice(34950)).toBe("349.50");
    expect(schemaPrice(5)).toBe("0.05");
    expect(schemaPrice(0)).toBe("0.00");
  });

  /**
   * The reason this is integer arithmetic: 1234567 / 100 stringifies as
   * "12345.669999999998", which is not a valid price.
   */
  it("never emits float error", () => {
    expect(schemaPrice(1234567)).toBe("12345.67");
    expect(schemaPrice(470)).toBe("4.70");
  });

  // schema.org requires a "." decimal point, no separators, no symbol.
  it("emits no thousands separator or currency symbol", () => {
    const value = schemaPrice(123456789);
    expect(value).toBe("1234567.89");
    expect(value).not.toMatch(/[,₹]/);
  });
});

describe("productJsonLd", () => {
  it("marks up an Offer with the price and currency Google requires", () => {
    const data = productJsonLd(product());
    expect(data["@type"]).toBe("Product");
    expect(data.offers).toMatchObject({
      "@type": "Offer",
      price: "349.00",
      priceCurrency: "INR",
      itemCondition: "https://schema.org/NewCondition",
    });
    expect(Number(data.offers.price)).toBeGreaterThan(0);
  });

  it("reflects stock in availability", () => {
    expect(productJsonLd(product({ stock: 3 })).offers.availability).toBe(
      "https://schema.org/InStock",
    );
    expect(productJsonLd(product({ stock: 0 })).offers.availability).toBe(
      "https://schema.org/OutOfStock",
    );
  });

  /**
   * The rule that matters most: a rating of 0 from 0 reviewers is out of the
   * 1-5 range AND unsupported by anything on the page — markup Google treats
   * as misleading. Our products default to exactly that.
   */
  it("omits aggregateRating entirely when nothing is rated", () => {
    expect(productJsonLd(product())).not.toHaveProperty("aggregateRating");
    expect(
      productJsonLd(product({ avgRating: 0, reviewCount: 4 })),
    ).not.toHaveProperty("aggregateRating");
    expect(
      productJsonLd(product({ avgRating: 4.5, reviewCount: 0 })),
    ).not.toHaveProperty("aggregateRating");
  });

  it("includes aggregateRating once real reviews back it", () => {
    const data = productJsonLd(product({ avgRating: 4.5, reviewCount: 2 }));
    expect(data.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 2,
    });
  });

  it("expresses a real MRP as a strikethrough price", () => {
    const specs = productJsonLd(product()).offers.priceSpecification;
    expect(specs).toEqual([
      {
        "@type": "UnitPriceSpecification",
        price: "349.00",
        priceCurrency: "INR",
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/StrikethroughPrice",
        price: "420.00",
        priceCurrency: "INR",
      },
    ]);
  });

  // An "MRP" equal to (or below) the price is a fake discount.
  it("omits the strikethrough when there is no real discount", () => {
    expect(
      productJsonLd(product({ mrpMinor: 34900 })).offers,
    ).not.toHaveProperty("priceSpecification");
    expect(
      productJsonLd(product({ mrpMinor: 30000 })).offers,
    ).not.toHaveProperty("priceSpecification");
  });

  /**
   * We have no brand, SKU, shipping or returns data. Recommended properties
   * left out are a warning; invented ones risk a manual action.
   */
  it("invents nothing we do not have", () => {
    const data = productJsonLd(product());
    for (const key of ["brand", "sku", "gtin", "mpn", "review"]) {
      expect(data).not.toHaveProperty(key);
    }
    for (const key of [
      "shippingDetails",
      "hasMerchantReturnPolicy",
      "priceValidUntil",
    ]) {
      expect(data.offers).not.toHaveProperty(key);
    }
  });

  it("omits optional fields that are null rather than emitting null", () => {
    const data = productJsonLd(
      product({ description: null, images: [], color: null, material: null }),
    );
    for (const key of ["description", "image", "color", "material", "category"]) {
      expect(data).not.toHaveProperty(key);
    }
  });

  it("uses absolute URLs and a stable id", () => {
    const data = productJsonLd(product());
    expect(data.url).toBe("https://shuddha.in/product/stone-ground-atta");
    expect(data["@id"]).toBe(
      "https://shuddha.in/product/stone-ground-atta#product",
    );
    expect(data.offers.url).toBe(data.url);
  });

  it("carries the category name when one is known", () => {
    expect(
      productJsonLd(product(), { categoryName: "Food & Pantry > Staples" })
        .category,
    ).toBe("Food & Pantry > Staples");
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers the crumbs and drops the url on the last one", () => {
    const data = breadcrumbJsonLd("/product/atta", [
      { name: "Shop", path: "/shop" },
      { name: "Atta" },
    ]);
    expect(data.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: "https://shuddha.in/shop",
      },
      { "@type": "ListItem", position: 2, name: "Atta" },
    ]);
  });
});

describe("articleJsonLd", () => {
  const article = {
    slug: "why-we-built-shuddha",
    title: "Why we built Shuddha",
    eyebrow: "STORY",
    excerpt: "The short version.",
    body: [],
    publishedAt: "2026-09-01",
  };

  it("emits a BlogPosting with the real publish date", () => {
    const data = articleJsonLd(article);
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.headline).toBe("Why we built Shuddha");
    expect(data.datePublished).toBe("2026-09-01");
    expect(data.url).toBe("https://shuddha.in/journal/why-we-built-shuddha");
  });

  // House editorial with no byline: reference the publisher rather than
  // inventing a Person.
  it("attributes the article to the organisation, not a made-up author", () => {
    const data = articleJsonLd(article);
    expect(data.author).toEqual({ "@id": "https://shuddha.in/#organization" });
    expect(data.publisher).toEqual(data.author);
  });
});

describe("organizationGraph", () => {
  it("declares an OnlineStore and a WebSite that references it", () => {
    const graph = organizationGraph()["@graph"];
    expect(graph[0]["@type"]).toBe("OnlineStore");
    expect(graph[0]["@id"]).toBe("https://shuddha.in/#organization");
    expect(graph[1]).toMatchObject({
      "@type": "WebSite",
      publisher: { "@id": "https://shuddha.in/#organization" },
    });
  });

  // Retired by Google in Nov 2024 — emitting it earns nothing.
  it("emits no SearchAction", () => {
    expect(JSON.stringify(organizationGraph())).not.toContain("SearchAction");
  });
});
