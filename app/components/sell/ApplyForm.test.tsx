import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ApplyForm } from "./ApplyForm";

describe("ApplyForm", () => {
  it("shows an error and no confirmation when the brand name is empty", async () => {
    render(<ApplyForm />);
    await userEvent.click(screen.getByRole("button", { name: /submit application/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/brand name/i);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("confirms after a valid submission", async () => {
    render(<ApplyForm />);
    await userEvent.type(screen.getByLabelText(/brand name/i), "Slurrp Farm");
    await userEvent.click(screen.getByRole("button", { name: /submit application/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/application is in/i);
  });
});
