import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddressesSection } from "./AddressesSection";
import { addressApi, type Address } from "../../lib/api/orders";

vi.mock("../../lib/auth/AuthProvider", () => ({
  useAuth: () => ({ user: { id: "u1" }, getToken: () => "tok" }),
}));

vi.mock("../../lib/api/orders", () => ({
  addressApi: {
    list: vi.fn(),
    setDefault: vi.fn(),
    remove: vi.fn(),
  },
}));

const address = (over: Partial<Address> = {}): Address => ({
  id: "a1",
  type: "HOME",
  fullName: "Test User",
  phone: "9876543210",
  line1: "12 MG Road",
  line2: null,
  city: "Pune",
  state: "MH",
  pincode: "411001",
  isDefault: false,
  isLocked: false,
  ...over,
});

const mocked = vi.mocked(addressApi);

describe("AddressesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the user's addresses", async () => {
    mocked.list.mockResolvedValue([address()]);
    render(<AddressesSection />);
    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(screen.getByText(/12 MG Road/)).toBeInTheDocument();
  });

  it("sets an address as default and refetches", async () => {
    mocked.list.mockResolvedValue([address()]);
    mocked.setDefault.mockResolvedValue(address({ isDefault: true }));
    render(<AddressesSection />);
    const btn = await screen.findByRole("button", { name: /set default/i });
    await userEvent.click(btn);
    await waitFor(() =>
      expect(mocked.setDefault).toHaveBeenCalledWith("tok", "a1"),
    );
    // list refetched: once on mount + once after mutation
    expect(mocked.list.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("disables Delete for a locked address", async () => {
    mocked.list.mockResolvedValue([address({ isLocked: true, isDefault: true })]);
    render(<AddressesSection />);
    const del = await screen.findByRole("button", { name: /delete/i });
    expect(del).toBeDisabled();
  });
});
