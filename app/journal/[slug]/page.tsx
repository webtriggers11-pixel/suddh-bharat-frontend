import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "../../components/home/SiteHeader";
import { SiteFooter } from "../../components/home/SiteFooter";
import { PWABadge } from "../../components/pwa/PWABadge";
import { Container } from "../../components/ui/Container";
import { Eyebrow } from "../../components/ui/Eyebrow";
import { articleJsonLd, breadcrumbJsonLd } from "../../lib/jsonld";
import { JsonLd } from "../../components/seo/JsonLd";
import { ARTICLES, getArticle, formatArticleDate } from "../content";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: `${article.title} — Shuddha Journal`,
    description: article.excerpt,
  };
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="py-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-gray"
          >
            <Link href="/journal" className="text-gold hover:text-forest">
              Journal
            </Link>
            <span aria-hidden className="text-line">
              /
            </span>
            <span className="min-w-0 truncate text-gray">{article.title}</span>
          </nav>
        </Container>

        <article>
          <Container className="pb-20 md:pb-24">
            <div className="mx-auto max-w-[680px]">
              <header className="border-b border-line pb-8">
                <Eyebrow>{article.eyebrow}</Eyebrow>
                <h1 className="mt-4 font-display text-[clamp(30px,4.4vw,44px)] font-semibold leading-[1.1] text-ink">
                  {article.title}
                </h1>
                <p className="mt-4 font-mono text-xs tracking-wide text-gray">
                  {formatArticleDate(article.publishedAt)}
                </p>
              </header>

              <div className="mt-9 flex flex-col gap-5">
                {article.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-body text-[17px] leading-relaxed text-gray"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </article>
      </main>
      <SiteFooter />
      <PWABadge />
      <JsonLd data={articleJsonLd(article)} />
      {/* Matches the two crumbs the page renders above. */}
      <JsonLd
        data={breadcrumbJsonLd(`/journal/${article.slug}`, [
          { name: "Journal", path: "/journal" },
          { name: article.title },
        ])}
      />
    </>
  );
}
