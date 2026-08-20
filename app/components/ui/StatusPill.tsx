import type { ReactNode } from "react";
import type { StatusTone } from "../../lib/api/orders";

const TONES: Record<StatusTone, string> = {
  verified: "bg-paper-dim text-forest border border-line",
  accent: "bg-gold text-ink",
  pending: "text-gold border border-gold-dim",
  neutral: "text-gray border border-line",
};

/**
 * Small mono uppercase badge for order status, verification, role, "Default".
 * Design-system tokens only. Server Component (no hooks).
 */
export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: StatusTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
