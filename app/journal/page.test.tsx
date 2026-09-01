import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Keep the test focused on the journal content/logic — chrome is covered by
// its own component tests (e.g. SiteHeader.test.tsx) and pulls in
// auth/cart/wishlist providers this page doesn't otherwise need.
vi.mock("../components/home/SiteHeader", () => ({
  SiteHeader: () => null,
}));
vi.mock("../components/home/SiteFooter", () => ({
  SiteFooter: () => null,
}));
vi.mock("../components/pwa/PWABadge", () => ({
  PWABadge: () => null,
}));

import JournalIndexPage from "./page";
import { ARTICLES } from "./content";

describe("JournalIndexPage", () => {
  it("renders every article's title, eyebrow, and excerpt", () => {
    render(<JournalIndexPage />);

    for (const article of ARTICLES) {
      expect(
        screen.getByRole("heading", { name: article.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(article.eyebrow)).toBeInTheDocument();
      expect(screen.getByText(article.excerpt)).toBeInTheDocument();
    }
  });

  it("links each article card to its slug", () => {
    render(<JournalIndexPage />);

    for (const article of ARTICLES) {
      expect(
        screen.getByRole("link", { name: new RegExp(article.eyebrow) }),
      ).toHaveAttribute("href", `/journal/${article.slug}`);
    }
  });
});
