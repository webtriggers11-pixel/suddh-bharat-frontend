"use client";

import { createContext, useContext, type ReactNode } from "react";
import { FALLBACK_POLICY, type StorePolicy } from "../api/store";

/**
 * Admin-editable shipping/COD terms, fetched once in the root layout and
 * shared with the client components that display them (checkout's fee line).
 * Defaults to FALLBACK_POLICY so a tree rendered outside the provider — and
 * every test — still has sane numbers.
 */
const StorePolicyContext = createContext<StorePolicy>(FALLBACK_POLICY);

export function StorePolicyProvider({
  policy,
  children,
}: {
  policy: StorePolicy;
  children: ReactNode;
}) {
  return (
    <StorePolicyContext.Provider value={policy}>
      {children}
    </StorePolicyContext.Provider>
  );
}

export function useStorePolicy(): StorePolicy {
  return useContext(StorePolicyContext);
}
