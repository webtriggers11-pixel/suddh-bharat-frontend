import { Suspense } from "react";
import Link from "next/link";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../motion/Reveal";
import { Tappable } from "../motion/Tappable";
import { SkeletonBlock } from "../ui/Skeleton";
import { catalogApi, type Category } from "../../lib/api/catalog";
import { CATEGORY_EDITORIAL, CATEGORY_SHELF, type CategoryTone } from "./content";

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
export function toneFor(i: number): CategoryTone {
  if (i === 0) return "dark";
  return i % 2 === 1 ? "light" : "gold";
}

export interface Tile {
  slug: string;
  /** Position in the grid, used for both the label and the span. */
  position: number;
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
export function toTile(category: Category, i: number): Tile {
  const editorial = CATEGORY_EDITORIAL[category.slug];
  return {
    slug: category.slug,
    position: i,
    index: `${String(i + 1).padStart(2, "0")} / ${category.name.toUpperCase()}`,
    title: editorial?.title ?? category.name,
    copy: category.description ?? editorial?.copy ?? "",
    tone: toneFor(i),
    featured: i === 0,
  };
}

/** The featured tile is double-height; a trailing odd tile spans the full row
 * so an even-length grid doesn't end with a hole. */
export function gridSpan(tile: Tile, total: number): string {
  if (tile.featured) return "lg:row-span-2";
  if (total % 2 === 0 && tile.position === total - 1) return "lg:col-span-2";
  return "";
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

/** Design-system Rule 5: a section that awaits data ships a Skeleton, so the
 * homepage streams instead of blocking on the catalogue. Mirrors the real
 * grid's shape (one tall tile + stacked tiles). */
function ShelfSkeleton() {
  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-2">
      <SkeletonBlock className="min-h-[280px] rounded-card lg:row-span-2 lg:min-h-[560px]" />
      <SkeletonBlock className="min-h-[220px] rounded-card" />
      <SkeletonBlock className="min-h-[220px] rounded-card" />
    </div>
  );
}

async function ShelfGrid() {
  const categories = await catalogApi.categories();
  if (categories.length === 0) return null;
  const tiles = categories.map(toTile);

  return (
    <>
      <SectionHeading eyebrow={CATEGORY_SHELF.eyebrow}>
        {CATEGORY_SHELF.headline(tiles.length)}
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
    </>
  );
}

export function CategoryShelf() {
  return (
    <Container as="section" id="categories" className="py-20 md:py-24">
      <Suspense fallback={<ShelfSkeleton />}>
        <ShelfGrid />
      </Suspense>
    </Container>
  );
}
