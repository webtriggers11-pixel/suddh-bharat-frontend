"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "../../components/home/SiteHeader";
import { SiteFooter } from "../../components/home/SiteFooter";
import { Container } from "../../components/ui/Container";
import { Reveal } from "../../components/motion/Reveal";
import { StatusPill } from "../../components/ui/StatusPill";
import { useAuth } from "../../lib/auth/AuthProvider";
import { formatINR } from "../../lib/api/catalog";
import {
  orderApi,
  orderStatusLabel,
  orderStatusTone,
  type Order,
} from "../../lib/api/orders";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const justPlaced = search.get("placed") === "1";
  const { user, loading: authLoading, getToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      const token = getToken();
      if (!token) {
        if (active) setState("error");
        return;
      }
      try {
        const o = await orderApi.get(token, params.id);
        if (!active) return;
        setOrder(o);
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    });
    return () => {
      active = false;
    };
  }, [params.id, user, getToken]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-12">
          {state === "loading" ? (
            <p className="font-body text-gray">Loading your order…</p>
          ) : state === "error" || !order ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl font-semibold text-ink">
                {authLoading ? "Loading…" : "Order not found"}
              </p>
              <Link
                href="/orders"
                className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
              >
                View your orders
              </Link>
            </div>
          ) : (
            <Reveal>
              {justPlaced && (
                <div className="mb-6 rounded-card border border-forest bg-paper-dim p-5">
                  <p className="font-display text-xl font-semibold text-forest">
                    Thank you — your order is placed. ✓
                  </p>
                  <p className="mt-1 font-body text-sm text-gray">
                    A confirmation is on its way. You can track it here anytime.
                  </p>
                </div>
              )}

              <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                Order {order.orderNumber}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-[clamp(24px,3vw,36px)] font-semibold text-ink">
                  {orderStatusLabel(order.status)}
                </h1>
                <StatusPill tone={orderStatusTone(order.status)}>
                  {orderStatusLabel(order.status)}
                </StatusPill>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                <ul className="flex flex-col divide-y divide-line border-y border-line">
                  {order.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-4 py-4">
                      <span className="font-body text-sm text-ink">
                        {i.productName}
                        <span className="text-gray"> × {i.quantity}</span>
                      </span>
                      <span className="font-body text-sm font-semibold text-forest">
                        {formatINR(i.lineTotalMinor)}
                      </span>
                    </li>
                  ))}
                </ul>

                <aside className="h-fit rounded-card border border-line bg-paper-dim p-6">
                  <dl className="flex flex-col gap-2 font-body text-sm">
                    <Row label="Subtotal" value={formatINR(order.subtotalMinor)} />
                    <Row
                      label="Shipping"
                      value={
                        order.shippingMinor === 0
                          ? "Free"
                          : formatINR(order.shippingMinor)
                      }
                    />
                    <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold text-ink">
                      <dt>Total</dt>
                      <dd>{formatINR(order.totalMinor)}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 border-t border-line pt-4 font-body text-sm text-gray">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                      Payment
                    </p>
                    <p className="mt-1 text-ink">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Paid online (demo)"}
                    </p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-gold">
                      Ship to
                    </p>
                    <p className="mt-1 text-ink">
                      {order.shipName}, {order.shipPhone}
                      <br />
                      {order.shipLine1}
                      {order.shipLine2 ? `, ${order.shipLine2}` : ""},{" "}
                      {order.shipCity}, {order.shipState} {order.shipPincode}
                    </p>
                  </div>
                </aside>
              </div>

              <Link
                href="/shop"
                className="mt-8 inline-block font-mono text-[11px] uppercase tracking-wider text-gray hover:text-forest"
              >
                ← Continue shopping
              </Link>
            </Reveal>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
