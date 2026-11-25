import { describe, expect, it } from "vitest";
import { contrastRatio, safeAccent } from "@/lib/portfolio/accent";
import { applyOps, OpError } from "@/lib/portfolio/ops";
import { emptyPortfolio } from "@/lib/portfolio/schema";
import { parseSectionLine, takeLines } from "@/lib/ai/ndjson";
import { fallbackNext } from "@/lib/ai/interview-fallback";
import { interviewTopics } from "@/lib/portfolio/niche-config";

const base = () => emptyPortfolio("ui-ux-design", "ui-ux-design/brief");

describe("applyOps", () => {
  it("sets a nested field and validates", () => {
    const next = applyOps(base(), [{ op: "set", path: "sections.about.body", value: "I design apps." }]);
    expect(next.sections.about.body).toBe("I design apps.");
  });

  it("inserts into a list", () => {
    const next = applyOps(base(), [
      { op: "insert", path: "sections.projects.items", value: { id: "p1", title: "Ledgerline" } },
    ]);
    expect(next.sections.projects.items[0]?.title).toBe("Ledgerline");
  });

  it("does not mutate the input", () => {
    const p = base();
    applyOps(p, [{ op: "set", path: "sections.about.body", value: "x" }]);
    expect(p.sections.about.body).toBe("");
  });

  it("rejects paths outside sections, layout and theme", () => {
    expect(() => applyOps(base(), [{ op: "set", path: "niche", value: "x" }])).toThrow(OpError);
  });

  it("rejects prototype pollution", () => {
    expect(() => applyOps(base(), [{ op: "set", path: "sections.__proto__.polluted", value: 1 }])).toThrow(OpError);
  });

  it("rejects values that break the schema", () => {
    expect(() => applyOps(base(), [{ op: "set", path: "sections.contact.email", value: "not-an-email" }])).toThrow(OpError);
  });

  it("falls back to Signal for an invalid accent instead of failing", () => {
    const next = applyOps(base(), [{ op: "set", path: "theme.accent", value: "red" }]);
    expect(next.theme.accent).toBe("#5B4DFF");
  });
});

describe("ndjson", () => {
  it("keeps the unfinished tail", () => {
    expect(takeLines('{"a":1}\n{"b"')).toEqual({ lines: ['{"a":1}'], rest: '{"b"' });
  });

  it("parses a valid section line", () => {
    const parsed = parseSectionLine('{"section":"about","data":{"body":"Hi."}}');
    expect(parsed).toEqual({ id: "about", data: { body: "Hi." } });
  });

  it("adds missing project ids", () => {
    const parsed = parseSectionLine('{"section":"projects","data":{"items":[{"title":"Queue"}]}}');
    expect(parsed?.id).toBe("projects");
    expect((parsed?.data as { items: { id: string }[] }).items[0]?.id).toBe("p1");
  });

  it("rejects unknown sections and broken JSON", () => {
    expect(parseSectionLine('{"section":"hacks","data":{}}')).toBeNull();
    expect(parseSectionLine("not json")).toBeNull();
  });
});

describe("interview fallback", () => {
  it("asks topics in order and finishes", () => {
    const topics = interviewTopics("ui-ux-design");
    expect(fallbackNext(topics, [])?.topic).toBe("identity");
    const all = topics.map((t) => ({ topic: t.id, question: t.ask, answer: "x", skipped: false }));
    expect(fallbackNext(topics, all)).toBeNull();
  });

  it("covers every niche with identity, work and contact", () => {
    for (const niche of ["photography", "cybersecurity", "web-development", "other"] as const) {
      const ids = interviewTopics(niche).map((t) => t.id);
      expect(ids).toContain("identity");
      expect(ids).toContain("work");
      expect(ids).toContain("contact");
    }
  });
});

describe("accent guardrail", () => {
  it("keeps readable accents and replaces unreadable ones", () => {
    expect(safeAccent("#1F9D6B", "light")).toBe("#1F9D6B");
    expect(safeAccent("#FFF8E0", "light")).toBe("#5B4DFF");
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
  });
});

import { portfolioUrl, slugify, slugProblem } from "@/lib/portfolio/slug";

describe("slugs", () => {
  it("slugifies names", () => {
    expect(slugify("Amara Okafor")).toBe("amara-okafor");
    expect(slugify("  Émeka  Nwosu!! ")).toBe("emeka-nwosu");
  });
  it("rejects bad and reserved slugs", () => {
    expect(slugProblem("ab")).toBe("Use at least 3 characters");
    expect(slugProblem("admin")).toBe("That name is reserved. Try another");
    expect(slugProblem("-bad")).toBe("Use lowercase letters, numbers and dashes");
    expect(slugProblem("amara")).toBeNull();
  });
  it("builds subdomain or path URLs", () => {
    expect(portfolioUrl("amara", "https://x.vercel.app", "forma.app")).toBe("https://amara.forma.app");
    expect(portfolioUrl("amara", "https://x.vercel.app/")).toBe("https://x.vercel.app/p/amara");
  });
});
