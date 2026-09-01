"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { SectionNav, type SectionKey } from "../components/account/SectionNav";
import { ProfileSection } from "../components/account/ProfileSection";
import { OrdersSection } from "../components/account/OrdersSection";
import { AddressesSection } from "../components/account/AddressesSection";
import { useAuth } from "../lib/auth/AuthProvider";

/** Account dashboard layout: sticky section nav + the active section. Reads the
 *  active section from `?tab=` so it is shareable and back-button friendly. */
export function AccountShell() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const tab = params.get("tab");
  const active: SectionKey =
    tab === "orders" || tab === "addresses" ? tab : "profile";

  const select = (key: SectionKey) =>
    router.replace(key === "profile" ? "/account" : `/account?tab=${key}`, {
      scroll: false,
    });

  const signOut = () => void logout().then(() => router.replace("/"));

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <PageHero
          eyebrow="Account"
          title={user?.name ?? user?.email ?? "Your account"}
          intro="Manage your profile, orders and saved addresses."
        />
        <Container className="py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
            <SectionNav active={active} onSelect={select} onSignOut={signOut} />
            <div className="min-w-0">
              {active === "profile" && <ProfileSection />}
              {active === "orders" && <OrdersSection />}
              {active === "addresses" && <AddressesSection />}

              {/* Mobile sign-out (the sidebar's sign-out is desktop-only). */}
              <button
                type="button"
                onClick={signOut}
                className="mt-10 rounded-chip border border-ink px-6 py-3 font-body text-sm font-semibold text-ink md:hidden"
              >
                Sign out
              </button>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
