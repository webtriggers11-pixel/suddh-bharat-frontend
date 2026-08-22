import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWishlist } from "./WishlistProvider";
import { TestQueryProvider } from "../query/TestQueryProvider";

// Signed-in user with a STABLE token fn.
vi.mock("../auth/AuthProvider", () => {
  const user = { id: "u1" };
  const getToken = () => "tok";
  return { useAuth: () => ({ user, getToken }) };
});

// Stateful mock backend so the mutation's settle-time refetch reconciles with
// the optimistic update (mirrors the real API returning the updated list).
const store = new Set<string>();
const add = vi.fn(async (_t: string, id: string) => {
  store.add(id);
  return { id: "w", productId: id };
});
const remove = vi.fn(async (_t: string, id: string) => {
  store.delete(id);
  return { productId: id };
});
vi.mock("../api/wishlist", () => ({
  wishlistApi: {
    ids: () => Promise.resolve([...store]),
    add: (t: string, id: string) => add(t, id),
    remove: (t: string, id: string) => remove(t, id),
  },
}));

function Probe() {
  const { isLiked, toggle } = useWishlist();
  return (
    <div>
      <span data-testid="state">{isLiked("p1") ? "liked" : "unliked"}</span>
      <button onClick={() => void toggle("p1").catch(() => {})}>toggle</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <TestQueryProvider>
      <Probe />
    </TestQueryProvider>,
  );
}

describe("useWishlist (TanStack)", () => {
  beforeEach(() => {
    store.clear();
    add.mockClear();
    remove.mockClear();
  });

  it("optimistically likes then unlikes, calling the API each way", async () => {
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("unliked"),
    );

    await userEvent.click(screen.getByText("toggle"));
    await waitFor(() => expect(add).toHaveBeenCalledWith("tok", "p1"));
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("liked"),
    );

    await userEvent.click(screen.getByText("toggle"));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("tok", "p1"));
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("unliked"),
    );
  });

  it("rolls back the optimistic like when the API rejects", async () => {
    add.mockRejectedValueOnce(new Error("boom"));
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("unliked"),
    );

    await userEvent.click(screen.getByText("toggle"));
    // Rolled back to unliked after the rejection settles.
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("unliked"),
    );
  });
});
