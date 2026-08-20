// Motion tokens — one source of truth for durations & easing (ADR-0009).
// Mirrors the "calm, crisp" feel of the design system; keep animations subtle.
export const EASE = [0.22, 1, 0.36, 1] as const; // easeOutQuint-ish

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
} as const;

export const OFFSET = 12; // default enter/reveal travel (px)
