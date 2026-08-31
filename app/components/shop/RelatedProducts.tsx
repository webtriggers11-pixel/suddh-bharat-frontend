"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { getRelatedProducts } from "../../lib/api/catalog";

/**
 * "You may also like" rail on the product detail page (FEAT-017). The
 * backend's `/products/:slug/related` already ranks + filters (same category,
 * active, in-stock, max 8) — this just renders the result. Client-side
 * (TanStack Query) since the parent page is a Server Component and this is
 * non-critical, below-the-fold content.
 *
 * Renders nothing at all — no heading, no empty box — while loading and when
 * the list is empty: a product with no category (or no other matches) never
 * shows a dead section, and we can't tell the two apart until the query
 * settles, so staying invisible until data actually arrives is correct here
 * rather than a loading skeleton that would flash before an empty result.
 */
export function RelatedProducts({ slug }: { slug: string }) {
  const { data: related = [] } = useQuery({
    queryKey: ["related-products", slug],
    queryFn: () => getRelatedProducts(slug),
  });

  if (related.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="related-products-heading"
      className="py-14 md:py-20"
    >
      <SectionHeading eyebrow="You may also like" id="related-products-heading">
        More to explore
      </SectionHeading>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {related.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
