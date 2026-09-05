import Link from "next/link";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { PRODUCT_GRID_CLASS } from "../ui/Skeleton";
import { ProductCard } from "../shop/ProductCard";
import { Reveal } from "../motion/Reveal";
import { catalogApi, type Product } from "../../lib/api/catalog";

const COUNT = 4;

/**
 * Live catalogue on the homepage (FEAT-022). Until now nothing on `/` came
 * from the catalogue at all, so a product added in the admin dashboard only
 * ever surfaced on `/shop`.
 *
 * Prefers the products an admin has flagged Featured; if none are flagged it
 * falls back to the newest listing, so the section is never an empty hole just
 * because nobody has curated the flag yet. Renders nothing only when the
 * catalogue itself is empty (or unreachable — `catalogApi` degrades to an
 * empty page rather than throwing).
 */
export async function pickProducts(): Promise<Product[]> {
  const featured = await catalogApi.products({
    isFeatured: true,
    pageSize: COUNT,
  });
  if (featured.items.length > 0) return featured.items;
  const newest = await catalogApi.products({ pageSize: COUNT });
  return newest.items;
}

export async function FeaturedProducts() {
  const products = await pickProducts();
  if (products.length === 0) return null;

  return (
    <Container
      as="section"
      aria-labelledby="featured-products-heading"
      className="py-20 md:py-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="On the shelf"
          id="featured-products-heading"
        >
          Verified and ready to ship.
        </SectionHeading>
        <Link
          href="/shop"
          className="font-body text-sm font-medium text-forest underline-offset-4 hover:underline"
        >
          Shop all →
        </Link>
      </div>
      <ul className={`${PRODUCT_GRID_CLASS} mt-10`}>
        {products.map((product, i) => (
          <li key={product.id} className="flex">
            <Reveal delay={i * 0.06} className="flex w-full">
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  );
}
