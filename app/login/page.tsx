import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../components/auth/AuthShell";
import { AuthPanel } from "../components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Shuddha account."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-forest">
            Create an account
          </Link>
        </>
      }
    >
      <AuthPanel />
    </AuthShell>
  );
}
