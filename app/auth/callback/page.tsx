"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";
import { authApi } from "../../lib/api/auth";

/** Receives the Google OAuth redirect (tokens in query), stores the session. */
function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { applyResult } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }
    authApi
      .me(accessToken)
      .then((user) => {
        applyResult({ user, accessToken, refreshToken });
        router.replace("/account");
      })
      .catch(() => router.replace("/login"));
  }, [params, router, applyResult]);

  return <p className="font-mono text-sm text-gray">Signing you in…</p>;
}

export default function CallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-24">
      <Suspense fallback={<p className="font-mono text-sm text-gray">Loading…</p>}>
        <CallbackInner />
      </Suspense>
    </main>
  );
}
