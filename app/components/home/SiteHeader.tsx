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
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between">
        <Link href="/#top" className="font-display text-[22px] font-semibold tracking-tight">
          SHUDDHA<span className="text-gold">.</span>
        </Link>

        <SearchBar className="mx-4 hidden max-w-md flex-1 md:block lg:mx-8" />

        <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
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

        <div className="flex items-center gap-3">
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
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 font-mono text-[10px] font-bold text-ink">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="rounded-chip bg-forest px-5 py-2.5 font-mono text-xs tracking-wide text-paper"
          >
            CART ({count})
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-chip border border-ink px-3 py-2 font-mono text-[13px] lg:hidden"
          >
            {open ? "CLOSE" : "MENU"}
          </button>
        </div>
      </Container>

      {/* Full-width search on small screens (below the logo/actions row). */}
      <Container className="pb-3 md:hidden">
        <SearchBar />
      </Container>

      <Collapse open={open} id="mobile-nav">
        <nav aria-label="Mobile" className="border-t border-line bg-paper lg:hidden">
          <Container as="ul" className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 font-body text-base ${
                    item.muted ? "text-gray" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-line">
              <Link
                href={authHref}
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-base font-semibold text-forest"
              >
                {authLabel}
              </Link>
            </li>
          </Container>
        </nav>
      </Collapse>
    </header>
  );
}
