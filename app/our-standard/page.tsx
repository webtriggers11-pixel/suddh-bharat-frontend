import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { PageHero } from "../components/ui/PageHero";
import { StandardList } from "../components/standard/StandardList";
import { VerificationSteps } from "../components/home/VerificationSteps";
import { QuoteBand } from "../components/standard/QuoteBand";
import { PWABadge } from "../components/pwa/PWABadge";

export const metadata: Metadata = pageMetadata("our-standard");

export default function OurStandardPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Our Standard"
          title={'What "clean" actually means on Shuddha.'}
          intro="Anyone can print “natural” on a label. We built Shuddha because that word stopped meaning anything. Every brand here is checked against a published standard, category by category — so you never have to take our word for it blindly."
        />
        <StandardList />
        <VerificationSteps />
        <QuoteBand />
      </main>
      <SiteFooter />
      <PWABadge />
    </>
  );
}
