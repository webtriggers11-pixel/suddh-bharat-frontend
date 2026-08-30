"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../../lib/site";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useCart } from "../../lib/cart/CartProvider";
import { useWishlist } from "../../lib/wishlist/WishlistProvider";
import { SearchBar } from "../shop/SearchBar";
import { Container } from "../ui/Container";
import { Collapse } from "../motion/Collapse";
import { CartIcon, CountBadge, HeartIcon, SearchIcon } from "../ui/icons";

/**
 * Two-tier header (nykaa.com-style structure, Shuddha tokens/fonts): a utility
 * row (logo + search + account/wishlist/cart) over a persistent, always-visible
 * category strip. The burger only holds secondary actions (sign in, wishlist on
 * mobile) since categories never hide behind it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();

  const pathname = usePathname();
  // Signed-out → carry the current page so login returns here (not always /account).
  const authHref = user
    ? "/account"
    : `/login?redirect=${encodeURIComponent(pathname || "/")}`;
  const authLabel = user ? (user.name ?? "Account") : "Sign in";

  return (
    <header
      // The safe-area padding below clears the notch/status bar when installed
      // as a standalone PWA (app/layout.tsx sets viewportFit: "cover" so the
      // safe-area-inset-top environment variable isn't always zero).
      className="sticky top-0 z-50 border-b border-line bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      {/* Row 1 — utility: logo, search, account/wishlist/cart. */}
      <Container className="flex h-16 items-center gap-3 md:h-[76px] md:gap-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="shrink-0 rounded-chip border border-ink px-3 py-2 font-mono text-[13px] lg:hidden"
        >
          {open ? "CLOSE" : "MENU"}
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
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistCount})`}
            className="relative hidden text-ink hover:text-forest sm:inline-flex"
          >
            <HeartIcon size={22} strokeWidth={1.7} />
            <CountBadge count={wishlistCount} />
          </Link>
          {/* Icon-only below lg to keep the utility row compact on phones/tablets. */}
          <Link
            href="/cart"
            aria-label={`Cart (${count})`}
            className="relative text-ink hover:text-forest lg:hidden"
          >
            <CartIcon size={23} strokeWidth={1.7} />
            <CountBadge count={count} />
          </Link>
          <Link
            href="/cart"
            className="hidden rounded-chip bg-forest px-5 py-2.5 font-mono text-xs tracking-wide text-paper lg:inline-block"
          >
            CART ({count})
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
            {NAV.map((item) => (
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

      <Collapse open={open} id="mobile-nav">
        <nav aria-label="Mobile" className="border-t border-line bg-paper lg:hidden">
          <Container as="ul" className="flex flex-col">
            <li>
              <Link
                href={authHref}
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-base font-semibold text-forest"
              >
                {authLabel}
              </Link>
            </li>
            <li className="border-t border-line sm:hidden">
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-base text-ink"
              >
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </Link>
            </li>
          </Container>
        </nav>
      </Collapse>
    </header>
  );
}
