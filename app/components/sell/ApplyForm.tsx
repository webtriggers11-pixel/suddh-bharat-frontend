"use client";

import { useState } from "react";
import { SELL_CATEGORIES } from "./content";

const labelCls =
  "mb-2 block font-mono text-xs uppercase tracking-wide text-gray";
const fieldCls =
  "w-full rounded-[3px] border border-line bg-paper px-3.5 py-3 font-body text-[14.5px] text-ink";

/** Vendor application form. Client-side validation + confirmation for now. */
export function ApplyForm() {
  const [brand, setBrand] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand.trim().length < 2) {
      setError(true);
      return;
    }
    // TODO: POST to the vendor-applications API once the backend endpoint exists.
    setError(false);
    setDone(true);
  };

  if (done) {
    return (
      <p
        role="status"
        className="mx-auto max-w-[640px] rounded-card border border-line bg-white p-11 text-center font-body text-ink"
      >
        Thanks — your application is in. We&apos;ll review it against the category
        standard and follow up by email.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto max-w-[640px] rounded-md border border-line bg-white p-11"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brand" className={labelCls}>
            Brand name
          </label>
          <input
            id="brand"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              if (error) setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "brand-error" : undefined}
            placeholder="e.g. Slurrp Farm"
            className={fieldCls}
          />
          {error && (
            <p id="brand-error" role="alert" className="mt-2 font-mono text-xs text-gold">
              Please enter your brand name.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="category" className={labelCls}>
            Category
          </label>
          <select id="category" className={fieldCls} defaultValue={SELL_CATEGORIES[0]}>
            {SELL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor="link" className={labelCls}>
          Website or Instagram
        </label>
        <input id="link" placeholder="@yourbrand or yourbrand.com" className={fieldCls} />
      </div>
      <div className="mt-5">
        <label htmlFor="clean" className={labelCls}>
          What makes your product clean?
        </label>
        <textarea
          id="clean"
          rows={3}
          placeholder="One or two lines on ingredients, sourcing, or fabric — we'll follow up for full disclosure."
          className={`${fieldCls} min-h-[90px] resize-y`}
        />
      </div>
      <button
        type="submit"
        className="mt-6 w-full rounded-[3px] bg-forest px-7 py-4 font-body text-sm font-bold text-paper"
      >
        Submit application
      </button>
    </form>
  );
}
