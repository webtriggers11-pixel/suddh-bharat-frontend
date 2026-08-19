import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { CATEGORIES, type CategoryTone } from "./content";

const TONES: Record<CategoryTone, { card: string; index: string; copy: string }> = {
  dark: {
    card: "bg-linear-to-br from-forest to-forest-light text-paper",
    index: "text-paper/65",
    copy: "text-paper/85",
  },
  light: {
    card: "bg-paper-dim border border-line text-ink",
    index: "text-gold",
    copy: "text-gray",
  },
  gold: { card: "bg-gold text-ink", index: "text-ink/65", copy: "text-ink/85" },
};

function CategoryCard({ category }: { category: (typeof CATEGORIES)[number] }) {
  const t = TONES[category.tone];
  const wide = category.index.startsWith("04"); // clothing spans full width on lg
  const span = category.featured
    ? "lg:row-span-2 min-h-[280px] lg:min-h-[560px]"
    : wide
      ? "lg:col-span-2 min-h-[220px]"
      : "min-h-[220px]";
  return (
    <article className={`flex flex-col justify-end rounded-card p-7 ${t.card} ${span}`}>
      <p className={`mb-2 font-mono text-xs ${t.index}`}>{category.index}</p>
      <h3 className="font-display text-[26px] font-semibold">{category.title}</h3>
      <p className={`mt-2 max-w-xs font-body text-sm leading-relaxed ${t.copy}`}>
        {category.copy}
      </p>
    </article>
  );
}

export function CategoryShelf() {
  return (
    <Container as="section" id="categories" className="py-20 md:py-24">
      <SectionHeading eyebrow="Shop by category">
        Four categories. One published standard.
      </SectionHeading>
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.index} category={c} />
        ))}
      </div>
    </Container>
  );
}
