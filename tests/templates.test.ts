import { describe, expect, it } from "vitest";
import { NICHES } from "@/lib/niches";
import { safeAccent } from "@/lib/portfolio/accent";
import { samplePortfolio } from "@/lib/portfolio/sample";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { PRESET_CONFIG, PRESETS, TEMPLATES, templatesFor } from "@/templates/catalog";

describe("template library", () => {
  it("has 20 templates for every niche", () => {
    for (const n of NICHES) expect(templatesFor(n.slug), n.slug).toHaveLength(20);
  });

  it("uses unique ids that fit the schema", () => {
    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.length).toBeLessThanOrEqual(64);
  });

  it("only uses known presets, each with a config", () => {
    for (const t of TEMPLATES) expect(PRESETS).toContain(t.preset);
    for (const p of PRESETS) expect(PRESET_CONFIG[p]).toBeDefined();
  });

  it("gives every template in a niche its own look", () => {
    for (const n of NICHES) {
      const looks = templatesFor(n.slug).map((t) =>
        [t.preset, t.theme?.mode ?? "light", t.theme?.font ?? "sans", t.theme?.accent ?? "default"].join("|"),
      );
      expect(new Set(looks).size, n.slug).toBe(20);
    }
  });

  it("picks accents that pass the contrast guard as designed", () => {
    for (const t of TEMPLATES) {
      const accent = t.theme?.accent;
      if (!accent) continue;
      const mode = t.theme?.mode ?? "light";
      // safeAccent would swap a failing colour for Signal; the design should never rely on that.
      expect(safeAccent(accent, mode), t.id).toBe(accent);
    }
  });

  it("writes concepts without em dashes", () => {
    for (const t of TEMPLATES) expect(t.concept, t.id).not.toMatch(/—/);
  });

  it("builds a valid sample portfolio for every template", () => {
    for (const t of TEMPLATES.filter((x) => x.niche !== "all")) {
      expect(portfolioSchema.safeParse(samplePortfolio(t.niche, t.id)).success, t.id).toBe(true);
    }
  });
});
