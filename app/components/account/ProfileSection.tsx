"use client";

import { useState } from "react";
import { Panel } from "../ui/Panel";
import { InfoRow } from "../ui/InfoRow";
import { StatusPill } from "../ui/StatusPill";
import { Field } from "../ui/Field";
import { Reveal } from "../motion/Reveal";
import { Collapse } from "../motion/Collapse";
import { useAuth } from "../../lib/auth/AuthProvider";
import { authApi } from "../../lib/api/auth";

const PROVIDER_LABEL: Record<string, string> = {
  LOCAL: "Email & password",
  GOOGLE: "Google",
  PHONE: "Phone OTP",
};

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

export function ProfileSection() {
  const { user, getToken, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const openEdit = () => {
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setError(null);
    setEditing(true);
  };

  const save = async () => {
    const token = getToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await authApi.updateProfile(token, {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setUser(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Reveal>
      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold text-ink md:text-2xl">
            Profile
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={openEdit}
              className="font-mono text-[11px] uppercase tracking-wider text-gold hover:text-forest"
            >
              Edit
            </button>
          )}
        </div>

        {saved && (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 font-mono text-xs text-forest"
          >
            Profile updated ✓
          </p>
        )}

        <dl className="mt-4 divide-y divide-line border-y border-line">
          <InfoRow label="Name" value={user.name ?? "—"} />
          <InfoRow
            label="Email"
            value={
              <>
                {user.email ?? "—"}
                {user.email && (
                  <StatusPill tone={user.emailVerified ? "verified" : "pending"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </StatusPill>
                )}
              </>
            }
          />
          <InfoRow
            label="Phone"
            value={
              <>
                {user.phone ?? "—"}
                {user.phone && (
                  <StatusPill tone={user.phoneVerified ? "verified" : "pending"}>
                    {user.phoneVerified ? "Verified" : "Unverified"}
                  </StatusPill>
                )}
              </>
            }
          />
          <InfoRow
            label="Sign-in method"
            value={PROVIDER_LABEL[user.provider] ?? user.provider}
          />
          <InfoRow
            label="Role"
            value={user.roles.map((r) => (
              <StatusPill
                key={r}
                tone={ADMIN_ROLES.includes(r) ? "accent" : "neutral"}
              >
                {r}
              </StatusPill>
            ))}
          />
        </dl>

        <Collapse open={editing} id="profile-edit">
          <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
            <Field
              label="Name"
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label="Phone (10 digits)"
              id="profile-phone"
              value={phone}
              inputMode="numeric"
              onChange={(e) => setPhone(e.target.value)}
              error={error ?? undefined}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                aria-busy={busy}
                className="rounded-chip bg-forest px-6 py-[15px] font-body text-sm font-semibold text-paper disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-chip border border-ink px-6 py-[15px] font-body text-sm font-semibold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </Collapse>
      </Panel>
    </Reveal>
  );
}
