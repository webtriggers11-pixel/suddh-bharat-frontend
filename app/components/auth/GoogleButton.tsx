import { authApi } from "../../lib/api/auth";

/** Starts the backend Google OAuth flow (external nav, so a plain anchor). */
export function GoogleButton() {
  return (
    <a
      href={authApi.googleUrl()}
      className="flex items-center justify-center gap-2.5 rounded-chip border border-line bg-paper px-6 py-3.5 font-body text-sm font-semibold text-ink hover:shadow-card"
    >
      <span aria-hidden className="font-display font-bold text-gold">
        G
      </span>
      Continue with Google
    </a>
  );
}
