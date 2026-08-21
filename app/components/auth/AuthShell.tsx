import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Centered auth card layout, reused by login/register. No site header/nav — a
 * focused sign-in surface — just the brand wordmark linking home. Tokens only.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-paper-dim px-5 py-16">
      <Link
        href="/"
        aria-label="Shuddha — home"
        className="mb-8 font-display text-[22px] font-semibold tracking-tight text-ink"
      >
        SHUDDHA<span className="text-gold">.</span>
      </Link>

      <div className="w-full max-w-md rounded-card border border-line bg-paper p-8 sm:p-10">
        <h1 className="font-display text-[28px] font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 font-body text-sm text-gray">{subtitle}</p>}
        <div className="mt-7">{children}</div>
        {footer && (
          <div className="mt-6 border-t border-line pt-5 font-body text-sm text-gray">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
