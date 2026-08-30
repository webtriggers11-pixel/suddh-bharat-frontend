import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchScreen } from "./SearchScreen";
import { TestQueryProvider } from "../../lib/query/TestQueryProvider";

const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back }),
}));

describe("SearchScreen", () => {
  it("focuses the search input and goes back on the back button", async () => {
    render(
      <TestQueryProvider>
        <SearchScreen />
      </TestQueryProvider>,
    );

    expect(screen.getByRole("combobox", { name: /search products/i })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(back).toHaveBeenCalledOnce();
  });
});
