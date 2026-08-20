"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";
import { SiteHeader } from "../components/home/SiteHeader";
import { Container } from "../components/ui/Container";
import { AccountShell } from "./AccountShell";

function LoadingShell() {
  return (
    <>
      <SiteHeader />
      <Container className="py-24">
        <p className="font-mono text-sm text-gray">Loading…</p>
      </Container>
    </>
  );
}

/** Protected account dashboard — redirects to /login when signed out. */
export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/account");
  }, [loading, user, router]);

  if (loading || !user) return <LoadingShell />;

  // AccountShell uses useSearchParams — wrap in Suspense per Next 16.
  return (
    <Suspense fallback={<LoadingShell />}>
      <AccountShell />
    </Suspense>
  );
}
