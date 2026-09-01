import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { PageHero } from "../components/ui/PageHero";
import { PWABadge } from "../components/pwa/PWABadge";
import { Container } from "../components/ui/Container";
import { ShopFilters } from "../components/shop/ShopFilters";
import { InfiniteProductGrid } from "../components/shop/InfiniteProductGrid";
import { catalogApi } from "../lib/api/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse clean, verified food, baby, beauty and clothing on Shuddha.",
};

// Rendered on demand (reads `searchParams`), but the underlying category/product
// fetches are served from the Next.js Data Cache (revalidated) — see lib/api/catalog.
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = first(sp.category);
  const search = first(sp.search)?.trim() || undefined;
  const sortParam = first(sp.sort);
  const sort =
    sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : undefined;

  const pageSize = 24;
  const [categories, page] = await Promise.all([
    catalogApi.categories(),
    catalogApi.products({ categorySlug: category, search, sort, pageSize }),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Shop"
          title="The Shuddha catalog."
          intro="Every product here comes from a brand checked against our published standard — clean by default, verified by category."
        />
        <Container className="py-14 md:py-20">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-12">
            <ShopFilters
              categories={categories}
              activeCategory={category}
              activeSort={sortParam}
              total={page.total}
              className="lg:order-1"
            />

            <div className="lg:order-2">
              {search && (
                <p className="mb-4 font-body text-sm text-gray">
                  Results for{" "}
                  <span className="font-semibold text-ink">“{search}”</span>
                  {" · "}
                  {page.total} {page.total === 1 ? "match" : "matches"}
                </p>
              )}
              <p className="mb-5 font-mono text-[11px] uppercase tracking-wider text-gray lg:hidden">
                {page.total} {page.total === 1 ? "product" : "products"}
              </p>

              {page.items.length === 0 ? (
                <div className="mx-auto max-w-md rounded-card border border-line bg-paper-dim px-6 py-20 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                    {search ? "No matches" : "Empty shelf"}
                  </p>
                  <p className="mt-4 font-display text-2xl font-semibold text-ink">
                    {search ? `Nothing matched “${search}”.` : "Nothing here yet."}
                  </p>
                  <p className="mt-2 font-body text-gray">
                    Try a different {search ? "search" : "category"}, or check back
                    soon.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
                  >
                    View all products
                  </Link>
                </div>
              ) : (
                <InfiniteProductGrid
                  key={`${category ?? ""}|${sort ?? ""}|${search ?? ""}`}
                  initialItems={page.items}
                  total={page.total}
                  filters={{ categorySlug: category, search, sort, pageSize }}
                />
              )}
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
      <PWABadge />
    </>
  );
}
