import type { NicheSlug } from "@/lib/niches";
import type { Theme } from "@/lib/portfolio/schema";

/**
 * Template catalog. A template is data: a name, a concept, a base preset
 * (layout + section variants) and theme defaults. The renderer and editor
 * never change when a template is added.
 *
 * Phase 5 ships the engine, 5 presets and the full 20-template set for
 * UI/UX Design. Phase 7 fills every niche to 20 (concepts are in
 * docs/research/*.md) and adds presets where a concept needs a new layout.
 */
export const PRESETS = ["stack", "sidebar", "split", "index", "dark-editorial"] as const;
export type PresetId = (typeof PRESETS)[number];

export type TemplateDef = {
  id: string;
  niche: NicheSlug | "all";
  name: string;
  concept: string;
  preset: PresetId;
  theme?: Partial<Theme>;
};

const uiux = (id: string, name: string, concept: string, preset: PresetId, theme?: Partial<Theme>): TemplateDef => ({
  id: `ui-ux-design/${id}`,
  niche: "ui-ux-design",
  name,
  concept,
  preset,
  theme,
});

export const TEMPLATES: TemplateDef[] = [
  // Cross-niche base set, used by every niche until Phase 7 fills its own 20.
  { id: "base/stack", niche: "all", name: "Brief", concept: "Calm single column, work first.", preset: "stack" },
  { id: "base/sidebar", niche: "all", name: "Ledger", concept: "Sticky profile on the left, work on the right.", preset: "sidebar" },
  { id: "base/split", niche: "all", name: "Paper", concept: "Portrait beside the headline, serif display.", preset: "split", theme: { font: "serif" } },
  { id: "base/index", niche: "all", name: "Index", concept: "Text-first project index, fast on any network.", preset: "index" },
  { id: "base/dark", niche: "all", name: "Night", concept: "Dark editorial with numbered sections.", preset: "dark-editorial", theme: { mode: "dark" } },

  // UI/UX Design: the 20 concepts from docs/research/ui-ux-design.md
  uiux("brief", "Brief", "Process-forward single column for juniors.", "stack"),
  uiux("outcome", "Outcome", "Cards lead with the result line.", "stack"),
  uiux("question", "Question", "Projects titled as user questions.", "stack", { font: "serif" }),
  uiux("ledger", "Ledger", "Sticky profile left, work right.", "sidebar"),
  uiux("grid", "Grid", "Image-first grid for large bodies of work.", "split"),
  uiux("studio", "Studio", "Freelance: services, booking, testimonials.", "stack", { accent: "#1F9D6B" }),
  uiux("narrative", "Narrative", "Career-change story up top.", "split", { font: "serif" }),
  uiux("frame", "Frame", "Projects in device frames on tinted backdrops.", "split"),
  uiux("index", "Index", "Text-only index with hover previews.", "index"),
  uiux("stack", "Stack", "For design-system work.", "sidebar", { font: "mono" }),
  uiux("signal-dark", "Signal Dark", "Dark editorial, numbered sections.", "dark-editorial", { mode: "dark" }),
  uiux("paper", "Paper", "Warm paper, serif display, portrait card.", "split", { font: "serif" }),
  uiux("mobile-first", "Mobile First", "Phone-screen project cards.", "stack"),
  uiux("bento", "Bento", "Tiled intro, status, skills and contact.", "sidebar"),
  uiux("before-after", "Before / After", "Redesign comparisons as card visuals.", "stack"),
  uiux("research-lite", "Research Lite", "Key insight as a pull-quote per project.", "stack", { font: "serif" }),
  uiux("resume", "Résumé", "Recruiter-first: experience near the top.", "index"),
  uiux("lagos", "Lagos", "WhatsApp-first contact, light page weight.", "stack", { accent: "#1F9D6B" }),
  uiux("ask-me", "Ask Me", "Q&A built from the portfolio data.", "sidebar"),
  uiux("minimal", "Minimal", "Name, one line, links, big images.", "index"),
];

export function templatesFor(niche: string): TemplateDef[] {
  const own = TEMPLATES.filter((t) => t.niche === niche);
  return own.length > 0 ? own : TEMPLATES.filter((t) => t.niche === "all");
}

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}
