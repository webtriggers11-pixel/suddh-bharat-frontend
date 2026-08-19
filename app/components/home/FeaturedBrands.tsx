import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { BRANDS } from "./content";

export function FeaturedBrands() {
  return (
    <section className="bg-paper-dim">
      <Container className="py-20 md:py-24">
        <SectionHeading eyebrow="Meet the brands">
          The founders behind the badge
        </SectionHeading>
        <ul className="mt-12 flex gap-4 overflow-x-auto pb-2">
          {BRANDS.map((brand) => (
            <li
              key={brand.mark}
              className="flex-[0_0_260px] rounded-card border border-line bg-paper p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
                {brand.mark}
              </p>
              <h3 className="mt-3.5 font-display text-[19px] font-semibold">
                {brand.name}
              </h3>
              <p className="mt-2.5 font-body text-[13px] italic leading-relaxed text-gray">
                &ldquo;{brand.quote}&rdquo;
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
