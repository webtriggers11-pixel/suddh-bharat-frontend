import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "./ProductCard";
import type { Product } from "../../lib/api/catalog";

function makeProduct(over: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Stone-Ground Atta",
    slug: "stone-ground-atta",
    description: null,
    priceMinor: 34900,
    mrpMinor: 42000,
    stock: 10,
    images: ["https://picsum.photos/seed/atta/800/800"],
    categoryId: null,
    tags: [],
    collection: null,
    material: "Whole wheat",
    color: null,
    isActive: true,
    isHandmade: true,
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    avgRating: 0,
    reviewCount: 0,
    ...over,
  };
}

describe("ProductCard", () => {
  it("renders name, price and links to the product", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("Stone-Ground Atta")).toBeInTheDocument();
    expect(screen.getByText("₹349")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/product/stone-ground-atta",
    );
  });

  it("shows a discount badge and struck-through MRP when discounted", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("17% OFF")).toBeInTheDocument();
    expect(screen.getByText("₹420")).toBeInTheDocument();
  });

  it("marks out-of-stock products", () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />);
    expect(screen.getByText("OUT OF STOCK")).toBeInTheDocument();
  });

  it("shows a NEW badge for new arrivals", () => {
    render(<ProductCard product={makeProduct({ isNew: true })} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });
});
