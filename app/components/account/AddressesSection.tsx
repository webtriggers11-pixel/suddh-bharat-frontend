"use client";

import { useState } from "react";
import { Panel } from "../ui/Panel";
import { StatusPill } from "../ui/StatusPill";
import { Reveal } from "../motion/Reveal";
import { Collapse } from "../motion/Collapse";
import { Tappable } from "../motion/Tappable";
import { AddressForm } from "./AddressForm";
import { useAddresses } from "../../lib/addresses/useAddresses";

export function AddressesSection() {
  const { addresses, loading, isError, setDefault, remove, refresh } =
    useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state: "loading" | "ready" | "error" = loading
    ? "loading"
    : isError
      ? "error"
      : "ready";

  // The hook mutations invalidate the cached list, so the grid refreshes itself.
  const mutate = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
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
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[22px] font-semibold text-ink md:text-2xl">
          Addresses
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-chip border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink hover:border-forest hover:text-forest"
          >
            + Add address
          </button>
        )}
      </div>

      <Collapse open={showForm} id="address-form">
        <AddressForm
          makeDefault={addresses.length === 0}
          onSaved={() => {
            setShowForm(false);
            void refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Collapse>

      {error && (
        <p role="alert" className="mt-3 font-mono text-xs text-gold">
          {error}
        </p>
      )}

      {state === "loading" ? (
        <p className="mt-4 font-body text-sm text-gray">Loading…</p>
      ) : addresses.length === 0 && !showForm ? (
        <Panel className="mt-4 text-center">
          <p className="font-body text-sm text-gray">No saved addresses yet.</p>
        </Panel>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Reveal key={a.id}>
              <Tappable lift={-2}>
                <Panel tone={a.isDefault ? "active" : "default"}>
                  <div className="flex items-start justify-between gap-3">
                    <StatusPill tone="neutral">{a.type}</StatusPill>
                    {a.isDefault && <StatusPill tone="verified">Default</StatusPill>}
                  </div>
                  <p className="mt-3 font-body text-sm text-ink">
                    <strong>{a.fullName}</strong>{" "}
                    <span className="text-gray">· {a.phone}</span>
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}{" "}
                    {a.pincode}
                  </p>
                  <div className="mt-4 flex gap-4 border-t border-line pt-3 font-mono text-[11px] uppercase tracking-wider">
                    {!a.isDefault && (
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => void mutate(a.id, () => setDefault(a.id))}
                        className="text-gray hover:text-forest disabled:opacity-40"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === a.id || a.isLocked}
                      aria-disabled={a.isLocked}
                      title={
                        a.isLocked
                          ? "Linked to an order — cannot be deleted"
                          : undefined
                      }
                      onClick={() => void mutate(a.id, () => remove(a.id))}
                      className="text-gray hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </Panel>
              </Tappable>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
