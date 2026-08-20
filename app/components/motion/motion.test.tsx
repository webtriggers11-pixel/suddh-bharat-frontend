import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageTransition } from "./PageTransition";
import { Reveal } from "./Reveal";
import { Tappable } from "./Tappable";

// Motion primitives must always render their children (animation is progressive
// enhancement — content is present regardless of motion/reduced-motion state).
describe("motion primitives", () => {
  it("PageTransition renders its children", () => {
    render(<PageTransition>hello page</PageTransition>);
    expect(screen.getByText("hello page")).toBeInTheDocument();
  });

  it("Reveal renders its children", () => {
    render(<Reveal>revealed content</Reveal>);
    expect(screen.getByText("revealed content")).toBeInTheDocument();
  });

  it("Tappable renders its children", () => {
    render(
      <Tappable>
        <button type="button">tap me</button>
      </Tappable>,
    );
    expect(screen.getByRole("button", { name: /tap me/i })).toBeInTheDocument();
  });
});
