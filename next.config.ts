import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Installable PWA via Serwist (App Router). SW disabled in dev to avoid stale
// caches; active in production build/preview. See ADR-0007.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
