"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";
import { SiteHeader } from "../components/home/SiteHeader";
import { Container } from "../components/ui/Container";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

/** Protected account page — redirects to /login when signed out. Shows RBAC UI. */
export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <>
        <SiteHeader />
        <Container className="py-24">
          <p className="font-mono text-sm text-gray">Loading…</p>
        </Container>
      </>
    );
  }

  const isAdmin = user.roles.some((r) => ADMIN_ROLES.includes(r));

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-16 md:py-20">
          <p className="font-mono text-xs uppercase tracking-wide text-gold">Account</p>
          <h1 className="mt-3 font-display text-[clamp(28px,3.4vw,40px)] font-semibold">
            {user.name ?? user.email ?? user.phone}
          </h1>

          <dl className="mt-8 max-w-md divide-y divide-line border-y border-line">
            {[
              ["Email", user.email ?? "—"],
              ["Phone", user.phone ?? "—"],
              ["Roles", user.roles.join(", ")],
              ["Sign-in", user.provider],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3.5">
                <dt className="font-mono text-[12.5px] uppercase tracking-wide text-gray">
                  {label}
                </dt>
                <dd className="font-body text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {isAdmin && (
            <p className="mt-6 inline-block rounded-chip bg-gold px-4 py-2 font-mono text-xs text-ink">
              Admin access enabled
            </p>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={() => void logout().then(() => router.replace("/"))}
              className="rounded-chip border border-ink px-6 py-3 font-body text-sm font-semibold text-ink"
            >
              Sign out
            </button>
          </div>
        </Container>
      </main>
    </>
  );
}
