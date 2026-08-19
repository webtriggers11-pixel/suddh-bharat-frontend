import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";

/** Light page hero: eyebrow + page title + optional intro. Reused across pages. */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-line">
      <Container className="py-16 md:py-[72px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(34px,4.8vw,54px)] font-semibold leading-[1.08]">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl font-body text-[17px] leading-relaxed text-gray">
            {intro}
          </p>
        )}
      </Container>
    </section>
  );
}
