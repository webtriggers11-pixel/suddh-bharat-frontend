import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "../../components/home/SiteHeader";
import { SiteFooter } from "../../components/home/SiteFooter";
import { PWABadge } from "../../components/pwa/PWABadge";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { ProductGallery } from "../../components/shop/ProductGallery";
import { AddToCartButton } from "../../components/shop/AddToCartButton";
import { catalogApi, discountPct, formatINR } from "../../lib/api/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalogApi.product(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.description ?? `${product.name} — verified clean on Shuddha.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await catalogApi.product(slug);
  if (!product) notFound();

  const off = discountPct(product.priceMinor, product.mrpMinor);
  const inStock = product.stock > 0;

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-8">
          <Link
            href="/shop"
            className="font-mono text-[11px] uppercase tracking-wider text-gold hover:text-forest"
          >
            ← Back to shop
          </Link>
        </Container>

        <Container className="grid gap-10 pb-16 lg:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} />

          <div className="flex flex-col">
            {product.isHandmade && <Eyebrow>Handmade · Verified</Eyebrow>}
            <h1 className="mt-3 font-display text-[clamp(28px,3.4vw,40px)] font-semibold leading-tight text-ink">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-forest">
                {formatINR(product.priceMinor)}
              </span>
              {off > 0 && (
                <>
                  <span className="font-body text-lg text-gray line-through">
                    {formatINR(product.mrpMinor)}
                  </span>
                  <span className="rounded-chip bg-gold px-2 py-1 font-mono text-[11px] font-bold tracking-wide text-ink">
                    {off}% OFF
                  </span>
                </>
              )}
            </div>

            <p
              className={`mt-3 font-mono text-xs tracking-wide ${
                inStock ? "text-forest" : "text-gold"
              }`}
            >
              {inStock ? `IN STOCK · ${product.stock} available` : "OUT OF STOCK"}
            </p>

            {product.description && (
              <p className="mt-6 max-w-prose font-body text-[15px] leading-relaxed text-gray">
                {product.description}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-6 font-body text-sm">
              {product.material && (
                <Detail label="Material" value={product.material} />
              )}
              {product.color && <Detail label="Colour" value={product.color} />}
              {product.reviewCount > 0 && (
                <Detail
                  label="Rating"
                  value={`${product.avgRating.toFixed(1)} ★ (${product.reviewCount})`}
                />
              )}
            </dl>

            <div className="mt-8">
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                inStock={inStock}
                maxQty={product.stock}
              />
            </div>

            {product.tags.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-chip border border-line bg-paper-dim px-3 py-1 font-mono text-[11px] tracking-wide text-gray"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </main>
      <SiteFooter />
      <PWABadge />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-gold">
        {label}
      </dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}
