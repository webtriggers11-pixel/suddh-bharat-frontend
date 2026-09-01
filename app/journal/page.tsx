import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/home/SiteHeader";
import { SiteFooter } from "../components/home/SiteFooter";
import { PWABadge } from "../components/pwa/PWABadge";
import { PageHero } from "../components/ui/PageHero";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ARTICLES, formatArticleDate } from "./content";

export const metadata: Metadata = {
  title: "Journal — Shuddha",
  description:
    "Short reads on Shuddha's verification standard, why clean labels matter in India, and why the marketplace exists.",
};

export default function JournalIndexPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Journal"
          title="Notes on verification, and why it matters."
          intro="Short, plain-language reads on how Shuddha checks the brands here, why a clean label means something different in India, and why we built this in the first place."
        />
        <Container as="section" className="py-16 md:py-20">
          <SectionHeading eyebrow="Latest">All articles</SectionHeading>
          <ul className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article) => (
              <li key={article.slug} className="h-full">
                <Link
                  href={`/journal/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-[box-shadow,border-color] duration-300 hover:border-sage hover:shadow-card"
                >
                  <div
                    aria-hidden
                    className="flex aspect-[16/10] items-center justify-center bg-paper-dim"
                  >
                    <span className="font-mono text-[11px] tracking-wider text-gray">
                      SHUDDHA JOURNAL
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-gold">
                      {article.eyebrow}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-forest">
                      {article.title}
                    </h3>
                    <p className="mt-2.5 font-body text-[13.5px] leading-relaxed text-gray">
                      {article.excerpt}
                    </p>
                    <p className="mt-auto pt-5 font-mono text-[11px] tracking-wide text-gray">
                      {formatArticleDate(article.publishedAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <SiteFooter />
      <PWABadge />
    </>
  );
}
