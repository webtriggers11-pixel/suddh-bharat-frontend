import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CountBadge } from "./icons";

describe("CountBadge", () => {
  it("renders nothing at zero", () => {
    render(<CountBadge count={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders nothing below zero", () => {
    render(<CountBadge count={-1} />);
    expect(screen.queryByText("-1")).not.toBeInTheDocument();
  });

  it("renders the count once it's positive", () => {
    render(<CountBadge count={4} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
