import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SiteHeader } from "./SiteHeader";

// SearchBar calls useRouter, the header uses usePathname — stub both.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shop",
}));

// Cart/wishlist counts drive the count badges + mobile drawer copy — control
// them directly rather than going through the real providers' storage/queries.
let cartCount = 0;
let wishlistCount = 0;
vi.mock("../../lib/cart/CartProvider", () => ({
  useCart: () => ({ count: cartCount }),
}));
vi.mock("../../lib/wishlist/WishlistProvider", () => ({
  useWishlist: () => ({ count: wishlistCount }),
}));

import { AuthProvider } from "../../lib/auth/AuthProvider";
import { TestQueryProvider } from "../../lib/query/TestQueryProvider";

// No tokens in localStorage → AuthProvider makes no network call.
const renderHeader = () =>
  render(
    <TestQueryProvider>
      <AuthProvider>
        <SiteHeader />
      </AuthProvider>
    </TestQueryProvider>,
  );

describe("SiteHeader", () => {
  beforeEach(() => {
    cartCount = 0;
    wishlistCount = 0;
  });

  it("toggles the mobile menu open and closed", async () => {
    renderHeader();
    const openBtn = screen.getByRole("button", { name: /menu/i });
    expect(openBtn).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(openBtn);
    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(closeBtn);
    expect(screen.getByRole("button", { name: /menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("renders the category strip persistently, not behind the burger", () => {
    renderHeader();
    const categories = screen.getByRole("navigation", { name: /categories/i });
    expect(within(categories).getByRole("link", { name: "Food" })).toBeInTheDocument();
    expect(within(categories).getByRole("link", { name: "Beauty" })).toBeInTheDocument();
  });

  it("hides the cart/wishlist count badges at zero", () => {
    renderHeader();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows cart and wishlist count badges once counts are positive", () => {
    cartCount = 3;
    wishlistCount = 2;
    renderHeader();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("exposes a wishlist link in the mobile drawer", async () => {
    wishlistCount = 5;
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const drawer = screen.getByRole("navigation", { name: /mobile/i });
    expect(within(drawer).getByRole("link", { name: /wishlist \(5\)/i })).toBeInTheDocument();
  });
});
