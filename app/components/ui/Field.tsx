import type { InputHTMLAttributes } from "react";

/** Labeled input with optional inline error. Reused across forms. */
export function Field({
  label,
  id,
  error,
  ...props
}: { label: string; id: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-xs uppercase tracking-wide text-gray"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-[3px] border border-line bg-paper px-3.5 py-3 font-body text-[14.5px] text-ink"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 font-mono text-xs text-gold">
          {error}
        </p>
      )}
    </div>
  );
}
