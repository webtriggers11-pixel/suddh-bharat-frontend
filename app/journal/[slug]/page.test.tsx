import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Keep the test focused on the journal content/logic — chrome is covered by
// its own component tests and pulls in auth/cart/wishlist providers this
// page doesn't otherwise need.
vi.mock("../../components/home/SiteHeader", () => ({
  SiteHeader: () => null,
}));
vi.mock("../../components/home/SiteFooter", () => ({
  SiteFooter: () => null,
}));
vi.mock("../../components/pwa/PWABadge", () => ({
  PWABadge: () => null,
}));

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

import JournalArticlePage from "./page";
import { ARTICLES, getArticle } from "../content";

describe("JournalArticlePage", () => {
  it("renders the matched article's title, eyebrow, and body", async () => {
    const article = getArticle(ARTICLES[0].slug)!;
    const ui = await JournalArticlePage({
      params: Promise.resolve({ slug: article.slug }),
    });
    render(ui);

    expect(
      screen.getByRole("heading", { level: 1, name: article.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(article.eyebrow)).toBeInTheDocument();
    for (const paragraph of article.body) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound() for an unknown slug instead of crashing on undefined content", async () => {
    await expect(
      JournalArticlePage({
        params: Promise.resolve({ slug: "does-not-exist" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
