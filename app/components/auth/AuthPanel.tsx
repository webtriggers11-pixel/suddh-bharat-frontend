"use client";

import { useState } from "react";
import { PasswordForm } from "./PasswordForm";
import { OtpForm } from "./OtpForm";
import { GoogleButton } from "./GoogleButton";

type Tab = "password" | "phone";

/** Sign-in panel: email/password or phone-OTP tabs, plus Google. */
export function AuthPanel() {
  const [tab, setTab] = useState<Tab>("password");

  const tabCls = (active: boolean) =>
    `flex-1 rounded-chip px-3 py-2 font-mono text-xs uppercase tracking-wide ${
      active ? "bg-forest text-paper" : "bg-paper-dim text-gray"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Sign-in method" className="flex gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          className={tabCls(tab === "password")}
          onClick={() => setTab("password")}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "phone"}
          className={tabCls(tab === "phone")}
          onClick={() => setTab("phone")}
        >
          Phone
        </button>
      </div>

      {tab === "password" ? <PasswordForm mode="login" /> : <OtpForm />}

      <div className="flex items-center gap-3 text-gray">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[11px] uppercase">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton />
    </div>
  );
}
