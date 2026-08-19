import { Container } from "../ui/Container";
import { STANDARDS } from "./content";

/** Per-category clean-standard blocks: sticky index/label + 2-col ✓ criteria list. */
export function StandardList() {
  return (
    <Container as="section" className="py-16 md:py-20">
      <div className="border-t border-line">
        {STANDARDS.map((block) => (
          <div
            key={block.index}
            className="grid gap-5 border-b border-line py-11 md:grid-cols-[280px_1fr] md:gap-10"
          >
            <div className="flex items-start gap-3.5">
              <span className="mt-1 font-mono text-xs text-gold">{block.index}</span>
              <h2 className="font-display text-2xl font-semibold">{block.category}</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
              {block.criteria.map((c) => (
                <li key={c} className="relative pl-[22px] font-body text-[14.5px] leading-relaxed">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 font-mono font-bold text-forest"
                  >
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  );
}
