import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { SiteHeader } from "./SiteHeader";
import { AuthProvider } from "../../lib/auth/AuthProvider";
import { CartProvider } from "../../lib/cart/CartProvider";

// No tokens in localStorage → AuthProvider makes no network call and the cart
// stays empty (CartProvider skips the fetch when signed out).
const renderHeader = () =>
  render(
    <AuthProvider>
      <CartProvider>
        <SiteHeader />
      </CartProvider>
    </AuthProvider>,
  );

describe("SiteHeader", () => {
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
});
