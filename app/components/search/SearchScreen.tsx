"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "../shop/SearchBar";
import { Container } from "../ui/Container";
import { ArrowLeftIcon } from "../ui/icons";

/**
 * Full-page phone search (nykaa.com pattern) — reached by tapping the header's
 * mobile-only search icon. Reuses `SearchBar`'s existing autocomplete/submit
 * logic; this screen only supplies the back control + full-height chrome.
 */
export function SearchScreen() {
  const router = useRouter();

  // /search is a real, routable, deep-linkable page (bookmark, share, PWA
  // shortcut) — not only reachable via the header's search icon. router.back()
  // with no prior in-app history entry either no-ops or exits the app, which is
  // worse in the installed PWA (no browser chrome back button to recover with).
  // Fall back to a safe in-app destination when there's nothing to pop.
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/shop");
  };

  return (
    <div className="min-h-dvh bg-paper pt-safe-top">
      <Container className="flex items-center gap-3 border-b border-line py-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="grid h-9 w-9 shrink-0 place-items-center text-ink hover:text-forest"
        >
          <ArrowLeftIcon />
        </button>
        <SearchBar className="flex-1" autoFocus />
      </Container>
    </div>
  );
}
