import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import { SearchScreen } from "./SearchScreen";
import { TestQueryProvider } from "../../lib/query/TestQueryProvider";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back }),
}));

const renderScreen = () =>
  render(
    <TestQueryProvider>
      <SearchScreen />
    </TestQueryProvider>,
  );

describe("SearchScreen", () => {
  afterEach(() => {
    back.mockClear();
    push.mockClear();
    vi.restoreAllMocks();
  });

  it("focuses the search input", () => {
    renderScreen();
    expect(screen.getByRole("combobox", { name: /search products/i })).toHaveFocus();
  });

  it("goes back on the back button when there's in-app history to pop", async () => {
    // Reached /search via an in-app Link — there's a prior entry behind it.
    vi.spyOn(window.history, "length", "get").mockReturnValue(2);
    renderScreen();

    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(back).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it("falls back to /shop when /search was opened directly (no history to pop)", async () => {
    // Deep link / bookmark / PWA shortcut straight into /search — router.back()
    // would no-op or exit the app, so it must not be called.
    vi.spyOn(window.history, "length", "get").mockReturnValue(1);
    renderScreen();

    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(push).toHaveBeenCalledWith("/shop");
    expect(back).not.toHaveBeenCalled();
  });
});
