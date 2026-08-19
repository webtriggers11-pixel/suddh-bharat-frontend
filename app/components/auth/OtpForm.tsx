"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";
import { authApi, ApiError } from "../../lib/api/auth";
import { Field } from "../ui/Field";

/** Phone → OTP sign-in. Two steps: request a code, then verify it. */
export function OtpForm() {
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await authApi.requestOtp(phone);
      setDevCode(res.devCode ?? null);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyOtp(phone, code);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code");
      setBusy(false);
    }
  };

  if (!sent) {
    return (
      <form onSubmit={requestCode} noValidate className="flex flex-col gap-4">
        <Field
          label="Phone"
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          placeholder="+919812345678"
          required
        />
        {error && <p role="alert" className="font-mono text-xs text-gold">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-chip bg-forest px-6 py-3.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate className="flex flex-col gap-4">
      <p className="font-body text-sm text-gray">
        We sent a code to <span className="text-ink">{phone}</span>.
        {devCode && (
          <>
            {" "}
            <span className="font-mono text-gold">Dev code: {devCode}</span>
          </>
        )}
      </p>
      <Field
        label="Code"
        id="code"
        inputMode="numeric"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
        required
      />
      {error && <p role="alert" className="font-mono text-xs text-gold">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-chip bg-forest px-6 py-3.5 font-body text-sm font-semibold text-paper disabled:opacity-60"
      >
        {busy ? "Verifying…" : "Verify & sign in"}
      </button>
    </form>
  );
}
