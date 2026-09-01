import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BottomTabBar } from "./BottomTabBar";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

let mockCartCount = 0;
let mockWishlistCount = 0;
vi.mock("../../lib/cart/CartProvider", () => ({
  useCart: () => ({ count: mockCartCount }),
}));
vi.mock("../../lib/wishlist/WishlistProvider", () => ({
  useWishlist: () => ({ count: mockWishlistCount }),
}));

describe("BottomTabBar", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockCartCount = 0;
    mockWishlistCount = 0;
  });

  it("renders all 5 tabs linking to the right routes", () => {
    render(<BottomTabBar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav.querySelectorAll("a")).toHaveLength(5);
    for (const [label, href] of [
      ["Home", "/"],
      ["Shop", "/shop"],
      ["Wishlist", "/wishlist"],
      ["Cart", "/cart"],
      ["Account", "/account"],
    ]) {
      expect(screen.getByRole("link", { name: new RegExp(label) })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  it("marks only the active tab with aria-current, based on the current path", () => {
    mockPathname = "/shop";
    render(<BottomTabBar />);
    expect(screen.getByRole("link", { name: /Shop/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Home/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("does not mark Home active on unrelated nested routes (exact match only)", () => {
    mockPathname = "/product/some-item";
    render(<BottomTabBar />);
    expect(screen.getByRole("link", { name: /Home/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("shows cart/wishlist counts via CountBadge when non-zero", () => {
    mockCartCount = 3;
    mockWishlistCount = 2;
    render(<BottomTabBar />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows no count badge when counts are zero", () => {
    render(<BottomTabBar />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("re-publishes --bottom-tab-bar-height via ResizeObserver, not just once on mount — so it doesn't go stale when md:hidden collapses the bar on a pure resize", () => {
    let resizeCallback: () => void = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    class CapturingResizeObserver {
      constructor(cb: () => void) {
        resizeCallback = cb;
      }
      observe = observe;
      unobserve = () => {};
      disconnect = disconnect;
    }
    // Scoped save/restore (not vi.stubGlobal + vi.unstubAllGlobals) — the
    // latter would also revert IntersectionObserver and anything else ever
    // stubbed for this file, which would silently break a later-appended
    // test that happens to need one of those.
    const originalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = CapturingResizeObserver as unknown as typeof ResizeObserver;
    const setProperty = vi.spyOn(document.documentElement.style, "setProperty");

    const { unmount } = render(<BottomTabBar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(observe).toHaveBeenCalledWith(nav);

    // Simulate the bar shrinking to zero (the md:hidden crossing) and the
    // observer firing in response — this is the exact path a plain
    // mount-only effect would miss.
    Object.defineProperty(nav, "offsetHeight", { value: 0, configurable: true });
    setProperty.mockClear();
    resizeCallback();
    expect(setProperty).toHaveBeenCalledWith("--bottom-tab-bar-height", "0px");

    Object.defineProperty(nav, "offsetHeight", { value: 56, configurable: true });
    setProperty.mockClear();
    resizeCallback();
    expect(setProperty).toHaveBeenCalledWith("--bottom-tab-bar-height", "56px");

    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(setProperty).toHaveBeenLastCalledWith("--bottom-tab-bar-height", "0px");

    window.ResizeObserver = originalResizeObserver;
  });
});
