import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { PageHero } from "../components/ui/PageHero";
import { PWABadge } from "../components/pwa/PWABadge";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/motion/Reveal";
import { ProductCard } from "../components/shop/ProductCard";
import { ShopFilters } from "../components/shop/ShopFilters";
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
  const sortParam = first(sp.sort);
  const sort =
    sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : undefined;

  const [categories, page] = await Promise.all([
    catalogApi.categories(),
    catalogApi.products({ categorySlug: category, sort, pageSize: 24 }),
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
        <Container className="py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start lg:gap-12">
            <ShopFilters
              categories={categories}
              activeCategory={category}
              activeSort={sortParam}
              total={page.total}
              className="lg:order-2"
            />

            <div className="lg:order-1">
              <p className="mb-5 font-mono text-[11px] uppercase tracking-wider text-gray lg:hidden">
                {page.total} {page.total === 1 ? "product" : "products"}
              </p>

              {page.items.length === 0 ? (
                <div className="mx-auto max-w-md rounded-card border border-line bg-paper-dim px-6 py-20 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                    Empty shelf
                  </p>
                  <p className="mt-4 font-display text-2xl font-semibold text-ink">
                    Nothing here yet.
                  </p>
                  <p className="mt-2 font-body text-gray">
                    Try a different category, or check back soon.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
                  >
                    View all products
                  </Link>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {page.items.map((product, i) => (
                    <Reveal
                      as="li"
                      key={product.id}
                      delay={Math.min(i * 0.04, 0.32)}
                      className="h-full"
                    >
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </ul>
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
