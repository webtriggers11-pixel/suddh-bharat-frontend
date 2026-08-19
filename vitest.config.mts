import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest for the Next.js frontend — client components/hooks only (RSC are covered
// by the build). See ADR-0003 (test runner) + ADR-0007 (Next.js).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
});
