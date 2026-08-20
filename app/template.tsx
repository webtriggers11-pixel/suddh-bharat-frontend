import type { ReactNode } from "react";
import { PageTransition } from "./components/motion/PageTransition";

// template.tsx re-mounts on every navigation → PageTransition runs its enter
// animation on each route change (ADR-0009).
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
