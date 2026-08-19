import type { ElementType, ReactNode } from "react";

/** Centered max-width content column (design-system: 1200px, mobile-first padding). */
export function Container({
  as: Tag = "div",
  id,
  className = "",
  children,
}: {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
