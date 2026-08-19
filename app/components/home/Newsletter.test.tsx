import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Newsletter } from "./Newsletter";

describe("Newsletter", () => {
  it("confirms after a valid email is submitted", async () => {
    render(<Newsletter />);
    await userEvent.type(screen.getByLabelText(/email address/i), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: /notify me/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/on the list/i);
  });

  it("does not confirm an invalid email", async () => {
    render(<Newsletter />);
    await userEvent.type(screen.getByLabelText(/email address/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /notify me/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
