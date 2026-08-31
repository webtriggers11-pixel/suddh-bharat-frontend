/**
 * Shared loading-state primitive (CHORE-020). Every screen/section that awaits
 * data renders one of these instead of a bare spinner or "Loading…" text, per
 * business/design-system.md Rule 5. `animate-pulse` is Tailwind's built-in
 * keyframe — already covered by the global `prefers-reduced-motion: reduce`
 * rule in globals.css, so no separate reduced-motion handling is needed here.
 */

/** The same grid classes ProductCard grids use — shared so a real grid and its
 * skeleton can never drift out of sync across breakpoints. */
export const PRODUCT_GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-chip bg-paper-dim ${className}`}
    />
  );
}

/** Product-card-shaped tiles in the same responsive grid as a real product grid. */
export function SkeletonCardGrid({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul
      aria-hidden="true"
      className={`${PRODUCT_GRID_CLASS} ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex flex-col gap-3">
          <SkeletonBlock className="aspect-square w-full rounded-card" />
          <SkeletonBlock className="h-4 w-4/5" />
          <SkeletonBlock className="h-4 w-1/3" />
        </li>
      ))}
    </ul>
  );
}

type ListRowVariant =
  | "order"
  | "order-compact"
  | "address"
  | "cart-line"
  | "review"
  | "search";

const ROW_SHAPE: Record<
  ListRowVariant,
  { thumb: string | null; lines: string[]; gap: string }
> = {
  order: { thumb: "h-14 w-14 shrink-0", lines: ["h-4 w-2/5", "h-3 w-1/4"], gap: "gap-4 py-4" },
  "order-compact": {
    thumb: "h-10 w-10 shrink-0",
    lines: ["h-3.5 w-1/3", "h-3 w-1/5"],
    gap: "gap-3 py-3",
  },
  address: { thumb: null, lines: ["h-4 w-1/3", "h-3 w-3/4", "h-3 w-1/2"], gap: "gap-2 py-4" },
  "cart-line": {
    thumb: "h-20 w-20 shrink-0 rounded-card",
    lines: ["h-4 w-2/5", "h-3 w-1/5", "h-4 w-1/4"],
    gap: "gap-4 py-4",
  },
  review: { thumb: null, lines: ["h-3.5 w-1/4", "h-3 w-full", "h-3 w-4/5"], gap: "gap-2 py-4" },
  search: { thumb: "h-9 w-9 shrink-0", lines: ["h-3.5 w-2/3"], gap: "gap-3 py-2" },
};

/** Stacked row skeletons — orders, addresses, cart lines, reviews, search
 * suggestions. `variant` shapes row height/thumbnail to match the real row. */
export function SkeletonListRows({
  count = 3,
  variant = "order",
  className = "",
}: {
  count?: number;
  variant?: ListRowVariant;
  className?: string;
}) {
  const shape = ROW_SHAPE[variant];
  return (
    <div aria-hidden="true" className={`divide-y divide-line ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex items-center ${shape.gap}`}>
          {shape.thumb && <SkeletonBlock className={shape.thumb} />}
          <div className="flex flex-1 flex-col gap-2">
            {shape.lines.map((w, j) => (
              <SkeletonBlock key={j} className={w} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Plain text-line placeholders for headings/detail blocks. */
export function SkeletonLines({
  widths = ["h-6 w-1/3", "h-4 w-2/3", "h-4 w-1/2"],
  className = "",
}: {
  widths?: string[];
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`flex flex-col gap-3 ${className}`}>
      {widths.map((w, i) => (
        <SkeletonBlock key={i} className={w} />
      ))}
    </div>
  );
}
