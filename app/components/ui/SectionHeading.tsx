import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

/** Eyebrow + section title block. `id` lands on the <h2> for aria-labelledby. */
export function SectionHeading({
  eyebrow,
  id,
  children,
}: {
  eyebrow: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-3.5 font-display text-[clamp(28px,3.4vw,40px)] font-semibold leading-tight"
      >
        {children}
      </h2>
    </div>
  );
}
