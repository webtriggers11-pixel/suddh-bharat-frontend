"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { hasGuestData } from "./guest";
import { mergeGuestData } from "./mergeGuestData";

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
      await mergeGuestData(token);
      await qc.invalidateQueries({ queryKey: ["cart"] });
      await qc.invalidateQueries({ queryKey: ["wishlist"] });
      // Leftovers were transient failures → allow another attempt later.
      if (hasGuestData()) mergedFor.current = null;
    })();
  }, [user, getToken, qc]);

  return null;
}
