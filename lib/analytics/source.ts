export const SOURCES = ["direct", "whatsapp", "linkedin", "x", "instagram", "facebook", "google", "other"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABEL: Record<Source, string> = {
  direct: "Direct or copied link",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  other: "Other sites",
};

/** Buckets a referrer (and ?ref= / utm_source) into a source. */
export function classifySource(referrer: string | null | undefined, ref?: string | null): Source {
  const hint = (ref ?? "").toLowerCase();
  if (hint) {
    if (hint.includes("whatsapp") || hint === "wa") return "whatsapp";
    if (hint.includes("linkedin")) return "linkedin";
    if (hint === "x" || hint.includes("twitter")) return "x";
    if (hint.includes("instagram") || hint === "ig") return "instagram";
    if (hint.includes("facebook") || hint === "fb") return "facebook";
  }
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (host.includes("whatsapp") || host === "wa.me") return "whatsapp";
  if (host.includes("linkedin") || host === "lnkd.in") return "linkedin";
  if (host === "t.co" || host.endsWith("twitter.com") || host === "x.com") return "x";
  if (host.includes("instagram")) return "instagram";
  if (host.includes("facebook") || host === "fb.me" || host === "l.facebook.com") return "facebook";
  if (/(^|\.)google\./.test(host)) return "google";
  return "other";
}
