// Global "session is no longer valid" channel. Any authenticated backend call
// that comes back 401 (expired/rotated/revoked token) should force the user
// out — clear tokens and bounce to the public home page, Amazon-style. The
// query/mutation caches funnel their 401s here (see QueryProvider); the
// AuthProvider registers the actual logout+redirect handler.
import { ApiError } from "../api/auth";

/** True for a backend 401 (unauthorized) — the only status that forces logout. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

type Handler = () => void;
let handler: Handler | null = null;

/** AuthProvider registers (and on unmount clears) the forced-logout handler. */
export function setUnauthorizedHandler(h: Handler | null): void {
  handler = h;
}

let firing = false;
/**
 * Report an authenticated 401. A burst of parallel requests can all 401 at once
 * (e.g. cart + wishlist + orders after a token is revoked); collapse that wave
 * into a single logout so we don't fight ourselves.
 */
export function reportUnauthorized(): void {
  if (firing || !handler) return;
  firing = true;
  try {
    handler();
  } finally {
    // Release on the next tick so one wave of 401s runs the handler once.
    setTimeout(() => {
      firing = false;
    }, 0);
  }
}
