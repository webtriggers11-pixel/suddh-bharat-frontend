import { render, screen, waitFor, within } from "@testing-library/react";
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

  it("toggles the mobile sidebar open and closed via the header button", async () => {
    renderHeader();
    const menuBtn = screen.getByRole("button", { name: /menu/i });
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument();

    await userEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: /mobile/i })).toBeInTheDocument();

    await userEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the sidebar via its own Close button and via the backdrop", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    expect(screen.getByRole("navigation", { name: /mobile/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const backdrop = document.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop as Element);
    await waitFor(() =>
      expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument(),
    );
  });

  it("closes the sidebar on Escape and locks/restores background scroll while open", async () => {
    const originalOverflow = document.body.style.overflow;
    renderHeader();
    expect(document.body.style.overflow).toBe(originalOverflow);

    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    expect(screen.getByRole("navigation", { name: /mobile/i })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument(),
    );
    expect(document.body.style.overflow).toBe(originalOverflow);
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

  it("sidebar holds account/Journal/Our-Standard/Sell-on-Shuddha, not Wishlist (BottomTabBar owns that on mobile)", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const sidebar = screen.getByRole("navigation", { name: /mobile/i });

    expect(within(sidebar).getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Fshop",
    );
    expect(within(sidebar).getByRole("link", { name: "Journal" })).toHaveAttribute(
      "href",
      "/journal",
    );
    expect(within(sidebar).getByRole("link", { name: "Our Standard" })).toHaveAttribute(
      "href",
      "/our-standard",
    );
    expect(within(sidebar).getByRole("link", { name: "Sell on Shuddha" })).toHaveAttribute(
      "href",
      "/sell",
    );
    expect(within(sidebar).queryByRole("link", { name: /wishlist/i })).not.toBeInTheDocument();
  });

  it("closes the sidebar and navigates when a sidebar link is clicked", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: /menu/i }));
    const sidebar = screen.getByRole("navigation", { name: /mobile/i });

    await userEvent.click(within(sidebar).getByRole("link", { name: "Journal" }));
    await waitFor(() =>
      expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument(),
    );
  });
});
