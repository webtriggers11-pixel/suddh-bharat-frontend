import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PasswordForm } from "./PasswordForm";
import { ApiError } from "../../lib/api/auth";

const login = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("../../lib/auth/AuthProvider", () => ({
  useAuth: () => ({ login, register: vi.fn() }),
}));

describe("PasswordForm (login)", () => {
  beforeEach(() => {
    login.mockReset();
    push.mockReset();
  });

  it("submits credentials and navigates on success", async () => {
    login.mockResolvedValue(undefined);
    render(<PasswordForm mode="login" />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith("a@b.com", "password123");
    expect(push).toHaveBeenCalledWith("/account");
  });

  it("shows the API error message and does not navigate on failure", async () => {
    login.mockRejectedValue(new ApiError("Invalid credentials", 401));
    render(<PasswordForm mode="login" />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@b.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid credentials/i);
    expect(push).not.toHaveBeenCalled();
  });
});
