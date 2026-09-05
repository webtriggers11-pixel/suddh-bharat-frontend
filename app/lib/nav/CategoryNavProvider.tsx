"use client";

import { createContext, useContext } from "react";
import { NAV, type NavItem } from "../site";

/**
 * Header navigation built from the live catalogue (FEAT-021). The root layout
 * fetches categories once (server-side, cached under the `categories` tag) and
 * publishes the resulting nav here, so every page's header shows the admin's
 * categories without each page fetching them.
 *
 * Defaults to the static `NAV`, which keeps the header sane in tests and in any
 * tree rendered outside the provider.
 */
const CategoryNavContext = createContext<NavItem[]>(NAV);

export function CategoryNavProvider({
  nav,
  children,
}: {
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <CategoryNavContext.Provider value={nav}>
      {children}
    </CategoryNavContext.Provider>
  );
}

export function useCategoryNav(): NavItem[] {
  return useContext(CategoryNavContext);
}
