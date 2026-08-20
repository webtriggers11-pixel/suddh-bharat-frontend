"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { Container } from "../components/ui/Container";
import { Reveal } from "../components/motion/Reveal";
import { StatusPill } from "../components/ui/StatusPill";
import { useAuth } from "../lib/auth/AuthProvider";
import { formatINR } from "../lib/api/catalog";
import {
  orderApi,
  orderStatusLabel,
  orderStatusTone,
  type Order,
} from "../lib/api/orders";

export default function OrdersPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "signedout">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      const token = getToken();
      if (!token) {
        if (active) setState("signedout");
        return;
      }
      try {
        const list = await orderApi.mine(token);
        if (!active) return;
        setOrders(list);
        setState("ready");
      } catch {
        if (active) setState("ready");
      }
    });
    return () => {
      active = false;
    };
  }, [user, getToken]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-12">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold text-ink">
            Your orders
          </h1>

          {state === "signedout" && !authLoading ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl font-semibold text-ink">
                Sign in to see your orders
              </p>
              <Link
                href="/login?redirect=/orders"
                className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
              >
                Sign in
              </Link>
            </div>
          ) : state === "loading" ? (
            <p className="mt-6 font-body text-gray">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl font-semibold text-ink">
                No orders yet
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-8 flex flex-col gap-4">
              {orders.map((o) => (
                <Reveal as="li" key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 rounded-card border border-line bg-white p-5 hover:border-forest"
                  >
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                        {o.orderNumber}
                      </p>
                      <p className="mt-1 font-display text-lg font-semibold text-ink">
                        {o.items.length}{" "}
                        {o.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill tone={orderStatusTone(o.status)}>
                        {orderStatusLabel(o.status)}
                      </StatusPill>
                      <span className="font-body font-semibold text-forest">
                        {formatINR(o.totalMinor)}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
