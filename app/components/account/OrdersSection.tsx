"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "../motion/Reveal";
import { StatusPill } from "../ui/StatusPill";
import { useAuth } from "../../lib/auth/AuthProvider";
import { formatINR } from "../../lib/api/catalog";
import {
  orderApi,
  orderStatusLabel,
  orderStatusTone,
} from "../../lib/api/orders";

export function OrdersSection() {
  const { user, getToken } = useAuth();
  const token = getToken();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", user?.id ?? null],
    queryFn: () => orderApi.mine(token as string),
    enabled: !!token,
  });

  const state: "loading" | "ready" | "error" =
    !!token && isLoading ? "loading" : isError ? "error" : "ready";

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold text-ink md:text-2xl">
          Recent orders
        </h2>
        {orders.length > 0 && (
          <Link
            href="/orders"
            className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-forest"
          >
            View all →
          </Link>
        )}
      </div>

      {state === "loading" ? (
        <p className="mt-4 font-body text-sm text-gray">Loading…</p>
      ) : state === "error" ? (
        <p role="alert" className="mt-4 font-mono text-xs text-gold">
          Couldn’t load your orders. Please try again.
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-4 rounded-card border border-line bg-white p-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            No orders yet
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {orders.slice(0, 4).map((o) => (
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
                    {o.items.length} {o.items.length === 1 ? "item" : "items"}
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
    </section>
  );
}
