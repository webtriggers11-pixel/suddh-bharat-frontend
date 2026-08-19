import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "gold";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-forest text-paper",
  secondary: "border border-ink text-ink",
  gold: "bg-gold text-ink font-bold",
};

/**
 * Design-system button. Renders an `<a>` when `href` is given, else a `<button>`.
 * Variants map to the documented primary / secondary / gold styles.
 */
export function Button({
  href,
  variant = "primary",
  type = "button",
  className = "",
  children,
}: {
  href?: string;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  className?: string;
  children: ReactNode;
}) {
  const cls = `inline-block rounded-chip px-6 py-[15px] font-body text-sm font-semibold ${VARIANTS[variant]} ${className}`;
  return href ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <button type={type} className={cls}>
      {children}
    </button>
  );
}
