"use client";

import { useState } from "react";
import { Field } from "../ui/Field";
import { useAuth } from "../../lib/auth/AuthProvider";
import {
  addressApi,
  type Address,
  type AddressInput,
} from "../../lib/api/orders";

const EMPTY: AddressInput = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

/** Add-address form. On success calls onSaved with the created address. */
export function AddressForm({
  makeDefault,
  onSaved,
  onCancel,
}: {
  makeDefault: boolean;
  onSaved: (address: Address) => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    const token = getToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const created = await addressApi.create(token, {
        ...form,
        isDefault: makeDefault,
      });
      onSaved(created);
      setForm(EMPTY);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save address");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-card border border-line bg-paper-dim p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full name" id="addr-name" value={form.fullName} onChange={set("fullName")} />
        </div>
        <Field label="Phone" id="addr-phone" value={form.phone} onChange={set("phone")} />
        <Field label="Pincode" id="addr-pin" value={form.pincode} onChange={set("pincode")} />
        <div className="sm:col-span-2">
          <Field label="Address line 1" id="addr-l1" value={form.line1} onChange={set("line1")} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Address line 2 (optional)" id="addr-l2" value={form.line2 ?? ""} onChange={set("line2")} />
        </div>
        <Field label="City" id="addr-city" value={form.city} onChange={set("city")} />
        <Field label="State" id="addr-state" value={form.state} onChange={set("state")} />
      </div>

      {error && (
        <p role="alert" className="mt-3 font-mono text-xs text-gold">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="rounded-chip bg-forest px-5 py-2.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
