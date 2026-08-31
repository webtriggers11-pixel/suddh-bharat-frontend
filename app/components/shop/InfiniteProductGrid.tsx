"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { PRODUCT_GRID_CLASS, SkeletonCardGrid } from "../ui/Skeleton";
import {
  fetchProductsClient,
  type Paginated,
  type Product,
  type ProductFilters,
} from "../../lib/api/catalog";

/**
 * Product grid with infinite scroll on TanStack Query's `useInfiniteQuery`.
 * Page 1 is server-rendered (passed as `initialItems` and seeded as the query's
 * initial page for SEO + instant paint); further pages load when a sentinel
 * scrolls into view. Keyed by the filters, so a new category/sort/search starts
 * a fresh cached list.
 */
export function InfiniteProductGrid({
  initialItems,
  total,
  filters,
}: {
  initialItems: Product[];
  total: number;
  filters: ProductFilters;
}) {
  const pageSize = filters.pageSize ?? 24;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products-infinite", filters],
      queryFn: ({ pageParam }) =>
        fetchProductsClient({ ...filters, page: pageParam, pageSize }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        const loaded = pages.reduce((n, p) => n + p.items.length, 0);
        return loaded < lastPage.total ? lastPage.page + 1 : undefined;
      },
      initialData: {
        pages: [
          {
            items: initialItems,
            total,
            page: 1,
            pageSize,
            totalPages: 0,
          } satisfies Paginated<Product>,
        ],
        pageParams: [1],
      },
    });

  // Flatten + dedupe by id (guards against overlap at page boundaries).
  const seen = new Set<string>();
  const items: Product[] = [];
  for (const p of data?.pages ?? []) {
    for (const it of p.items) {
      if (!seen.has(it.id)) {
        seen.add(it.id);
        items.push(it);
      }
    }
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "600px 0px" }, // prefetch before it hits the viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div>
      <ul className={PRODUCT_GRID_CLASS}>
        {items.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <div ref={sentinelRef} className="py-10">
          {isFetchingNextPage && <SkeletonCardGrid count={4} />}
        </div>
      ) : (
        items.length > 0 && (
          <p className="py-10 text-center font-mono text-[11px] uppercase tracking-wider text-gray">
            You’ve reached the end · {items.length} of {total}
          </p>
        )
      )}
    </div>
  );
}
