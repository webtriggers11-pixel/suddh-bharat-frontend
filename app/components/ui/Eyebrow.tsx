import type { ReactNode } from "react";

/** Uppercase gold mono kicker used above headings (design-system eyebrow). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.12em] text-gold">
      {children}
    </p>
  );
}
