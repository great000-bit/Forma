import { ImageResponse } from "next/og";

export const alt = "Forma: Talk. Watch it build.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori cannot read CSS variables, so brand hex values are used here.
const INK = "#0E0E10";
const PAPER = "#F7F6F3";
const SIGNAL = "#5B4DFF";
const SLATE = "#6B6B76";

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
          padding: 80,
          background: PAPER,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <rect x="5" y="3" width="5" height="18" rx="2.5" fill={INK} />
            <rect x="2" y="9.5" width="13" height="4.5" rx="2.25" fill={INK} />
            <rect x="11.5" y="3" width="8.5" height="4.5" rx="2.25" fill={SIGNAL} />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: -2 }}>forma</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>
            Talk. Watch it build.
          </div>
          <div style={{ fontSize: 34, color: SLATE, maxWidth: 900, lineHeight: 1.35 }}>
            Tell Forma about you and your work. Get a portfolio and one link to share.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
