import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  SkeletonBlock,
  SkeletonCardGrid,
  SkeletonListRows,
  SkeletonLines,
} from "./Skeleton";

describe("SkeletonBlock", () => {
  it("renders a single pulsing block", () => {
    const { container } = render(<SkeletonBlock className="h-4 w-4" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("SkeletonCardGrid", () => {
  it("renders the requested number of card tiles", () => {
    const { container } = render(<SkeletonCardGrid count={5} />);
    expect(container.querySelectorAll("li")).toHaveLength(5);
  });

  it("defaults to 8 tiles", () => {
    const { container } = render(<SkeletonCardGrid />);
    expect(container.querySelectorAll("li")).toHaveLength(8);
  });
});

describe("SkeletonListRows", () => {
  it("renders the requested number of rows", () => {
    const { container } = render(<SkeletonListRows count={4} variant="order" />);
    expect(container.querySelectorAll(":scope > div > div")).toHaveLength(4);
  });

  it("omits the thumbnail block for thumbnail-less variants", () => {
    const { container } = render(<SkeletonListRows count={1} variant="address" />);
    const row = container.querySelector(":scope > div > div");
    // address rows have no leading thumbnail — only the text-line column.
    expect(row?.children).toHaveLength(1);
  });

  it("includes a thumbnail block for thumbnail variants", () => {
    const { container } = render(<SkeletonListRows count={1} variant="order" />);
    const row = container.querySelector(":scope > div > div");
    expect(row?.children).toHaveLength(2);
  });
});

describe("SkeletonLines", () => {
  it("renders one block per width", () => {
    const { container } = render(
      <SkeletonLines widths={["h-4 w-1/2", "h-4 w-1/3"]} />,
    );
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });
});
