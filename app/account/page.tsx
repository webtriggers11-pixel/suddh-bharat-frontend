"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";
import { SiteHeader } from "../components/home/SiteHeader";
import { Container } from "../components/ui/Container";
import { AccountShell } from "./AccountShell";
import { SkeletonBlock, SkeletonLines } from "../components/ui/Skeleton";

function LoadingShell() {
  return (
    <>
      <SiteHeader />
      <Container className="py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
          <SkeletonBlock className="h-48 w-full rounded-card" />
          <SkeletonLines
            widths={["h-6 w-1/3", "h-4 w-2/3", "h-4 w-1/2", "h-4 w-3/5"]}
          />
        </div>
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
