import Link from "next/link";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../motion/Reveal";
import { Tappable } from "../motion/Tappable";
import { catalogApi, type Category } from "../../lib/api/catalog";
import { CATEGORY_EDITORIAL, type CategoryTone } from "./content";

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

/** The first tile anchors the grid; the rest alternate. */
function toneFor(i: number): CategoryTone {
  if (i === 0) return "dark";
  return i % 2 === 1 ? "light" : "gold";
}

interface Tile {
  slug: string;
  index: string;
  title: string;
  copy: string;
  tone: CategoryTone;
  featured: boolean;
}

/**
 * Catalogue categories as homepage tiles. The DB owns which categories exist,
 * their names and their order; `CATEGORY_EDITORIAL` supplies the brand copy the
 * schema has no column for, and a category's own description overrides it.
 */
function toTile(category: Category, i: number): Tile {
  const editorial = CATEGORY_EDITORIAL[category.slug];
  return {
    slug: category.slug,
    index: `${String(i + 1).padStart(2, "0")} / ${category.name.toUpperCase()}`,
    title: editorial?.title ?? category.name,
    copy: category.description ?? editorial?.copy ?? "",
    tone: toneFor(i),
    featured: i === 0,
  };
}

function CategoryCard({ tile }: { tile: Tile }) {
  const t = TONES[tile.tone];
  const minH = tile.featured
    ? "min-h-[280px] lg:min-h-[560px]"
    : "min-h-[220px]";
  return (
    <Link
      href={`/shop?category=${tile.slug}`}
      className={`flex h-full flex-col justify-end rounded-card p-7 ${t.card} ${minH}`}
    >
      <p className={`mb-2 font-mono text-xs ${t.index}`}>{tile.index}</p>
      <h3 className="font-display text-[26px] font-semibold">{tile.title}</h3>
      {tile.copy && (
        <p className={`mt-2 max-w-xs font-body text-sm leading-relaxed ${t.copy}`}>
          {tile.copy}
        </p>
      )}
    </Link>
  );
}

function gridSpan(tile: Tile, total: number): string {
  if (tile.featured) return "lg:row-span-2";
  // The last tile of an even-length grid would leave a hole — let it span.
  if (total % 2 === 0 && tile.index.startsWith(String(total).padStart(2, "0")))
    return "lg:col-span-2";
  return "";
}

const COUNT_WORDS = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

/** "Four categories." — but honest when the admin adds or removes one. */
function headline(n: number): string {
  const word = COUNT_WORDS[n] ?? String(n);
  return `${word} ${n === 1 ? "category" : "categories"}. One published standard.`;
}

export async function CategoryShelf() {
  const categories = await catalogApi.categories();
  if (categories.length === 0) return null;
  const tiles = categories.map(toTile);

  return (
    <Container as="section" id="categories" className="py-20 md:py-24">
      <SectionHeading eyebrow="Shop by category">
        {headline(tiles.length)}
      </SectionHeading>
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {tiles.map((tile, i) => (
          <Reveal
            key={tile.slug}
            className={gridSpan(tile, tiles.length)}
            delay={i * 0.06}
          >
            <Tappable className="h-full">
              <CategoryCard tile={tile} />
            </Tappable>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
