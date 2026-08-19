/**
 * The Shuddha verification seal — the brand's hero motif (from the reference
 * layout). Colors use design-system CSS variables, not raw hex. Decorative +
 * labelled for assistive tech.
 */
export function VerificationStamp() {
  return (
    <svg
      viewBox="0 0 300 300"
      role="img"
      aria-label="Shuddha verified seal — checked and clean"
      className="w-[min(320px,80%)]"
    >
      <defs>
        <path
          id="stamp-ring"
          d="M 150,150 m -120,0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
        />
      </defs>
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
    </svg>
  );
}
