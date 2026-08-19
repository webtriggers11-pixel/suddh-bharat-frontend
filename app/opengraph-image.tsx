import { ImageResponse } from "next/og";
import { site } from "./lib/seo";

// Auto-wires og:image + twitter:image for all routes. Colors mirror the
// design-system tokens (raw hex is unavoidable in the Satori rasterizer, which
// can't read CSS variables — same exception as the manifest theme colors).
export const alt = "Shuddha — clean, verified brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1b3a2f",
          color: "#fafaf7",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 9999, background: "#b8862e" }} />
          <div style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 940 }}>
          {site.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#8fae97", maxWidth: 900 }}>
          India&apos;s curated marketplace for clean, verified brands.
        </div>
      </div>
    ),
    size,
  );
}
