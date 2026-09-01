"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/motion/Reveal";
import { ProductCard } from "../components/shop/ProductCard";
import { PRODUCT_GRID_CLASS, SkeletonCardGrid } from "../components/ui/Skeleton";
import { useAuth } from "../lib/auth/AuthProvider";
import { useWishlist } from "../lib/wishlist/WishlistProvider";
import { wishlistApi, type WishlistItem } from "../lib/api/wishlist";
import type { Product } from "../lib/api/catalog";

/** Map a wishlist row's product snapshot onto the full Product ProductCard wants. */
function toProduct(p: WishlistItem["product"]): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: null,
    priceMinor: p.priceMinor,
    mrpMinor: p.mrpMinor,
    stock: p.stock,
    images: p.images,
    categoryId: null,
    tags: [],
    collection: null,
    material: p.material,
    color: null,
    isActive: p.isActive,
    isHandmade: true,
    isFeatured: false,
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  // Re-render when likes change elsewhere (so un-liking removes the tile).
  const { likedIds } = useWishlist();
  const token = getToken();

  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wishlist-list", user?.id ?? null],
    queryFn: () => wishlistApi.list(token as string),
    enabled: !!token,
  });

  const state: "loading" | "ready" | "error" =
    authLoading || (!!token && isLoading)
      ? "loading"
      : isError
        ? "error"
        : "ready";

  // Only show items still liked — an un-like (via the card's heart) drops it here.
  const visible = items.filter((it) => likedIds.has(it.productId));

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-14 md:py-20">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold text-ink">
            Your wishlist
          </h1>

          {!user && !authLoading ? (
            <Prompt
              title="Sign in to see your saved products"
              subtitle="Your hearts are saved on this device and will sync when you sign in."
              cta={{ href: "/login?redirect=/wishlist", label: "Sign in" }}
            />
          ) : state === "loading" ? (
            <SkeletonCardGrid count={8} className="mt-8" />
          ) : state === "error" ? (
            <Prompt
              title="Could not load your wishlist"
              cta={{ href: "/shop", label: "Go to shop" }}
            />
          ) : visible.length === 0 ? (
            <Prompt
              title="No saved products yet"
              cta={{ href: "/shop", label: "Browse products" }}
              subtitle="Tap the heart on any product to save it here."
            />
          ) : (
            <Reveal>
              <p className="mt-2 font-body text-sm text-gray">
                {visible.length} saved{" "}
                {visible.length === 1 ? "product" : "products"}
              </p>
              <ul className={`mt-8 ${PRODUCT_GRID_CLASS}`}>
                {visible.map((it) => (
                  <li key={it.id} className="h-full">
                    <ProductCard product={toProduct(it.product)} />
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

function Prompt({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      {subtitle && (
        <p className="mt-2 font-body text-sm text-gray">{subtitle}</p>
      )}
      <Link
        href={cta.href}
        className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
      >
        {cta.label}
      </Link>
    </div>
  );
}
