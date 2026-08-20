"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  orderApi,
  type Address,
  type AddressInput,
  type PaymentMethod,
} from "../lib/api/orders";

const FREE_SHIPPING_MINOR = 49900;
const FLAT_SHIPPING_MINOR = 4900;

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
  const { user, loading: authLoading, getToken } = useAuth();
  const { cart, refresh } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      const token = getToken();
      if (!token) {
        if (active) setLoadingAddr(false);
        return;
      }
      try {
        const list = await addressApi.list(token);
        if (!active) return;
        setAddresses(list);
        setSelectedId(list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
        setShowForm(list.length === 0);
      } catch {
        if (active) setShowForm(true);
      } finally {
        if (active) setLoadingAddr(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user, getToken]);

  const shippingMinor =
    cart.totalMinor >= FREE_SHIPPING_MINOR ? 0 : FLAT_SHIPPING_MINOR;
  const grandTotal = cart.totalMinor + (cart.items.length ? shippingMinor : 0);

  const saveAddress = async () => {
    const token = getToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const created = await addressApi.create(token, { ...form, isDefault: addresses.length === 0 });
      setAddresses((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setSelectedId(created.id);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save address");
    } finally {
      setBusy(false);
    }
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
      const order = await orderApi.checkout(token, {
        addressId: selectedId,
        paymentMethod: method,
      });
      await refresh();
      router.push(`/orders/${order.id}?placed=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setBusy(false);
    }
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

          {!user && !authLoading ? (
            <Prompt
              title="Sign in to check out"
              cta={{ href: "/login?redirect=/checkout", label: "Sign in" }}
            />
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
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Delivery address
                  </h2>

                  {loadingAddr ? (
                    <p className="mt-3 font-body text-sm text-gray">Loading…</p>
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
                            className="mt-1 accent-[color:var(--color-forest)]"
                          />
                          <span className="font-body text-sm text-ink">
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
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-card border border-line p-4">
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
                        { key: "COD", label: "Cash on Delivery" },
                        { key: "RAZORPAY", label: "Pay online (demo)" },
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
                          className="accent-[color:var(--color-forest)]"
                        />
                        <span className="font-body text-sm text-ink">{m.label}</span>
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
                      className="flex justify-between font-body text-sm text-gray"
                    >
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span className="text-ink">{formatINR(i.lineTotalMinor)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 flex flex-col gap-2 font-body text-sm">
                  <Row label="Subtotal" value={formatINR(cart.totalMinor)} />
                  <Row
                    label="Shipping"
                    value={shippingMinor === 0 ? "Free" : formatINR(shippingMinor)}
                  />
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
