"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "../motion/tokens";

/**
 * The Shuddha verification seal — the brand's hero motif (from the reference
 * layout). Colors use design-system CSS variables, not raw hex.
 *
 * Motion (ADR-0009): a calm scale-in on load, then the outer mono ring-text
 * rotates slowly and forever while the center disc stays fixed and upright — the
 * classic "spinning seal". Reduced-motion-first: under `prefers-reduced-motion`
 * the entrance and the rotation both no-op, leaving the static seal.
 *
 * The two symmetric outer rings live INSIDE the rotating group on purpose: they
 * anchor the group's bounding box to a true circle centered on (150,150), so
 * `transform-box: fill-box` spins it dead-center with no wobble (rotating a
 * perfect circle is visually invisible).
 */

// One slow revolution — ambient, not an "enter", so it lives outside the tokens.
const RING_SECONDS = 44;

export function VerificationStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 300 300"
      role="img"
      aria-label="Shuddha verified seal — checked and clean"
      className="w-[min(320px,80%)]"
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
    >
      <defs>
        <path
          id="stamp-ring"
          d="M 150,150 m -120,0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
        />
      </defs>

      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { duration: RING_SECONDS, ease: "linear", repeat: Infinity }
        }
      >
        <circle
          cx="150"
          cy="150"
          r="145"
          fill="none"
          stroke="var(--color-forest)"
          strokeWidth="1.5"
        />
        <circle
          cx="150"
          cy="150"
          r="118"
          fill="none"
          stroke="var(--color-forest)"
          strokeWidth="1"
        />
        <text
          fontFamily="var(--font-ibm-plex-mono)"
          fontSize="12.5"
          fill="var(--color-forest)"
          letterSpacing="3"
        >
          <textPath href="#stamp-ring" startOffset="2%">
            SHUDDHA VERIFIED · FOOD · BABY · BEAUTY · CLOTHING ·
          </textPath>
        </text>
      </motion.g>

      <circle cx="150" cy="150" r="82" fill="var(--color-forest)" />
      <text
        x="150"
        y="142"
        textAnchor="middle"
        fontFamily="var(--font-fraunces)"
        fontWeight="600"
        fontSize="34"
        fill="var(--color-paper)"
      >
        शुद्ध
      </text>
      <text
        x="150"
        y="170"
        textAnchor="middle"
        fontFamily="var(--font-ibm-plex-mono)"
        fontSize="11"
        letterSpacing="2"
        fill="var(--color-gold)"
      >
        CHECKED · CLEAN
      </text>
    </motion.svg>
  );
}
