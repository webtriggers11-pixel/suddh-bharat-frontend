"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "./tokens";

/**
 * Subtle transition between price values on quantity/coupon updates (cart
 * line totals, cart/checkout grand totals) — a brief fade+slide keyed on the
 * formatted value, instead of the number silently snapping to the new
 * amount. Text content only (`formatINR` output), not a layout wrapper, so
 * it drops into an existing `<span>`/`<dd>` without changing structure.
 * Instant under reduced motion.
 */
export function PriceChange({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className={`inline-block ${className ?? ""}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: DURATION.fast, ease: EASE }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}
