import type { ReactNode } from "react";
import { SiteHeader } from "../home/SiteHeader";

/** Centered auth card layout, reused by login/register. */
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
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-paper-dim px-5 py-16">
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
    </>
  );
}
