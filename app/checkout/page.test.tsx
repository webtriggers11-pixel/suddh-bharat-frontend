import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestQueryProvider } from "../lib/query/TestQueryProvider";
import type { Address } from "../lib/api/orders";
import { ApiError } from "../lib/api/auth";

// Chrome components pull in providers/hooks unrelated to checkout logic —
// mocked out, same pattern as JournalIndexPage/SiteHeader tests.
vi.mock("../components/home/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("../components/home/SiteFooter", () => ({ SiteFooter: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const applyResult = vi.fn();
let mockUser: { id: string; name: string | null } | null = null;
let mockToken: string | null = null;
vi.mock("../lib/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    getToken: () => mockToken,
    applyResult,
  }),
}));

const mockCart = {
  cart: {
    items: [{ productId: "p1", quantity: 1 } as never],
    itemCount: 1,
    totalMinor: 34900,
  },
  loading: false,
  refresh: vi.fn(),
};
vi.mock("../lib/cart/CartProvider", () => ({
  useCart: () => mockCart,
}));

let mockAddresses: Address[] = [];
const createAddress = vi.fn();
vi.mock("../lib/addresses/useAddresses", () => ({
  useAddresses: () => ({
    addresses: mockAddresses,
    loading: false,
    create: createAddress,
    refresh: vi.fn(),
  }),
}));

const { guestFn, createAddressApi, mergeGuestData } = vi.hoisted(() => ({
  guestFn: vi.fn(),
  createAddressApi: vi.fn(),
  mergeGuestData: vi.fn(),
}));

vi.mock("../lib/api/auth", async () => {
  const actual =
    await vi.importActual<typeof import("../lib/api/auth")>("../lib/api/auth");
  return { ...actual, authApi: { ...actual.authApi, guest: guestFn } };
});

vi.mock("../lib/api/orders", async () => {
  const actual =
    await vi.importActual<typeof import("../lib/api/orders")>(
      "../lib/api/orders",
    );
  return {
    ...actual,
    addressApi: { ...actual.addressApi, create: createAddressApi },
  };
});

vi.mock("../lib/guest/mergeGuestData", () => ({ mergeGuestData }));

import CheckoutPage from "./page";

function renderCheckout() {
  return render(
    <TestQueryProvider>
      <CheckoutPage />
    </TestQueryProvider>,
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockToken = null;
    mockAddresses = [];
  });

  it("renders the address form directly for a signed-out visitor with items in cart — no forced sign-in prompt", async () => {
    renderCheckout();
    expect(screen.queryByText("Sign in to check out")).not.toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Full name")).toBeInTheDocument();
    expect(screen.getByText("Sign in instead")).toBeInTheDocument();
  });

  it("shows the saved address list for a signed-in shopper (regression) — no guest sign-in link", () => {
    mockUser = { id: "u1", name: "A" };
    mockToken = "tok";
    mockAddresses = [
      {
        id: "a1",
        type: "HOME",
        fullName: "A",
        phone: "+91981",
        line1: "L1",
        line2: null,
        city: "City",
        state: "State",
        pincode: "110001",
        isDefault: true,
        isLocked: false,
      },
    ];
    renderCheckout();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("Sign in instead")).not.toBeInTheDocument();
  });

  it("guest submit: creates the account, merges the guest cart, then creates the address — in order", async () => {
    guestFn.mockResolvedValue({
      user: { id: "guest1" },
      accessToken: "guest-token",
      refreshToken: "rt",
    });
    createAddressApi.mockResolvedValue({ id: "new-addr", isDefault: true });
    renderCheckout();

    await userEvent.type(
      await screen.findByPlaceholderText("Full name"),
      "Priya",
    );
    await userEvent.type(screen.getByPlaceholderText("Phone"), "+919812345678");
    await userEvent.type(screen.getByPlaceholderText("Pincode"), "110001");
    await userEvent.type(
      screen.getByPlaceholderText("Address line 1"),
      "12 MG Road",
    );
    await userEvent.type(screen.getByPlaceholderText("City"), "Delhi");
    await userEvent.type(screen.getByPlaceholderText("State"), "Delhi");
    await userEvent.click(screen.getByRole("button", { name: "Save address" }));

    await waitFor(() => expect(createAddressApi).toHaveBeenCalled());

    expect(guestFn).toHaveBeenCalledWith("+919812345678");
    expect(applyResult).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "guest-token" }),
    );
    expect(mergeGuestData).toHaveBeenCalledWith("guest-token");
    expect(createAddressApi).toHaveBeenCalledWith(
      "guest-token",
      expect.objectContaining({ fullName: "Priya", isDefault: true }),
    );

    // Order matters: guest signup → merge → address create.
    const guestOrder = guestFn.mock.invocationCallOrder[0];
    const mergeOrder = mergeGuestData.mock.invocationCallOrder[0];
    const addressOrder = createAddressApi.mock.invocationCallOrder[0];
    expect(guestOrder).toBeLessThan(mergeOrder);
    expect(mergeOrder).toBeLessThan(addressOrder);

    // Existing signed-in address creation must never be called on this path.
    expect(createAddress).not.toHaveBeenCalled();
  });

  it("guest submit: an already-registered phone (409) shows the sign-in message and never merges/creates an address — no silent account takeover", async () => {
    guestFn.mockRejectedValue(
      new ApiError("This phone number already has an account.", 409),
    );
    renderCheckout();

    await userEvent.type(
      await screen.findByPlaceholderText("Full name"),
      "Priya",
    );
    await userEvent.type(screen.getByPlaceholderText("Phone"), "+919812345678");
    await userEvent.type(screen.getByPlaceholderText("Pincode"), "110001");
    await userEvent.type(
      screen.getByPlaceholderText("Address line 1"),
      "12 MG Road",
    );
    await userEvent.type(screen.getByPlaceholderText("City"), "Delhi");
    await userEvent.type(screen.getByPlaceholderText("State"), "Delhi");
    await userEvent.click(screen.getByRole("button", { name: "Save address" }));

    expect(
      await screen.findByText(
        "This phone number already has an account. Please sign in instead.",
      ),
    ).toBeInTheDocument();

    expect(applyResult).not.toHaveBeenCalled();
    expect(mergeGuestData).not.toHaveBeenCalled();
    expect(createAddressApi).not.toHaveBeenCalled();
  });
});
