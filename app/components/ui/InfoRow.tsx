import type { ReactNode } from "react";

/**
 * Label/value row. Meant to sit inside `divide-y divide-line border-y
 * border-line`. `value` accepts a node so a trailing StatusPill fits. Server
 * Component.
 */
export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="font-mono text-[12.5px] uppercase tracking-wide text-gray">
        {label}
      </dt>
      <dd className="flex items-center gap-2 font-body text-sm text-ink">
        {value}
      </dd>
    </div>
  );
}
