"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { PRODUCT_GRID_CLASS, SkeletonCardGrid } from "../ui/Skeleton";
import { getRelatedProducts } from "../../lib/api/catalog";

/**
 * "You may also like" rail on the product detail page (FEAT-017). The
 * backend's `/products/:slug/related` already ranks + filters (same category,
 * active, in-stock, max 8) — this just renders the result. Client-side
 * (TanStack Query) since the parent page is a Server Component and this is
 * non-critical, below-the-fold content.
 *
 * Shows a card-grid skeleton while the query is in flight (CHORE-020); once it
 * settles, renders nothing at all — no heading, no empty box — if the result
 * is genuinely empty (no category, or no other matches).
 */
export function RelatedProducts({ slug }: { slug: string }) {
  const { data: related = [], isLoading } = useQuery({
    queryKey: ["related-products", slug],
    queryFn: () => getRelatedProducts(slug),
  });

  if (!isLoading && related.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="related-products-heading"
      className="py-14 md:py-20"
    >
      <SectionHeading eyebrow="You may also like" id="related-products-heading">
        More to explore
      </SectionHeading>
      {isLoading ? (
        <SkeletonCardGrid count={4} className="mt-8" />
      ) : (
        <ul className={`mt-8 ${PRODUCT_GRID_CLASS}`}>
          {related.map((product) => (
            <li key={product.id} className="h-full">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
