import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../components/auth/AuthShell";
import { PasswordForm } from "../components/auth/PasswordForm";
import { GoogleButton } from "../components/auth/GoogleButton";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Shuddha — clean, verified brands."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest">
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <PasswordForm mode="register" />
        <div className="flex items-center gap-3 text-gray">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[11px] uppercase">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <GoogleButton />
      </div>
    </AuthShell>
  );
}
