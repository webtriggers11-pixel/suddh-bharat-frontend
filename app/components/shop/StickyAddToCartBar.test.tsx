import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StickyAddToCartBar } from "./StickyAddToCartBar";

// Keep the test focused on the show/hide + display logic — AddToCartButton's
// own cart-mutation behavior is out of scope here (it's reused unmodified).
vi.mock("./AddToCartButton", () => ({
  AddToCartButton: () => <button type="button">Add to cart</button>,
}));

let intersectionCallback: (entries: { isIntersecting: boolean }[]) => void =
  () => {};

class MockIntersectionObserver {
  constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
    intersectionCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const baseProps = {
  productId: "p1",
  name: "Cold-Pressed Mustard Oil",
  slug: "cold-pressed-mustard-oil",
  image: null,
  priceMinor: 39900,
  mrpMinor: 48000,
  inStock: true,
  maxQty: 10,
};

describe("StickyAddToCartBar", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stays hidden while the main buy button is in view", () => {
    render(<StickyAddToCartBar {...baseProps} />);
    act(() => intersectionCallback([{ isIntersecting: true }]));
    expect(screen.queryByText("Cold-Pressed Mustard Oil")).not.toBeInTheDocument();
  });

  it("shows the bar with name/price/button once the main buy button scrolls out of view", () => {
    render(<StickyAddToCartBar {...baseProps} />);
    act(() => intersectionCallback([{ isIntersecting: false }]));
    expect(screen.getByText("Cold-Pressed Mustard Oil")).toBeInTheDocument();
    expect(screen.getByText("₹399")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
  });

  it("hides again once scrolled back to where the main button is visible", () => {
    render(<StickyAddToCartBar {...baseProps} />);
    act(() => intersectionCallback([{ isIntersecting: false }]));
    expect(screen.getByText("Cold-Pressed Mustard Oil")).toBeInTheDocument();
    act(() => intersectionCallback([{ isIntersecting: true }]));
    expect(screen.queryByText("Cold-Pressed Mustard Oil")).not.toBeInTheDocument();
  });

  it("publishes --sticky-atc-height while visible so PWABadge can shift up, and clears it when hidden", () => {
    // jsdom always reports 0 for offsetHeight, so this asserts the
    // show/hide *call pattern* (a property update per transition, ending on
    // "0px" once hidden) rather than a real measured pixel value.
    const setProperty = vi.spyOn(document.documentElement.style, "setProperty");
    render(<StickyAddToCartBar {...baseProps} />);

    act(() => intersectionCallback([{ isIntersecting: false }]));
    expect(setProperty).toHaveBeenCalledWith(
      "--sticky-atc-height",
      expect.stringMatching(/^\d+px$/),
    );

    setProperty.mockClear();
    act(() => intersectionCallback([{ isIntersecting: true }]));
    expect(setProperty).toHaveBeenCalledWith("--sticky-atc-height", "0px");
  });
});
