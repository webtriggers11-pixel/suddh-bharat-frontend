import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Installable PWA via Serwist (App Router). See ADR-0007.
const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
});

const nextConfig: NextConfig = {
  images: {
    // Placeholder product imagery until S3 is wired (ADR-0010). Add the S3/CDN
    // host here when real uploads land.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

// In dev the service worker is off anyway, but merely WRAPPING the config
// still installs Serwist's webpack plugin — which pins `next dev` to the
// legacy `--webpack` builder. That builder regenerates the RSC client-
// reference manifest unreliably: adding any component file while the dev
// server runs broke every page with "Element type is invalid. Received a
// promise that resolves to: undefined" until a full rebuild. Skipping the
// wrapper in dev lets `next dev` use Turbopack (Next 16's default) and keeps
// the SW/manifest exactly as before in `next build --webpack`.
export default isDev ? nextConfig : withSerwist(nextConfig);
