import Link from "next/link";
import type { Category } from "../../lib/api/catalog";

type Sort = "newest" | "price_asc" | "price_desc";

const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
];

function chip(active: boolean): string {
  return [
    "shrink-0 rounded-chip border px-3 py-1.5 font-mono text-xs tracking-wide transition-colors duration-200",
    active
      ? "border-forest bg-forest text-paper"
      : "border-line bg-white text-ink hover:border-forest hover:text-forest",
  ].join(" ");
}

function href(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/shop?${s}` : "/shop";
}

/**
 * Link-based category + sort filters (server component — no client JS needed).
 * Sticky under the site header; chip rows scroll horizontally on narrow screens
 * so long category lists never wrap awkwardly. Shows the live result count.
 */
export function ShopFilters({
  categories,
  activeCategory,
  activeSort,
  total,
}: {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
  total?: number;
}) {
  const sort = activeSort && activeSort !== "newest" ? activeSort : undefined;

  return (
    <div className="sticky top-[76px] z-30 -mx-5 border-b border-line bg-paper/92 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="mr-1 shrink-0 font-mono text-[11px] uppercase tracking-wider text-gold">
          Category
        </span>
        <Link href={href({ sort })} className={chip(!activeCategory)}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={href({ category: c.slug, sort })}
            className={chip(activeCategory === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="mr-1 shrink-0 font-mono text-[11px] uppercase tracking-wider text-gold">
            Sort
          </span>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={href({
                category: activeCategory,
                sort: s.key === "newest" ? undefined : s.key,
              })}
              className={chip((activeSort ?? "newest") === s.key)}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {typeof total === "number" && (
          <p className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-gray sm:block">
            {total} {total === 1 ? "product" : "products"}
          </p>
        )}
      </div>
    </div>
  );
}
