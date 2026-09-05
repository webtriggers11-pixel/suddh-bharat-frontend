"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCategoryNav } from "../../lib/nav/CategoryNavProvider";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useCart } from "../../lib/cart/CartProvider";
import { useWishlist } from "../../lib/wishlist/WishlistProvider";
import { SearchBar } from "../shop/SearchBar";
import { Container } from "../ui/Container";
import { DURATION, EASE } from "../motion/tokens";
import { CartIcon, CountBadge, HeartIcon, SearchIcon } from "../ui/icons";

/**
 * Two-tier header (nykaa.com-style structure, Shuddha tokens/fonts): a utility
 * row (logo + search + account/wishlist/cart) over a persistent, always-visible
 * category strip. The burger only holds secondary actions (sign in, wishlist on
 * mobile) since categories never hide behind it.
 */
export function SiteHeader() {
  // Row 2's category strip comes from the live catalogue (FEAT-021). The
  // sidebar's secondary-links section reuses this same list's `muted` items
  // (Our Standard, Sell on Shuddha, Journal) — one source of truth for both
  // call sites, not a second hardcoded label/href array.
  const nav = useCategoryNav();
  const sidebarLinks = nav.filter((item) => item.muted);

  const [open, setOpen] = useState(false);
  // document.body only exists in the browser. useSyncExternalStore returns the
  // server snapshot (false) during SSR and the first hydration pass, then the
  // client snapshot (true) — so the portal mounts without a hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { user } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const reduce = useReducedMotion();

  const pathname = usePathname();
  // Signed-out → carry the current page so login returns here (not always /account).
  const authHref = user
    ? "/account"
    : `/login?redirect=${encodeURIComponent(pathname || "/")}`;
  const authLabel = user ? (user.name ?? "Account") : "Sign in";

  // Escape-to-close + background scroll lock while the sidebar is open —
  // standard off-canvas-overlay behavior, not present on the old dropdown
  // (which didn't cover/obscure the rest of the page, so didn't need it).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <header
        // The safe-area padding below clears the notch/status bar when installed
        // as a standalone PWA (app/layout.tsx sets viewportFit: "cover" so the
        // safe-area-inset-top environment variable isn't always zero).
        className="sticky top-0 z-50 border-b border-line bg-paper/90 pt-safe-top backdrop-blur"
      >
        {/* Row 1 — utility: logo, search, account/wishlist/cart. */}
        <Container className="flex h-16 items-center gap-3 md:h-[76px] md:gap-5">
          {/* sm:hidden, not lg:hidden — from sm up, everything the drawer could
              hold (Sign in, Wishlist) is already reachable directly in this row,
              so a burger with an empty drawer behind it would be dead weight. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="shrink-0 rounded-chip border border-ink px-3 py-2 font-mono text-[13px] sm:hidden"
          >
            {/* Static label, not open/close-toggled text: once the sidebar is
                open its backdrop visually covers this button anyway (CHORE-026)
                — the sidebar's own "Close" button, backdrop click, and Escape
                are the actual ways to close it. aria-expanded still reflects
                state for assistive tech. */}
            MENU
          </button>

          <Link
            href="/#top"
            className="shrink-0 font-display text-[19px] font-semibold tracking-tight md:text-[22px]"
          >
            SHUDDHA<span className="text-gold">.</span>
          </Link>

          <SearchBar className="hidden flex-1 md:block md:max-w-xl lg:max-w-2xl" />

          <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
            {/* Phone-only: tapping search opens a dedicated full-page search
                (nykaa.com pattern) instead of the inline bar shown from md up. */}
            <Link href="/search" aria-label="Search" className="text-ink hover:text-forest md:hidden">
              <SearchIcon size={22} strokeWidth={1.8} />
            </Link>
            <Link
              href={authHref}
              className="hidden font-body text-sm font-medium text-ink hover:text-forest sm:inline"
            >
              {authLabel}
            </Link>
            {/* Wishlist/Cart hidden below md — BottomTabBar (CHORE-025) owns
                both on mobile; showing the same destination in both places at
                once would be a duplicate, not a convenience. */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount})`}
              className="relative hidden text-ink hover:text-forest md:inline-flex"
            >
              <HeartIcon size={22} strokeWidth={1.7} />
              <CountBadge count={wishlistCount} />
            </Link>
            {/* One link, not two: icon-only below lg (compact on phones/tablets),
                icon+label from lg (primary CTA chip) — avoids two anchors to the
                same destination with mismatched accessible names. */}
            <Link
              href="/cart"
              aria-label={`Cart (${count})`}
              className="relative hidden items-center gap-2 text-ink hover:text-forest md:flex lg:rounded-chip lg:bg-forest lg:px-5 lg:py-2.5 lg:text-paper lg:hover:text-paper"
            >
              <span className="relative lg:hidden">
                <CartIcon size={23} strokeWidth={1.7} />
                <CountBadge count={count} />
              </span>
              <span className="hidden font-mono text-xs tracking-wide lg:inline" aria-hidden="true">
                CART ({count})
              </span>
            </Link>
          </div>
        </Container>

        {/* Row 2 — persistent category strip (never hidden behind the burger). */}
        <div className="border-t border-line bg-paper-dim/60">
          <Container>
            <nav
              aria-label="Categories"
              className="flex items-center gap-6 overflow-x-auto whitespace-nowrap py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:overflow-visible lg:whitespace-normal [&::-webkit-scrollbar]:hidden"
            >
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-body text-sm font-medium hover:text-forest ${
                    item.muted ? "text-gray" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>

      </header>

      {/* Portalled to <body>, not rendered in place. Two ancestors would
          otherwise become the containing block for these `position: fixed`
          nodes — the header's own `backdrop-blur`, and PageTransition's
          `transform` while a route transition runs — which clipped the drawer
          and its backdrop to that ancestor's box instead of the viewport
          (the drawer collapsed to the header's ~118px strip, leaving
          BottomTabBar undimmed on top). A body-level portal also puts `z-[60]`
          in the root stacking context, so it genuinely clears the header
          (z-50) and BottomTabBar (z-40).

          Mobile menu: a left-side slide-in sidebar (CHORE-026), not the old
          downward dropdown — categories/Our Standard/Sell already have a
          persistent presence in Row 2 above, so this only needs to hold what
          isn't reachable elsewhere on mobile: account, Journal (currently has
          no nav entry anywhere except the footer), and — for discoverability,
          since Row 2's strip is easy to miss — Our Standard/Sell again. No
          Wishlist link: BottomTabBar (CHORE-025) already owns it on mobile. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="fixed inset-0 z-[60] bg-ink/40 sm:hidden"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: DURATION.fast }}
                  onClick={() => setOpen(false)}
                />
                <motion.nav
                  id="mobile-nav"
                  aria-label="Mobile"
                  className="fixed inset-y-0 left-0 z-[60] w-[82%] max-w-xs overflow-y-auto border-r border-line bg-paper pt-safe-top sm:hidden"
                  initial={reduce ? false : { x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={reduce ? undefined : { x: "-100%" }}
                  transition={{ duration: DURATION.base, ease: EASE }}
                >
                  <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <span className="font-display text-lg font-semibold tracking-tight">
                      SHUDDHA<span className="text-gold">.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-chip border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider"
                    >
                      Close
                    </button>
                  </div>
                  <ul className="flex flex-col px-5">
                    <li>
                      <Link
                        href={authHref}
                        onClick={() => setOpen(false)}
                        className="block border-b border-line py-4 font-body text-base font-semibold text-forest"
                      >
                        {authLabel}
                      </Link>
                    </li>
                    {sidebarLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block border-b border-line py-4 font-body text-base text-ink"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.nav>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
