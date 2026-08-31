"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "../../components/home/SiteHeader";
import { SiteFooter } from "../../components/home/SiteFooter";
import { Container } from "../../components/ui/Container";
import { Reveal } from "../../components/motion/Reveal";
import { StatusPill } from "../../components/ui/StatusPill";
import {
  SkeletonBlock,
  SkeletonLines,
  SkeletonListRows,
} from "../../components/ui/Skeleton";
import { useAuth } from "../../lib/auth/AuthProvider";
import { formatINR } from "../../lib/api/catalog";
import {
  orderApi,
  orderStatusLabel,
  orderStatusTone,
  type Order,
} from "../../lib/api/orders";
import { paymentApi, verifyWithRetry } from "../../lib/api/payment";
import { loadRazorpay, openRazorpay } from "../../lib/razorpay";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const justPlaced = search.get("placed") === "1";
  const { user, loading: authLoading, getToken } = useAuth();
  const qc = useQueryClient();
  const token = getToken();

  const orderKey = ["order", params.id, user?.id ?? null];
  const {
    data: order = null,
    isLoading,
    isError,
  } = useQuery({
    queryKey: orderKey,
    queryFn: () => orderApi.get(token as string, params.id),
    enabled: !!token,
  });
  const setOrder = (o: Order) => qc.setQueryData(orderKey, o);

  const state: "loading" | "ready" | "error" =
    authLoading || (!!token && isLoading)
      ? "loading"
      : isError || !order
        ? "error"
        : "ready";

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const payNow = async () => {
    const token = getToken();
    if (!token || !order) return;
    setPaying(true);
    setPayError(null);
    try {
      const init = await paymentApi.initiate(token, order.id);
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Could not load the payment gateway.");
      openRazorpay({
        key: init.keyId,
        amount: init.amountPaise,
        currency: init.currency,
        order_id: init.razorpayOrderId,
        name: "Shuddha Bharat",
        description: `Order ${init.orderNumber}`,
        prefill: { name: user?.name ?? undefined, email: user?.email ?? undefined },
        theme: { color: "#1f4d3a" },
        handler: (resp) => {
          void (async () => {
            try {
              // Idempotent retry — never re-initiate a captured payment.
              const updated = await verifyWithRetry(token, {
                orderId: order.id,
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature,
              });
              setOrder(updated);
              setPaying(false);
            } catch {
              setPayError(
                "We received your payment but couldn’t confirm it yet. Refresh in a moment — please don’t pay again.",
              );
              setPaying(false);
            }
          })();
        },
        modal: { ondismiss: () => setPaying(false) },
      });
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Could not start payment");
      setPaying(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-12">
          {state === "loading" ? (
            <div>
              <SkeletonLines widths={["h-3 w-32", "h-8 w-64"]} />
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                <SkeletonListRows count={3} variant="order-compact" />
                <SkeletonBlock className="h-52 w-full rounded-card" />
              </div>
            </div>
          ) : state === "error" || !order ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl font-semibold text-ink">
                Order not found
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
              {justPlaced && order.status !== "PENDING" && (
                <div className="mb-6 rounded-card border border-forest bg-paper-dim p-5">
                  <p className="font-display text-xl font-semibold text-forest">
                    Thank you — your order is placed. ✓
                  </p>
                  <p className="mt-1 font-body text-sm text-gray">
                    A confirmation is on its way. You can track it here anytime.
                  </p>
                </div>
              )}

              {order.status === "PENDING" && (
                <div className="mb-6 rounded-card border border-gold bg-gold-dim/30 p-5">
                  <p className="font-display text-xl font-semibold text-ink">
                    Payment pending
                  </p>
                  <p className="mt-1 font-body text-sm text-gray">
                    Your order is reserved but not yet paid. Complete the payment
                    to confirm it.
                  </p>
                  {payError && (
                    <p
                      role="alert"
                      className="mt-3 font-mono text-[11px] tracking-wide text-ink"
                    >
                      {payError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={payNow}
                    disabled={paying}
                    className="mt-4 rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper disabled:opacity-60"
                  >
                    {paying ? "Opening payment…" : `Pay ${formatINR(order.totalMinor)}`}
                  </button>
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
                        : order.status === "PENDING"
                          ? "Online · awaiting payment"
                          : "Paid online (Razorpay)"}
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
