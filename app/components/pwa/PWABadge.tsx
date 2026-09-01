"use client";

import { useEffect, useState } from "react";

// Minimal typing for the browser install prompt event (not in lib.dom yet).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA install offer. The Serwist service worker (skipWaiting + clientsClaim)
 * auto-updates, so there is no "reload" prompt to build — this surfaces only the
 * browser's install offer. Tokens only (business/design-system.md). Renders
 * nothing until the browser fires `beforeinstallprompt`.
 */
export function PWABadge() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!installEvent) return null;

  const install = async () => {
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      // A failed/cancelled install is not an app error. The prompt is single-use.
    } finally {
      setInstallEvent(null);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      // bottom offset adds the home-indicator/gesture-bar inset on top of the
      // usual 1rem gap (standalone PWA display, and iOS Safari even in-browser)
      // instead of the badge sitting flush against — or under — that area.
      // Also adds --sticky-atc-height (0 unless StickyAddToCartBar is
      // currently showing on a product page, CHORE-022) so the two fixed
      // bottom surfaces stack instead of overlapping.
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--sticky-atc-height,0px))] left-4 z-20 mx-auto flex max-w-sm flex-col gap-3 rounded-card border border-line bg-paper p-4 text-left shadow-card sm:left-auto"
    >
      <span className="font-body text-base text-ink">
        Install Shuddha on your device.
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={install}
          className="rounded-chip border-2 border-transparent bg-forest px-3 py-1.5 font-body text-sm text-paper hover:border-forest-light"
        >
          Install
        </button>
        <button
          type="button"
          onClick={() => setInstallEvent(null)}
          aria-label="Dismiss"
          className="rounded-chip border-2 border-transparent bg-paper-dim px-3 py-1.5 font-body text-sm text-ink hover:shadow-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
