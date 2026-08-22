"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWishlist } from "../../lib/wishlist/WishlistProvider";
import { Tappable } from "../motion/Tappable";

/** Filled heart when liked, outline when not. Inherits `currentColor`. */
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

/**
 * Like ("wishlist") toggle. `variant="icon"` is the compact heart used as a
 * card overlay (it stops the wrapping <Link> from navigating). `variant="full"`
 * is a labelled button for the product detail page. Signed-out shoppers are
 * routed to /login with a redirect back. State is optimistic via WishlistProvider.
 */
export function LikeButton({
  productId,
  redirectTo,
  variant = "icon",
}: {
  productId: string;
  redirectTo: string;
  variant?: "icon" | "full";
}) {
  const { isLiked, toggle } = useWishlist();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const liked = isLiked(productId);

  const onClick = async (e: React.MouseEvent) => {
    // When rendered inside a card <Link>, don't navigate on heart click.
    e.preventDefault();
    e.stopPropagation();
    // Guests can like too — it's saved to localStorage and merged on login.
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await toggle(productId);
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : "Couldn’t update wishlist";
      // A stale/expired session surfaces here — send them to sign in.
      if (/sign in/i.test(msg)) {
        router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      } else {
        setErr(msg); // announced (and shown, full variant) then auto-clears
        setTimeout(() => setErr(null), 3000);
      }
    } finally {
      setBusy(false);
    }
  };

  const label = liked ? "Remove from wishlist" : "Save to wishlist";

  if (variant === "full") {
    return (
      <div className="flex flex-col gap-1">
        <Tappable lift={0}>
          <button
            type="button"
            onClick={onClick}
            disabled={busy}
            aria-pressed={liked}
            aria-label={label}
            className={`flex items-center gap-2 rounded-chip border px-5 py-3 font-body text-sm font-semibold transition-colors duration-200 disabled:opacity-60 ${
              liked
                ? "border-gold bg-gold-dim/40 text-forest"
                : "border-ink text-ink hover:border-forest hover:text-forest"
            }`}
          >
            <span className={liked ? "text-gold" : ""}>
              <Heart filled={liked} />
            </span>
            {liked ? "Saved" : "Save"}
          </button>
        </Tappable>
        <span role="status" aria-live="polite" className="min-h-4 font-mono text-[11px] text-gold">
          {err}
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={liked}
        aria-label={label}
        title={err ?? label}
        className={`pointer-events-auto grid h-9 w-9 place-items-center rounded-chip border bg-white/90 shadow-sm backdrop-blur transition-colors duration-200 ${
          err
            ? "border-gold text-gold"
            : `border-line hover:border-gold ${liked ? "text-gold" : "text-ink/70 hover:text-forest"}`
        }`}
      >
        <Heart filled={liked} />
      </button>
      {/* Screen-reader announcement for the icon variant (no room for inline text). */}
      <span role="status" aria-live="polite" className="sr-only">
        {err}
      </span>
    </>
  );
}
