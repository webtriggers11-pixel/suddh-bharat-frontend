"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cartApi, type CartSummary } from "../api/cart";
import { useAuth } from "../auth/AuthProvider";

const EMPTY: CartSummary = { items: [], itemCount: 0, totalMinor: 0 };

interface CartState {
  cart: CartSummary;
  count: number;
  loading: boolean;
  add: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, getToken } = useAuth();
  const [cart, setCart] = useState<CartSummary>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartApi.get(token));
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Load / reset the cart whenever the signed-in user changes. Deferred via a
  // microtask so no setState runs synchronously inside the effect body.
  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [user, refresh]);

  const mutate = useCallback(
    async (op: (token: string) => Promise<CartSummary>) => {
      const token = getToken();
      if (!token) throw new Error("Not signed in");
      const next = await op(token);
      setCart(next);
    },
    [getToken],
  );

  const value: CartState = {
    cart,
    count: cart.items.reduce((n, i) => n + i.quantity, 0),
    loading,
    add: (productId, quantity = 1) =>
      mutate((t) => cartApi.add(t, productId, quantity)),
    setQuantity: (productId, quantity) =>
      mutate((t) => cartApi.setQuantity(t, productId, quantity)),
    remove: (productId) => mutate((t) => cartApi.remove(t, productId)),
    clear: () => mutate((t) => cartApi.clear(t)),
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
