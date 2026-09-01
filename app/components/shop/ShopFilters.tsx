"use client";

import Link from "next/link";
import { useState } from "react";
import { Collapse } from "../motion/Collapse";
import type { Category } from "../../lib/api/catalog";

type Sort = "newest" | "price_asc" | "price_desc";

const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price — low to high" },
  { key: "price_desc", label: "Price — high to low" },
];

function href(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/shop?${s}` : "/shop";
}

function rowCls(active: boolean): string {
  return [
    "flex items-center gap-2.5 py-1.5 font-body text-sm transition-colors duration-200",
    active ? "font-semibold text-forest" : "text-gray hover:text-forest",
  ].join(" ");
}

/** Vertical gold tick that marks the active row. */
function Tick({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`h-3.5 w-0.5 shrink-0 rounded-full transition-colors duration-200 ${active ? "bg-gold" : "bg-transparent"}`}
    />
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
        {label}
      </p>
      <ul className="mt-2 flex flex-col">{children}</ul>
    </div>
  );
}

/**
 * Product refinement rail. Sticky vertical sidebar on desktop (right column of
 * the shop grid); a collapsible "Filter & Sort" disclosure on mobile. Link-based
 * navigation (no data fetching here) — design-system tokens only.
 */
export function ShopFilters({
  categories,
  activeCategory,
  activeSort,
  total,
  className = "",
}: {
  categories: Category[];
  activeCategory?: string;
  activeSort?: string;
  total?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const sort = activeSort && activeSort !== "newest" ? activeSort : undefined;
  const activeSortKey = (activeSort ?? "newest") as Sort;
  const filtersActive = Boolean(activeCategory) || Boolean(sort);

  const panel = (
    <div className="flex flex-col gap-7">
      <Group label="Category">
        <li>
          <Link href={href({ sort })} className={rowCls(!activeCategory)}>
            <Tick active={!activeCategory} />
            All products
          </Link>
        </li>
        {categories.map((c) => {
          const active = activeCategory === c.slug;
          return (
            <li key={c.id}>
              <Link
                href={href({ category: c.slug, sort })}
                className={rowCls(active)}
              >
                <Tick active={active} />
                {c.name}
              </Link>
            </li>
          );
        })}
      </Group>

      <Group label="Sort">
        {SORTS.map((s) => {
          const active = activeSortKey === s.key;
          return (
            <li key={s.key}>
              <Link
                href={href({
                  category: activeCategory,
                  sort: s.key === "newest" ? undefined : s.key,
                })}
                className={rowCls(active)}
              >
                <Tick active={active} />
                {s.label}
              </Link>
            </li>
          );
        })}
      </Group>

      {filtersActive && (
        <Link
          href="/shop"
          className="self-start font-mono text-[11px] uppercase tracking-wider text-gray underline underline-offset-4 hover:text-forest"
        >
          Clear filters
        </Link>
      )}
    </div>
  );

  return (
    <aside className={className} aria-label="Product filters">
      {/* Mobile: sticky collapsible disclosure */}
      <div className="sticky top-[76px] z-30 -mx-5 bg-paper/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="shop-filters"
          className="flex w-full items-center justify-between rounded-chip border border-ink px-4 py-3 font-mono text-xs uppercase tracking-wider text-ink"
        >
          <span>
            Filter &amp; Sort
            {filtersActive && <span className="ml-2 text-gold">• active</span>}
          </span>
          <span aria-hidden className="text-lg leading-none">
            {open ? "−" : "+"}
          </span>
        </button>
        <Collapse open={open} id="shop-filters">
          <div className="rounded-card border border-line bg-paper-dim p-5 pt-5 mt-3">
            {panel}
          </div>
        </Collapse>
      </div>

      {/* Desktop: sticky vertical rail */}
      <div className="sticky top-[100px] hidden lg:block">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-gold">
            Refine
          </p>
          {typeof total === "number" && (
            <p className="font-mono text-[11px] uppercase tracking-wider text-gray">
              {total} {total === 1 ? "item" : "items"}
            </p>
          )}
        </div>
        <div className="pt-5">{panel}</div>
      </div>
    </aside>
  );
}
