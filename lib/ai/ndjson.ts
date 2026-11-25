import { SECTION_IDS, sectionSchemas, type SectionId, type Sections } from "@/lib/portfolio/schema";

/** Splits streamed text into complete lines, keeping the unfinished tail. */
export function takeLines(buffer: string): { lines: string[]; rest: string } {
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  return { lines: parts.map((l) => l.trim()).filter(Boolean), rest };
}

const ids = new Set<string>(SECTION_IDS);

/**
 * Parses one NDJSON line from the builder model and validates it against
 * that section's schema. Returns null for anything invalid.
 */
export function parseSectionLine(line: string): { id: SectionId; data: Sections[SectionId] } | null {
  let raw: unknown;
  try {
    raw = JSON.parse(line.replace(/^```(?:json)?|```$/g, "").trim());
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const { section, data } = raw as { section?: unknown; data?: unknown };
  if (typeof section !== "string" || !ids.has(section)) return null;
  const id = section as SectionId;

  let input = data;
  if (id === "projects" && input && typeof input === "object" && Array.isArray((input as { items?: unknown }).items)) {
    // Give every project a stable id even if the model forgot one.
    const items = (input as { items: Record<string, unknown>[] }).items.map((item, i) => ({
      ...item,
      id: typeof item?.id === "string" && item.id ? item.id : `p${i + 1}`,
    }));
    input = { ...(input as object), items };
  }

  const result = sectionSchemas[id].safeParse(input);
  return result.success ? { id, data: result.data as Sections[SectionId] } : null;
}
