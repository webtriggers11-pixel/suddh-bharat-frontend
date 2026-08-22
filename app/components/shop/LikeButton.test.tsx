import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LikeButton } from "./LikeButton";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const toggle = vi.fn();
let liked = false;
vi.mock("../../lib/wishlist/WishlistProvider", () => ({
  useWishlist: () => ({ isLiked: () => liked, toggle }),
}));

describe("LikeButton", () => {
  beforeEach(() => {
    push.mockReset();
    toggle.mockReset().mockResolvedValue(true);
    liked = false;
  });

  it("toggles the like (no navigation) — works for guests too", async () => {
    render(<LikeButton productId="p1" redirectTo="/product/atta" />);
    await userEvent.click(screen.getByRole("button", { name: /save to wishlist/i }));
    expect(toggle).toHaveBeenCalledWith("p1");
    expect(push).not.toHaveBeenCalled();
  });

  it("reflects the liked state with aria-pressed", () => {
    liked = true;
    render(<LikeButton productId="p1" redirectTo="/product/atta" />);
    expect(
      screen.getByRole("button", { name: /remove from wishlist/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
