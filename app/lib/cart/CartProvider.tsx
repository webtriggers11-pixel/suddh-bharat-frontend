"use client";

import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi, type CartSummary } from "../api/cart";
import { useAuth } from "../auth/AuthProvider";
import {
  addGuestCartLine,
  clearGuestCart,
  getGuestCartSummary,
  removeGuestCartLine,
  setGuestCartQty,
  type GuestSnapshot,
} from "../guest/guest";

const EMPTY: CartSummary = { items: [], itemCount: 0, totalMinor: 0 };

const cartKey = (userId: string | null | undefined) => ["cart", userId ?? null];
const GUEST_KEY = ["cart", "guest"] as const;

/** Thin pass-through kept for backward compatibility (state lives in TanStack). */
export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Cart hook backed by TanStack Query. Signed-in → the server cart. Signed-out →
 * a guest cart in localStorage (Amazon-style), merged into the server on login.
 * Same return API in both modes so components don't care which is active.
 */
export function useCart() {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();
  const token = getToken();
  const guest = !token;
  const key = guest ? GUEST_KEY : cartKey(user?.id);

  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      guest
        ? Promise.resolve(getGuestCartSummary())
        : cartApi.get(token as string),
  });

  const setCart = (data: CartSummary) => qc.setQueryData(key, data);
  const refreshGuest = () => qc.invalidateQueries({ queryKey: GUEST_KEY });
  const requireToken = () => {
    const t = getToken();
    if (!t) throw new Error("Not signed in");
    return t;
  };

  const addMut = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) =>
      cartApi.add(requireToken(), v.productId, v.quantity),
    onSuccess: setCart,
  });
  const setQtyMut = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) =>
      cartApi.setQuantity(requireToken(), v.productId, v.quantity),
    onSuccess: setCart,
  });
  const removeMut = useMutation({
    mutationFn: (productId: string) => cartApi.remove(requireToken(), productId),
    onSuccess: setCart,
  });
  const clearMut = useMutation({
    mutationFn: () => cartApi.clear(requireToken()),
    onSuccess: setCart,
  });

  const cart = query.data ?? EMPTY;

  return {
    cart,
    count: cart.items.reduce((n, i) => n + i.quantity, 0),
    loading: query.isLoading,
    /**
     * Add to cart. Signed-out callers MUST pass a product `snapshot` so the guest
     * cart can render offline; signed-in callers can omit it (server resolves it).
     */
    add: async (
      productId: string,
      quantity = 1,
      snapshot?: GuestSnapshot,
    ) => {
      if (guest) {
        if (!snapshot) throw new Error("Product details required to add");
        addGuestCartLine(snapshot, quantity);
        await refreshGuest();
        return;
      }
      await addMut.mutateAsync({ productId, quantity });
    },
    setQuantity: async (productId: string, quantity: number) => {
      if (guest) {
        setGuestCartQty(productId, quantity);
        await refreshGuest();
        return;
      }
      await setQtyMut.mutateAsync({ productId, quantity });
    },
    remove: async (productId: string) => {
      if (guest) {
        removeGuestCartLine(productId);
        await refreshGuest();
        return;
      }
      await removeMut.mutateAsync(productId);
    },
    clear: async () => {
      if (guest) {
        clearGuestCart();
        await refreshGuest();
        return;
      }
      await clearMut.mutateAsync();
    },
    refresh: async () => {
      await qc.invalidateQueries({ queryKey: ["cart"] });
    },
  };
}
