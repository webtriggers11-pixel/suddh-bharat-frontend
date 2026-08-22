"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";
import { ApiError } from "../../lib/api/auth";
import { Field } from "../ui/Field";

/** Only allow same-site relative paths as a post-login destination (no open redirect). */
function safeDest(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

/** The ?redirect= / ?next= destination, read from the live URL (no useSearchParams
 *  → avoids a Suspense/CSR-bailout requirement on the login page). */
function redirectDest(): string {
  if (typeof window === "undefined") return "/account";
  const p = new URLSearchParams(window.location.search);
  return safeDest(p.get("redirect") ?? p.get("next"));
}

/** Email + password sign-in / sign-up form. */
export function PasswordForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "register") await register(email, password, name || undefined);
      else await login(email, password);
      // Return to wherever the shopper came from, else /account.
      router.push(redirectDest());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {mode === "register" && (
        <Field
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Your name"
        />
      )}
      <Field
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <Field
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        placeholder="••••••••"
        required
      />
      {error && (
        <p role="alert" className="font-mono text-xs text-gold">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="rounded-chip bg-forest px-6 py-3.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
      >
        {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
