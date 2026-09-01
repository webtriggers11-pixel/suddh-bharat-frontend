import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddToCartButton } from "./AddToCartButton";

const add = vi.fn();
vi.mock("../../lib/cart/CartProvider", () => ({
  useCart: () => ({ add }),
}));

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

describe("AddToCartButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows an out-of-stock message instead of the stepper/button when not in stock", () => {
    render(<AddToCartButton {...baseProps} inStock={false} />);
    expect(
      screen.getByText("This product is currently out of stock."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add to cart/i }),
    ).not.toBeInTheDocument();
  });

  it("steps quantity up/down within [1, maxQty]", async () => {
    render(<AddToCartButton {...baseProps} maxQty={2} />);
    const dec = screen.getByRole("button", { name: "Decrease quantity" });
    const inc = screen.getByRole("button", { name: "Increase quantity" });

    expect(dec).toBeDisabled(); // starts at qty 1
    await userEvent.click(inc);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(inc).toBeDisabled(); // hit maxQty
  });

  it("adds to cart and shows a confirmation with a view-cart link", async () => {
    add.mockResolvedValue(undefined);
    render(<AddToCartButton {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(add).toHaveBeenCalledWith(
      "p1",
      1,
      expect.objectContaining({ productId: "p1", name: "Cold-Pressed Mustard Oil" }),
    );
    expect(await screen.findByText(/added to your cart/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View cart" })).toHaveAttribute(
      "href",
      "/cart",
    );
  });

  it("surfaces an error instead of the confirmation when add fails", async () => {
    add.mockRejectedValue(new Error("Could not add to cart"));
    render(<AddToCartButton {...baseProps} />);

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not add to cart",
    );
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
  });
});
