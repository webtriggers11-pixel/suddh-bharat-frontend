import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VerificationStamp } from "./VerificationStamp";

describe("VerificationStamp", () => {
  it("renders the seal with its accessible label by default (lg)", () => {
    render(<VerificationStamp />);
    expect(
      screen.getByRole("img", { name: "Shuddha verified seal — checked and clean" }),
    ).toBeInTheDocument();
  });

  it("renders the same seal at a compact size (sm), same accessible label", () => {
    const { container } = render(<VerificationStamp size="sm" />);
    expect(
      screen.getByRole("img", { name: "Shuddha verified seal — checked and clean" }),
    ).toBeInTheDocument();
    // Compact wrapper, not the homepage-hero width.
    expect(container.querySelector(".w-12")).toBeInTheDocument();
    expect(container.querySelector(".w-\\[min\\(320px\\,80\\%\\)\\]")).toBeNull();
  });
});
