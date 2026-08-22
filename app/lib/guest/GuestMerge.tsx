"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { cartApi } from "../api/cart";
import { wishlistApi } from "../api/wishlist";
import { ApiError } from "../api/auth";
import {
  getGuestCartLines,
  getGuestWishlist,
  hasGuestData,
  removeGuestCartLine,
  removeGuestWishlistItem,
} from "./guest";

/**
 * A 4xx means the item will never merge (out of stock, inactive, gone, or
 * already present) → drop it. A network error or 5xx is transient → keep it in
 * the guest store so a later mount retries, instead of silently losing it.
 */
function isPermanent(err: unknown): boolean {
  return err instanceof ApiError && err.status < 500;
}

/**
 * Merges the guest cart + wishlist (localStorage) into the server account once,
 * right after sign-in — the Amazon pattern. Runs invisibly; mounted in the layout
 * inside the providers. Guest data is cleared only after a successful merge.
 */
export function GuestMerge() {
  const { user, getToken } = useAuth();
  const qc = useQueryClient();
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!user || !token) return;
    if (mergedFor.current === user.id) return; // already merged this session
    if (!hasGuestData()) {
      mergedFor.current = user.id;
      return;
    }
    mergedFor.current = user.id;

    void (async () => {
      // Remove each item from the guest store ONLY once it's definitively
      // handled — merged, or permanently rejected. An interruption (unmount /
      // navigation) therefore leaves exactly the un-merged items behind: the
      // next mount retries them, never re-adding a duplicate of one that already
      // merged, and never silently dropping one that hit a transient error.
      for (const l of getGuestCartLines()) {
        try {
          await cartApi.add(token, l.productId, l.quantity);
          removeGuestCartLine(l.productId);
        } catch (err) {
          if (isPermanent(err)) removeGuestCartLine(l.productId);
        }
      }
      for (const id of getGuestWishlist()) {
        try {
          await wishlistApi.add(token, id);
          removeGuestWishlistItem(id);
        } catch (err) {
          if (isPermanent(err)) removeGuestWishlistItem(id);
        }
      }
      await qc.invalidateQueries({ queryKey: ["cart"] });
      await qc.invalidateQueries({ queryKey: ["wishlist"] });
      // Leftovers were transient failures → allow another attempt later.
      if (hasGuestData()) mergedFor.current = null;
    })();
  }, [user, getToken, qc]);

  return null;
}
