import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("toggles the mobile menu open and closed", async () => {
    render(<SiteHeader />);
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
