"use client";

import { useState, type ReactNode } from "react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { isUnauthorized, reportUnauthorized } from "../auth/session";

/**
 * App-wide TanStack Query client. All client-side server state (cart, wishlist,
 * search suggestions, infinite product lists, orders) flows through this — one
 * cache, automatic dedupe/refetch, and mutation-driven invalidation (e.g. a
 * purchase invalidates the cart). Server Components keep using the Next Data
 * Cache for SEO; this owns the interactive/client layer.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        // A 401 on any authenticated query/mutation means the session died —
        // funnel it to the global forced-logout handler (T15).
        queryCache: new QueryCache({
          onError: (err) => {
            if (isUnauthorized(err)) reportUnauthorized();
          },
        }),
        mutationCache: new MutationCache({
          onError: (err) => {
            if (isUnauthorized(err)) reportUnauthorized();
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            // Never retry an auth failure — it will only 401 again; fail fast
            // so the forced-logout fires immediately.
            retry: (count, err) => !isUnauthorized(err) && count < 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: (count, err) => !isUnauthorized(err) && count < 0,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
