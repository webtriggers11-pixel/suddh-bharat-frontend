"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION } from "./tokens";

/**
 * Micro-interaction wrapper: subtle lift on hover, press on tap. `display:
 * contents` keeps layout intact; the child element receives the motion. Use on
 * cards / interactive tiles. No-op under reduced motion.
 */
export function Tappable({
  children,
  lift = -3,
  className,
}: {
  children: ReactNode;
  lift?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: DURATION.fast }}
    >
      {children}
    </motion.div>
  );
}
