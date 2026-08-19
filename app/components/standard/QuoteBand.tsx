import { Container } from "../ui/Container";
import { STANDARD_QUOTE } from "./content";

/** Closing forest pull-quote band with the mini शुद्ध seal. */
export function QuoteBand() {
  return (
    <section className="bg-forest text-paper">
      <Container className="py-20 text-center md:py-24">
        <div
          aria-hidden
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold font-display text-xl font-semibold text-forest"
        >
          श
        </div>
        <blockquote className="mx-auto max-w-3xl font-display text-[clamp(24px,3.4vw,36px)] font-medium italic leading-snug">
          &ldquo;{STANDARD_QUOTE}&rdquo;
        </blockquote>
      </Container>
    </section>
  );
}
