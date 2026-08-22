"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/motion/Reveal";
import { useAuth } from "../lib/auth/AuthProvider";
import { useCart } from "../lib/cart/CartProvider";
import { formatINR } from "../lib/api/catalog";

export default function CartPage() {
  const { loading: authLoading } = useAuth();
  const { cart, setQuantity, remove, loading } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const withBusy = async (productId: string, fn: () => Promise<void>) => {
    setBusyId(productId);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-12">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold text-ink">
            Your cart
          </h1>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-chip border border-gold bg-gold-dim/40 px-4 py-3 font-mono text-xs tracking-wide text-ink"
            >
              {error}
            </p>
          )}

          {authLoading || loading ? (
            <p className="py-16 text-center font-body text-gray">
              Loading your cart…
            </p>
          ) : cart.items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              body="Browse the catalog and add something clean."
              cta={{ href: "/shop", label: "Go to shop" }}
            />
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {cart.items.map((line) => (
                  <Reveal as="li" key={line.id} className="flex gap-4 py-5">
                    <Link
                      href={`/product/${line.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card border border-line bg-paper-dim"
                    >
                      {line.image && (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          href={`/product/${line.slug}`}
                          className="font-display text-lg font-semibold text-ink hover:text-forest"
                        >
                          {line.name}
                        </Link>
                        <span className="font-body font-semibold text-forest">
                          {formatINR(line.lineTotalMinor)}
                        </span>
                      </div>
                      <p className="mt-1 font-body text-sm text-gray">
                        {formatINR(line.priceMinor)} each
                      </p>
                      {!line.isActive && (
                        <p className="mt-1 font-mono text-[11px] tracking-wide text-gold">
                          NO LONGER AVAILABLE
                        </p>
                      )}

                      <div className="mt-auto flex items-center gap-4 pt-3">
                        <div className="flex items-center rounded-chip border border-ink">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={busyId === line.productId || line.quantity <= 1}
                            onClick={() =>
                              withBusy(line.productId, () =>
                                setQuantity(line.productId, line.quantity - 1),
                              )
                            }
                            className="px-3 py-1.5 font-mono disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center font-body text-sm font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={
                              busyId === line.productId ||
                              line.quantity >= line.stock
                            }
                            onClick={() =>
                              withBusy(line.productId, () =>
                                setQuantity(line.productId, line.quantity + 1),
                              )
                            }
                            className="px-3 py-1.5 font-mono disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={busyId === line.productId}
                          onClick={() =>
                            withBusy(line.productId, () => remove(line.productId))
                          }
                          className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-gold disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>

              <aside className="h-fit rounded-card border border-line bg-paper-dim p-6">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Summary
                </h2>
                <dl className="mt-4 flex justify-between font-body text-sm">
                  <dt className="text-gray">Subtotal</dt>
                  <dd className="font-semibold text-ink">
                    {formatINR(cart.totalMinor)}
                  </dd>
                </dl>
                <p className="mt-2 font-body text-xs text-gray">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  aria-disabled={loading}
                  className="mt-6 block rounded-chip bg-forest px-6 py-3 text-center font-body text-sm font-semibold text-paper"
                >
                  Checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-3 block text-center font-mono text-[11px] uppercase tracking-wider text-gray hover:text-forest"
                >
                  Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      <p className="mt-2 font-body text-gray">{body}</p>
      <Link
        href={cta.href}
        className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
      >
        {cta.label}
      </Link>
    </div>
  );
}
