import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RelatedProducts } from "./RelatedProducts";
import { AuthProvider } from "../../lib/auth/AuthProvider";
import { TestQueryProvider } from "../../lib/query/TestQueryProvider";
import type { Product } from "../../lib/api/catalog";

// ProductCard embeds a LikeButton → needs the Query client + Auth context, and
// LikeButton calls useRouter (app-router context stub, same as ProductCard.test.tsx).
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const getRelatedProducts = vi.fn();
vi.mock("../../lib/api/catalog", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api/catalog")>(
    "../../lib/api/catalog",
  );
  return { ...actual, getRelatedProducts: (slug: string) => getRelatedProducts(slug) };
});

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
    categoryId: "cat-1",
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

function renderRelated(slug = "some-product") {
  return render(
    <TestQueryProvider>
      <AuthProvider>
        <RelatedProducts slug={slug} />
      </AuthProvider>
    </TestQueryProvider>,
  );
}

describe("RelatedProducts", () => {
  it("renders a card per related product returned by the API", async () => {
    getRelatedProducts.mockResolvedValueOnce([
      makeProduct({ id: "p1", name: "Stone-Ground Atta", slug: "atta" }),
      makeProduct({ id: "p2", name: "Cold-Pressed Oil", slug: "oil" }),
    ]);
    renderRelated();

    expect(
      await screen.findByRole("heading", { name: "More to explore" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You may also like")).toBeInTheDocument();
    expect(await screen.findByText("Stone-Ground Atta")).toBeInTheDocument();
    expect(screen.getByText("Cold-Pressed Oil")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /./ }).length).toBeGreaterThan(0);
  });

  it("shows a card-grid skeleton while the request is in flight", async () => {
    let resolve!: (v: Product[]) => void;
    getRelatedProducts.mockReturnValueOnce(
      new Promise<Product[]>((r) => {
        resolve = r;
      }),
    );
    const { container } = renderRelated();

    expect(
      await screen.findByRole("heading", { name: "More to explore" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    resolve([]);
  });

  it("renders nothing at all when the API returns an empty list", async () => {
    getRelatedProducts.mockResolvedValueOnce([]);
    const { container } = renderRelated();

    await waitFor(() => expect(getRelatedProducts).toHaveBeenCalled());
    // Give TanStack Query a tick to settle the resolved empty response.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByText("You may also like")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "More to explore" }),
    ).not.toBeInTheDocument();
  });
});
