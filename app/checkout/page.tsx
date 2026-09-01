"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { Container } from "../components/ui/Container";
import { Tappable } from "../components/motion/Tappable";
import { useAuth } from "../lib/auth/AuthProvider";
import { useCart } from "../lib/cart/CartProvider";
import { formatINR } from "../lib/api/catalog";
import {
  addressApi,
  couponApi,
  orderApi,
  type AddressInput,
  type CouponQuote,
  type PaymentMethod,
} from "../lib/api/orders";
import { useAddresses } from "../lib/addresses/useAddresses";
import { paymentApi, verifyWithRetry } from "../lib/api/payment";
import { loadRazorpay, openRazorpay } from "../lib/razorpay";
import { authApi, ApiError } from "../lib/api/auth";
import { mergeGuestData } from "../lib/guest/mergeGuestData";
import {
  SkeletonBlock,
  SkeletonListRows,
} from "../components/ui/Skeleton";
import { FREE_SHIPPING_MINOR, FLAT_SHIPPING_MINOR } from "../lib/site";

const EMPTY_FORM: AddressInput = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { user, loading: authLoading, getToken, applyResult } = useAuth();
  const { cart, loading: cartLoading, refresh } = useCart();
  const router = useRouter();
  const qc = useQueryClient();

  // True from a successful order until the confirmation navigation lands — keeps
  // the "empty cart" prompt from flashing while the cart clears + route changes.
  const [completing, setCompleting] = useState(false);
  // Remember the created online order so a retry (dismissed/failed payment) pays
  // the SAME order instead of piling up duplicate PENDING orders.
  const pendingOrderIdRef = useRef<string | null>(null);

  const {
    addresses,
    loading: loadingAddr,
    create: createAddress,
  } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  // COD is disabled for now — online payment only.
  const [method, setMethod] = useState<PaymentMethod>("RAZORPAY");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<CouponQuote | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // Auto-select the default (or first) address once the list loads. Deferred so
  // no setState runs synchronously inside the effect body.
  useEffect(() => {
    if (loadingAddr) return;
    queueMicrotask(() => {
      setShowForm(addresses.length === 0);
      setSelectedId((cur) => {
        if (cur && addresses.some((a) => a.id === cur)) return cur;
        return (
          addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
        );
      });
    });
  }, [loadingAddr, addresses]);

  const shippingMinor =
    cart.totalMinor >= FREE_SHIPPING_MINOR ? 0 : FLAT_SHIPPING_MINOR;
  const discountMinor = applied
    ? Math.min(applied.discountAmountMinor, cart.totalMinor)
    : 0;
  const grandTotal = Math.max(
    0,
    cart.totalMinor + (cart.items.length ? shippingMinor : 0) - discountMinor,
  );

  const applyCoupon = async () => {
    const token = getToken();
    if (!token || !couponInput.trim()) return;
    setCouponBusy(true);
    setCouponErr(null);
    try {
      const quote = await couponApi.validate(
        token,
        couponInput.trim(),
        cart.totalMinor,
      );
      setApplied(quote);
    } catch (e) {
      setApplied(null);
      setCouponErr(e instanceof Error ? e.message : "Invalid coupon");
    } finally {
      setCouponBusy(false);
    }
  };

  const saveAddress = async () => {
    setBusy(true);
    setError(null);
    try {
      // Guest checkout (ADR-0012, FEAT-019): no token yet → create a
      // brand-new, zero-verification account for this phone, merge the
      // guest cart into it, then create the address under it. A phone that
      // already has an account is rejected (409) — never signed into
      // without verification; the shopper is pointed at "Sign in instead".
      if (!getToken()) {
        const result = await authApi.guest(form.phone);
        applyResult(result);
        await mergeGuestData(result.accessToken);
        await qc.invalidateQueries({ queryKey: ["cart"] });
        const created = await addressApi.create(result.accessToken, {
          ...form,
          isDefault: true,
        });
        setSelectedId(created.id);
        setShowForm(false);
        setForm(EMPTY_FORM);
        return;
      }

      const created = await createAddress({
        ...form,
        isDefault: addresses.length === 0,
      });
      setSelectedId(created.id);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError(
          "This phone number already has an account. Please sign in instead.",
        );
      } else {
        setError(e instanceof Error ? e.message : "Could not save address");
      }
    } finally {
      setBusy(false);
    }
  };

  const goToConfirmation = (orderId: string) =>
    router.push(`/orders/${orderId}?placed=1`);

  // If the shopper changes their address or coupon after an order was already
  // created (e.g. they dismissed the payment sheet, tweaked something, and are
  // paying again), that PENDING order no longer reflects their choices. Drop the
  // cached id so the next attempt creates a fresh order with the new details.
  useEffect(() => {
    pendingOrderIdRef.current = null;
  }, [selectedId, applied]);

  const finish = (orderId: string) => {
    // Guard the empty-cart flash, navigate, THEN refresh the (now-empty) cart.
    setCompleting(true);
    pendingOrderIdRef.current = null;
    goToConfirmation(orderId);
    void refresh();
    // Stock just changed — drop the storefront's cached product lists so the
    // shop grid shows fresh "in stock"/quantity on the shopper's next visit
    // (without a hard reload).
    void qc.invalidateQueries({ queryKey: ["products-infinite"] });
  };

  const placeOrder = async () => {
    const token = getToken();
    if (!token || !selectedId) {
      setError("Please select a delivery address.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (method === "COD") {
        const order = await orderApi.checkout(token, {
          addressId: selectedId,
          paymentMethod: method,
          couponCode: applied?.code,
        });
        finish(order.id); // COD is already PLACED
        return;
      }

      // Online → reuse the PENDING order across retries (no duplicate orders).
      let orderId = pendingOrderIdRef.current;
      if (!orderId) {
        const order = await orderApi.checkout(token, {
          addressId: selectedId,
          paymentMethod: method,
          couponCode: applied?.code,
        });
        orderId = order.id;
        pendingOrderIdRef.current = order.id;
      }
      await payWithRazorpay(token, orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
      setBusy(false);
    }
  };

  const payWithRazorpay = async (token: string, orderId: string) => {
    const init = await paymentApi.initiate(token, orderId);
    const ready = await loadRazorpay();
    if (!ready) {
      throw new Error("Could not load the payment gateway. Please try again.");
    }
    // NOTE: the cart is intentionally NOT cleared here — the backend keeps it
    // (and holds no stock) until payment is verified, so an abandoned payment
    // never loses the selected products.
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
            // Payment captured — verify is idempotent, so retry a transient
            // failure instead of re-initiating (which could double-charge).
            await verifyWithRetry(token, {
              orderId,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            finish(orderId);
          } catch {
            setError(
              "We received your payment but couldn’t confirm it. Please check ‘My orders’ in a moment — do not pay again.",
            );
            setBusy(false);
          }
        })();
      },
      modal: {
        ondismiss: () => {
          // Cart is preserved (backend kept it) — the user keeps their items.
          setError(
            "Payment was not completed. Your items are still in your cart — you can pay anytime from your orders.",
          );
          setBusy(false);
        },
      },
    });
  };

  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Container className="py-12">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold text-ink">
            Checkout
          </h1>

          {completing ? (
            <p className="py-20 text-center font-body text-gray">
              Completing your order…
            </p>
          ) : authLoading || cartLoading ? (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
              <SkeletonListRows count={2} variant="address" />
              <SkeletonBlock className="h-64 w-full rounded-card" />
            </div>
          ) : cart.items.length === 0 ? (
            <Prompt
              title="Your cart is empty"
              cta={{ href: "/shop", label: "Go to shop" }}
            />
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
              <div className="flex flex-col gap-8">
                {/* Address */}
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Delivery address
                    </h2>
                    {!user && !authLoading && (
                      <Link
                        href="/login?redirect=/checkout"
                        className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-forest"
                      >
                        Sign in instead
                      </Link>
                    )}
                  </div>

                  {loadingAddr ? (
                    <SkeletonListRows count={2} variant="address" className="mt-3" />
                  ) : (
                    <div className="mt-4 flex flex-col gap-3">
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex cursor-pointer gap-3 rounded-card border p-4 ${
                            selectedId === a.id
                              ? "border-forest bg-paper-dim"
                              : "border-line"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedId === a.id}
                            onChange={() => setSelectedId(a.id)}
                            className="mt-1 shrink-0 accent-[color:var(--color-forest)]"
                          />
                          <span className="min-w-0 break-words font-body text-sm text-ink">
                            <strong>{a.fullName}</strong> · {a.phone}
                            <br />
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}{" "}
                            {a.pincode}
                          </span>
                        </label>
                      ))}

                      {!showForm && (
                        <button
                          type="button"
                          onClick={() => setShowForm(true)}
                          className="self-start font-mono text-[11px] uppercase tracking-wider text-gold hover:text-forest"
                        >
                          + Add a new address
                        </button>
                      )}
                    </div>
                  )}

                  {showForm && (
                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-card border border-line p-4 sm:grid-cols-2">
                      <Input placeholder="Full name" value={form.fullName} onChange={set("fullName")} span2 />
                      <Input placeholder="Phone" value={form.phone} onChange={set("phone")} />
                      <Input placeholder="Pincode" value={form.pincode} onChange={set("pincode")} />
                      <Input placeholder="Address line 1" value={form.line1} onChange={set("line1")} span2 />
                      <Input placeholder="Address line 2 (optional)" value={form.line2 ?? ""} onChange={set("line2")} span2 />
                      <Input placeholder="City" value={form.city} onChange={set("city")} />
                      <Input placeholder="State" value={form.state} onChange={set("state")} />
                      <div className="col-span-2 flex gap-3">
                        <button
                          type="button"
                          onClick={saveAddress}
                          disabled={busy}
                          className="rounded-chip bg-forest px-5 py-2.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
                        >
                          Save address
                        </button>
                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="font-mono text-[11px] uppercase tracking-wider text-gray"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* Payment */}
                <section>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Payment
                  </h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {(
                      [
                        {
                          key: "RAZORPAY",
                          label: "Pay online · UPI / Cards / NetBanking",
                        },
                        // Cash on Delivery is disabled for now.
                      ] as { key: PaymentMethod; label: string }[]
                    ).map((m) => (
                      <label
                        key={m.key}
                        className={`flex cursor-pointer items-center gap-3 rounded-card border p-4 ${
                          method === m.key ? "border-forest bg-paper-dim" : "border-line"
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          checked={method === m.key}
                          onChange={() => setMethod(m.key)}
                          className="shrink-0 accent-[color:var(--color-forest)]"
                        />
                        <span className="min-w-0 break-words font-body text-sm text-ink">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              {/* Summary */}
              <aside className="h-fit rounded-card border border-line bg-paper-dim p-6">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Order summary
                </h2>
                <ul className="mt-4 flex flex-col gap-2 border-b border-line pb-4">
                  {cart.items.map((i) => (
                    <li
                      key={i.id}
                      className="flex justify-between gap-3 font-body text-sm text-gray"
                    >
                      <span className="min-w-0 break-words">
                        {i.name} × {i.quantity}
                      </span>
                      <span className="shrink-0 text-ink">{formatINR(i.lineTotalMinor)}</span>
                    </li>
                  ))}
                </ul>
                {/* Coupon */}
                <div className="mt-4 border-t border-line pt-4">
                  {applied ? (
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-forest">
                        ✓ {applied.code} applied
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setApplied(null);
                          setCouponInput("");
                        }}
                        className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className="min-w-0 flex-1 rounded-chip border border-line bg-white px-3 py-2 font-body text-sm uppercase text-ink placeholder:text-gray focus:border-forest focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponBusy || !couponInput.trim()}
                        className="shrink-0 rounded-chip border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink hover:border-forest hover:text-forest disabled:opacity-40"
                      >
                        {couponBusy ? "…" : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponErr && (
                    <p role="alert" className="mt-2 font-mono text-[11px] text-gold">
                      {couponErr}
                    </p>
                  )}
                </div>

                <dl className="mt-4 flex flex-col gap-2 font-body text-sm">
                  <Row label="Subtotal" value={formatINR(cart.totalMinor)} />
                  <Row
                    label="Shipping"
                    value={shippingMinor === 0 ? "Free" : formatINR(shippingMinor)}
                  />
                  {discountMinor > 0 && (
                    <Row
                      label={`Discount${applied ? ` (${applied.code})` : ""}`}
                      value={`− ${formatINR(discountMinor)}`}
                    />
                  )}
                  <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold text-ink">
                    <dt>Total</dt>
                    <dd>{formatINR(grandTotal)}</dd>
                  </div>
                </dl>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-chip border border-gold bg-gold-dim/40 px-3 py-2 font-mono text-[11px] tracking-wide text-ink"
                  >
                    {error}
                  </p>
                )}

                <Tappable lift={0} className="mt-6 block">
                  <button
                    type="button"
                    onClick={placeOrder}
                    disabled={busy || !selectedId}
                    className="w-full rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper disabled:opacity-60"
                  >
                    {busy ? "Placing order…" : "Place order"}
                  </button>
                </Tappable>
                <Link
                  href="/cart"
                  className="mt-3 block text-center font-mono text-[11px] uppercase tracking-wider text-gray hover:text-forest"
                >
                  Back to cart
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

function Input({
  span2,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { span2?: boolean }) {
  return (
    <input
      {...props}
      className={`${span2 ? "col-span-2" : ""} rounded-chip border border-line bg-white px-3 py-2.5 font-body text-sm text-ink placeholder:text-gray focus:border-forest focus:outline-none`}
    />
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

function Prompt({
  title,
  cta,
}: {
  title: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-2xl font-semibold text-ink">{title}</p>
      <Link
        href={cta.href}
        className="mt-6 inline-block rounded-chip bg-forest px-6 py-3 font-body text-sm font-semibold text-paper"
      >
        {cta.label}
      </Link>
    </div>
  );
}
