import type { ElementType, ReactNode } from "react";

/**
 * The repeated card surface (white, thin line border, 4px radius). `active`
 * swaps the border to forest. Design-system tokens only. Server Component.
 */
export function Panel({
  as: Tag = "div",
  tone = "default",
  className = "",
  children,
}: {
  as?: ElementType;
  tone?: "default" | "active";
  className?: string;
  children: ReactNode;
}) {
  const border = tone === "active" ? "border-forest" : "border-line";
  return (
    <Tag
      className={`rounded-card border ${border} bg-white p-5 md:p-6 ${className}`}
    >
      {children}
    </Tag>
  );
}
