"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE, OFFSET } from "./tokens";

/**
 * Reveal children on scroll-into-view (once). Optional stagger `delay`.
 * Instant when the user prefers reduced motion. Keep to hero/section content —
 * don't wrap tiny elements.
 */
export function Reveal({
  children,
  delay = 0,
  y = OFFSET,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}
