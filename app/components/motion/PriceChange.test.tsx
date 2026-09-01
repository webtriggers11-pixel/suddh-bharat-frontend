import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriceChange } from "./PriceChange";

describe("PriceChange", () => {
  it("renders the given value", () => {
    render(<PriceChange value="₹399" />);
    expect(screen.getByText("₹399")).toBeInTheDocument();
  });

  it("renders the new value when it changes, and the old one is eventually removed (not left duplicated)", async () => {
    const { rerender } = render(<PriceChange value="₹399" />);
    expect(screen.getByText("₹399")).toBeInTheDocument();

    rerender(<PriceChange value="₹798" />);
    expect(await screen.findByText("₹798")).toBeInTheDocument();
    // AnimatePresence keeps the exiting node mounted for its exit animation —
    // the "no duplication" guarantee is about the settled state, not the
    // instant of the value swap, so this must wait rather than assert bare.
    await waitFor(() =>
      expect(screen.queryByText("₹399")).not.toBeInTheDocument(),
    );
  });

  it("applies the given className to the value", () => {
    const { container } = render(
      <PriceChange value="₹399" className="font-semibold" />,
    );
    expect(container.querySelector(".font-semibold")).toHaveTextContent(
      "₹399",
    );
  });
});
