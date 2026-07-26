import { ImageResponse } from "next/og";

export const alt = "Halo — Operational intelligence for modern teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          backgroundColor: "#0b0e15",
          backgroundImage:
            "radial-gradient(45% 40% at 68% 18%, rgba(94,207,227,0.18), transparent 70%), radial-gradient(30% 26% at 12% 90%, rgba(238,188,111,0.08), transparent 70%)",
          color: "#e9edf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="14" fill="#10141d" />
            <circle
              cx="32"
              cy="32"
              r="17"
              stroke="#5ECFE3"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="80 27"
              transform="rotate(-58 32 32)"
            />
            <circle cx="45.5" cy="18.5" r="4" fill="#EEBC6F" />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>
            Halo
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Every signal your company emits. One calm place to act.
          </div>
          <div style={{ fontSize: 26, color: "#9aa5ba", maxWidth: 800 }}>
            Signals, risks, opportunities and automations — unified.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
