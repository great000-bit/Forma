/**
 * Accent guardrail: users can pick any accent, but text and buttons must stay
 * readable (WCAG AA, 3:1 for large text and UI). If the colour fails against
 * the page background, fall back to Signal.
 */
const FALLBACK = { light: "#5B4DFF", dark: "#7A6EFF" } as const;
const BACKGROUND = { light: "#F7F6F3", dark: "#0E0E10" } as const;

function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function safeAccent(accent: string, mode: "light" | "dark"): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(accent)) return FALLBACK[mode];
  return contrastRatio(accent, BACKGROUND[mode]) >= 3 ? accent : FALLBACK[mode];
}

/** Text colour to place on top of the accent (buttons). */
export function onAccent(accent: string): string {
  return contrastRatio(accent, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#0E0E10";
}
