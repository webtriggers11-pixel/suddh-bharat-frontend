"use client";

export type SectionKey = "profile" | "orders" | "addresses";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "orders", label: "Orders" },
  { key: "addresses", label: "Addresses" },
];

/**
 * Account section switcher. Vertical sticky sidebar ≥md, horizontal segmented
 * tab bar <md (mobile-first). Design-system tokens only; keyboard + aria-current.
 */
export function SectionNav({
  active,
  onSelect,
  onSignOut,
}: {
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
  onSignOut: () => void;
}) {
  return (
    <nav aria-label="Account sections">
      {/* Mobile: segmented tab bar */}
      <div className="flex gap-1 rounded-card border border-line p-1 md:hidden">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(s.key)}
            aria-current={active === s.key ? "page" : undefined}
            className={`flex-1 rounded-chip px-3 py-2 font-mono text-[11px] uppercase tracking-wider ${
              active === s.key
                ? "bg-forest text-paper"
                : "text-gray hover:text-forest"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden md:sticky md:top-24 md:block">
        <ul className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => onSelect(s.key)}
                aria-current={active === s.key ? "page" : undefined}
                className={`block w-full rounded-chip border-l-2 px-3 py-2 text-left font-mono text-[12px] uppercase tracking-wider ${
                  active === s.key
                    ? "border-gold bg-paper-dim font-semibold text-forest"
                    : "border-transparent text-gray hover:text-forest"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="font-mono text-[11px] uppercase tracking-wider text-gray hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
