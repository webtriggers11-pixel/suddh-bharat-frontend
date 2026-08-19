import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { FEATURES } from "./content";

/** "What you get" — 4-up benefit cards. */
export function FeatureGrid() {
  return (
    <Container as="section" className="py-20 md:py-24">
      <SectionHeading eyebrow="What you get">
        A shelf where every visitor is already looking for you
      </SectionHeading>
      <ul className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.index} className="rounded-card border border-line bg-paper-dim p-7">
            <p className="mb-3.5 font-mono text-xs text-gold">{f.index}</p>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 font-body text-[13.5px] leading-relaxed text-gray">{f.copy}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
