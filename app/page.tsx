import type { Metadata } from "next";
import { pageMetadata } from "./lib/seo";
import { organizationGraph } from "./lib/jsonld";
import { SiteHeader } from "./components/home/SiteHeader";
import { Hero } from "./components/home/Hero";
import { TrustLedger } from "./components/home/TrustLedger";
import { CategoryShelf } from "./components/home/CategoryShelf";
import { FeaturedProducts } from "./components/home/FeaturedProducts";
import { WhyBand } from "./components/home/WhyBand";
import { VerificationSteps } from "./components/home/VerificationSteps";
import { FeaturedBrands } from "./components/home/FeaturedBrands";
import { Newsletter } from "./components/home/Newsletter";
import { SiteFooter } from "./components/home/SiteFooter";
import { PWABadge } from "./components/pwa/PWABadge";
import { JsonLd } from "./components/seo/JsonLd";

// SEO is data-driven from app/config/seo.json (see app/lib/seo.ts).
export const metadata: Metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <TrustLedger />
        <CategoryShelf />
        <FeaturedProducts />
        <WhyBand />
        <VerificationSteps />
        <FeaturedBrands />
        <Newsletter />
      </main>
      <SiteFooter />
      <PWABadge />
      <JsonLd data={organizationGraph()} />
    </>
  );
}
