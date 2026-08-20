import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SectionNav } from "./SectionNav";

describe("SectionNav", () => {
  it("renders all sections and marks the active one (mobile + desktop)", () => {
    render(
      <SectionNav active="orders" onSelect={() => {}} onSignOut={() => {}} />,
    );
    // Two variants render (tab bar + sidebar) → two buttons per section.
    const orders = screen.getAllByRole("button", { name: "Orders" });
    expect(orders.length).toBe(2);
    orders.forEach((b) => expect(b).toHaveAttribute("aria-current", "page"));
  });

  it("calls onSelect with the chosen section", async () => {
    const onSelect = vi.fn();
    render(
      <SectionNav active="profile" onSelect={onSelect} onSignOut={() => {}} />,
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "Addresses" })[0],
    );
    expect(onSelect).toHaveBeenCalledWith("addresses");
  });

  it("calls onSignOut from the sidebar action", async () => {
    const onSignOut = vi.fn();
    render(
      <SectionNav active="profile" onSelect={() => {}} onSignOut={onSignOut} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
