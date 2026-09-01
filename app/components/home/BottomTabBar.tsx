"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { useCart } from "../../lib/cart/CartProvider";
import { useWishlist } from "../../lib/wishlist/WishlistProvider";
import {
  AccountIcon,
  CartIcon,
  CountBadge,
  HeartIcon,
  HomeIcon,
  ShopIcon,
} from "../ui/icons";

type Tab = {
  href: string;
  label: string;
  Icon: typeof HomeIcon;
  count?: number;
};

/**
 * Mobile-only (`md:hidden`) bottom tab bar (CHORE-025) — thumb-zone primary
 * nav (Myntra/Nykaa-tier pattern), alongside the existing top `SiteHeader`,
 * not replacing it. Mounted once in the root layout (like `GuestMerge`) since
 * it's a fixed, prop-less, always-present element — unlike `SiteHeader`,
 * which is composed per-page for in-flow layout reasons.
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const barRef = useRef<HTMLElement | null>(null);

  // ResizeObserver (not a one-shot measure) because `md:hidden` collapses
  // this bar to zero size at the md breakpoint — a plain effect that only
  // re-runs on route/count changes would leave --bottom-tab-bar-height stale
  // after a pure window resize/orientation change past md, which would show
  // up as PWABadge floating too high on desktop. useLayoutEffect (not
  // useEffect) so the *initial* measurement lands before paint.
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--bottom-tab-bar-height", `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty("--bottom-tab-bar-height", "0px");
    };
  }, []);

  const tabs: Tab[] = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/shop", label: "Shop", Icon: ShopIcon },
    { href: "/wishlist", label: "Wishlist", Icon: HeartIcon, count: wishlistCount },
    { href: "/cart", label: "Cart", Icon: CartIcon, count: cartCount },
    { href: "/account", label: "Account", Icon: AccountIcon },
  ];

  return (
    <nav
      ref={barRef}
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 pb-safe-bottom backdrop-blur md:hidden"
    >
      {tabs.map(({ href, label, Icon, count }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wide ${
              active ? "text-forest" : "text-gray"
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {typeof count === "number" && <CountBadge count={count} />}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
