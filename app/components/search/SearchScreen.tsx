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

  return (
    <div className="min-h-dvh bg-paper pt-[env(safe-area-inset-top)]">
      <Container className="flex items-center gap-3 border-b border-line py-3">
        <button
          type="button"
          onClick={() => router.back()}
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
