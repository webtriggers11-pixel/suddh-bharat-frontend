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
    "rounded-chip border px-3 py-1.5 font-mono text-xs tracking-wide transition-colors",
    active
      ? "border-forest bg-forest text-paper"
      : "border-line bg-white text-ink hover:border-forest",
  ].join(" ");
}

function href(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/shop?${s}` : "/shop";
}

/** Link-based category + sort filters (server component — no client JS needed). */
export function ShopFilters({
  categories,
  activeCategory,
  activeSort,
}: {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
}) {
  const sort = activeSort && activeSort !== "newest" ? activeSort : undefined;

  return (
    <div className="flex flex-col gap-4 border-b border-line py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-gold">
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-gold">
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
    </div>
  );
}
