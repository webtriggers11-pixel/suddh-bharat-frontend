import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { VendorHero } from "../components/sell/VendorHero";
import { FeatureGrid } from "../components/sell/FeatureGrid";
import { AskAndTerms } from "../components/sell/AskAndTerms";
import { ApplyForm } from "../components/sell/ApplyForm";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { PWABadge } from "../components/pwa/PWABadge";

export const metadata: Metadata = pageMetadata("sell");

export default function SellPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <VendorHero />
        <FeatureGrid />
        <AskAndTerms />
        <section id="apply" className="border-t border-line bg-paper-dim">
          <Container className="py-20 md:py-24">
            <div className="mx-auto mb-11 max-w-[520px] text-center">
              <Eyebrow>Apply</Eyebrow>
              <h2 className="mt-3.5 font-display text-[clamp(26px,3.2vw,36px)] font-semibold">
                Tell us about your brand
              </h2>
            </div>
            <ApplyForm />
          </Container>
        </section>
      </main>
      <SiteFooter />
      <PWABadge />
    </>
  );
}
