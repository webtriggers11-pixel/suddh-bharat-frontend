"use client";

import { useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../api/wishlist";
import { useAuth } from "../auth/AuthProvider";
import { getGuestWishlist, toggleGuestWishlist } from "../guest/guest";

const idsKey = (userId: string | null | undefined) => ["wishlist", userId ?? null];
const GUEST_KEY = ["wishlist", "guest"] as const;

/** Thin pass-through kept for compat; state lives in TanStack Query. */
export function WishlistProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Wishlist ("likes") on TanStack Query. Signed-in → server + optimistic mutation.
 * Signed-out → a guest wishlist in localStorage (merged into the server on login).
 */
export function useWishlist() {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();
  const token = getToken();
  const guest = !token;
  const key = guest ? GUEST_KEY : idsKey(user?.id);

  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      guest
        ? Promise.resolve(getGuestWishlist())
        : wishlistApi.ids(token as string),
  });

  const likedIds = useMemo(() => new Set(query.data ?? []), [query.data]);

  const toggleMut = useMutation({
    mutationFn: async (v: { productId: string; next: boolean }) => {
      const t = getToken();
      if (!t) throw new Error("Please sign in to save products");
      if (v.next) await wishlistApi.add(t, v.productId);
      else await wishlistApi.remove(t, v.productId);
      return v.next;
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<string[]>(key) ?? [];
      const optimistic = v.next
        ? [...new Set([...prev, v.productId])]
        : prev.filter((id) => id !== v.productId);
      qc.setQueryData(key, optimistic);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: idsKey(user?.id) });
    },
  });

  return {
    likedIds,
    count: likedIds.size,
    loading: query.isLoading,
    isLiked: (productId: string) => likedIds.has(productId),
    toggle: async (productId: string): Promise<boolean> => {
      const next = !likedIds.has(productId);
      if (guest) {
        // Guest wishlist lives in localStorage — no login required.
        const res = toggleGuestWishlist(productId);
        await qc.invalidateQueries({ queryKey: GUEST_KEY });
        return res;
      }
      await toggleMut.mutateAsync({ productId, next });
      return next;
    },
    refresh: async () => {
      await qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  };
}
