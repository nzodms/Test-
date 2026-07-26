import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const alt = `${brand.name} — ${brand.purpose}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card in the porcelain language: warm canvas, one precise
 * instrument, a single cold accent. No gradient wash, no glow.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#F3F1EB",
          color: "#111210",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
            <g stroke="#111210" strokeWidth="4" strokeLinecap="round">
              <line x1="32" y1="6" x2="32" y2="16" />
              <line x1="32" y1="48" x2="32" y2="58" />
              <line x1="6" y1="32" x2="16" y2="32" />
              <line x1="48" y1="32" x2="58" y2="32" />
            </g>
            <circle cx="32" cy="32" r="13" stroke="#111210" strokeWidth="4" />
            <circle cx="32" cy="32" r="4.5" fill="#10666E" />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>
            {brand.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 600,
              letterSpacing: -2.2,
              lineHeight: 1.08,
              maxWidth: 900,
            }}
          >
            {brand.purpose}
          </div>
          <div style={{ fontSize: 25, color: "#6E706B", maxWidth: 820 }}>
            Detect republished content across indexed public sources,
            monitor it, and request removal.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 19,
            color: "#6E706B",
            borderTop: "1px solid rgba(17,18,16,0.12)",
            paddingTop: 22,
          }}
        >
          <span>Public sources only</span>
          <span>·</span>
          <span>Ownership verification required</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
