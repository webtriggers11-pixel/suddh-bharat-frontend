import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SiteHeader } from "./SiteHeader";

// SearchBar calls useRouter, the header uses usePathname — stub both.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shop",
}));
import { AuthProvider } from "../../lib/auth/AuthProvider";
import { TestQueryProvider } from "../../lib/query/TestQueryProvider";

// No tokens in localStorage → AuthProvider makes no network call and the cart /
// wishlist queries stay disabled (empty) when signed out.
const renderHeader = () =>
  render(
    <TestQueryProvider>
      <AuthProvider>
        <SiteHeader />
      </AuthProvider>
    </TestQueryProvider>,
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
