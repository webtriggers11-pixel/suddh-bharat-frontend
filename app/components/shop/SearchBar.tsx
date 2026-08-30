"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSuggestions,
  formatINR,
  type SuggestResult,
} from "../../lib/api/catalog";
import { SearchIcon } from "../ui/icons";

const EMPTY: SuggestResult = { products: [], suggestions: [] };

/**
 * Storefront search with live autocomplete (Amazon-style, on Shuddha tokens).
 * Suggestions come from the backend `suggest` mode via TanStack Query — keyed by
 * the debounced term, so identical terms are cached/deduped automatically. Enter
 * or the search button routes to /shop?search=.
 */
export function SearchBar({
  className = "",
  autoFocus = false,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  // Debounce the term the query is keyed on.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const { data } = useQuery({
    queryKey: ["suggest", debounced],
    queryFn: () => fetchSuggestions(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });
  const res = data ?? EMPTY;

  // Flatten suggestions + products into one navigable option list.
  type Option =
    | { kind: "suggest"; label: string }
    | { kind: "product"; id: string; label: string; slug: string; priceMinor?: number };
  const options: Option[] = [
    ...res.suggestions.map((s) => ({ kind: "suggest" as const, label: s })),
    ...res.products.map((p) => ({
      kind: "product" as const,
      id: p.id,
      label: p.name,
      slug: p.slug,
      priceMinor: p.priceMinor,
    })),
  ];
  const [active, setActive] = useState(-1);

  // Reset the active option whenever the option set changes (deferred so no
  // setState runs synchronously in the effect body).
  useEffect(() => {
    queueMicrotask(() => setActive(-1));
  }, [debounced, data]);

  // Close when clicking outside.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (opt: Option) => {
    setOpen(false);
    if (opt.kind === "product") router.push(`/product/${opt.slug}`);
    else submit(opt.label);
  };

  const submit = (term: string) => {
    const t = term.trim();
    setOpen(false);
    router.push(t ? `/shop?search=${encodeURIComponent(t)}` : "/shop");
  };

  const hasSuggestions = open && options.length > 0;
  const optId = (i: number) => `${listId}-opt-${i}`;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!hasSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(options[active]);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="flex items-stretch overflow-hidden rounded-chip border border-line bg-white focus-within:border-forest"
      >
        <input
          type="text"
          role="combobox"
          aria-expanded={hasSuggestions}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? optId(active) : undefined
          }
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search clean products…"
          aria-label="Search products"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-body text-sm text-ink placeholder:text-gray focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="grid place-items-center bg-forest px-4 text-paper transition-colors hover:bg-forest-light"
        >
          <SearchIcon />
        </button>
      </form>

      {hasSuggestions && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-card border border-line bg-white py-1 shadow-card"
        >
          {options.map((opt, i) => {
            const isActive = i === active;
            const border =
              opt.kind === "product" &&
              i > 0 &&
              options[i - 1].kind === "suggest"
                ? "border-t border-line"
                : "";
            return (
              <button
                key={opt.kind === "product" ? opt.id : `s-${opt.label}`}
                id={optId(i)}
                type="button"
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(opt)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left font-body text-sm text-ink ${border} ${
                  isActive ? "bg-paper-dim" : "hover:bg-paper-dim"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.kind === "product" &&
                  typeof opt.priceMinor === "number" && (
                    <span className="shrink-0 font-semibold text-forest">
                      {formatINR(opt.priceMinor)}
                    </span>
                  )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
