import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileSection } from "./ProfileSection";
import { authApi, type AuthUser } from "../../lib/api/auth";

const setUser = vi.fn();
const user: AuthUser = {
  id: "u1",
  name: "Test User",
  email: "user@shuddha.in",
  phone: null,
  roles: ["USER"],
  provider: "LOCAL",
  emailVerified: true,
  phoneVerified: false,
};

vi.mock("../../lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user, getToken: () => "tok", setUser }),
}));

vi.mock("../../lib/api/auth", () => ({
  authApi: { updateProfile: vi.fn() },
}));

const mocked = vi.mocked(authApi);

describe("ProfileSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows user details and a Verified pill for a verified email", () => {
    render(<ProfileSection />);
    expect(screen.getByText("user@shuddha.in")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  it("edits the name and calls updateProfile, then updates the user", async () => {
    mocked.updateProfile.mockResolvedValue({ ...user, name: "New Name" });
    render(<ProfileSection />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));

    const nameInput = screen.getByLabelText("Name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "New Name");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(mocked.updateProfile).toHaveBeenCalledWith("tok", {
        name: "New Name",
        phone: undefined,
      }),
    );
    expect(setUser).toHaveBeenCalled();
  });
});
