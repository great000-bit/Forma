import { z } from "zod";
import { portfolioSchema, type Portfolio } from "@/lib/portfolio/schema";

/**
 * A small, safe subset of JSON Patch used by the edit agent and the editor.
 * Paths are dot-separated, e.g. "sections.about.body" or
 * "sections.projects.items.0.title". Only paths under "sections", "layout"
 * and "theme" may change.
 */
export const opSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("set"), path: z.string().min(1).max(200), value: z.unknown() }),
  z.object({ op: z.literal("remove"), path: z.string().min(1).max(200) }),
  z.object({
    op: z.literal("insert"),
    path: z.string().min(1).max(200),
    index: z.number().int().min(0).optional(),
    value: z.unknown(),
  }),
]);

export const opsSchema = z.array(opSchema).max(40);
export type Op = z.infer<typeof opSchema>;

const ALLOWED_ROOTS = new Set(["sections", "layout", "theme"]);
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export class OpError extends Error {}

function parsePath(path: string): (string | number)[] {
  const parts = path.split(".").filter(Boolean);
  if (parts.length < 2 || !ALLOWED_ROOTS.has(parts[0]!)) {
    throw new OpError(`Path not allowed: ${path}`);
  }
  return parts.map((p) => {
    if (FORBIDDEN_KEYS.has(p)) throw new OpError(`Path not allowed: ${path}`);
    return /^\d+$/.test(p) ? Number(p) : p;
  });
}

type Container = Record<string | number, unknown>;

function walk(root: unknown, keys: (string | number)[]): Container {
  let node = root as Container;
  for (const key of keys) {
    const next = node?.[key];
    if (next === null || typeof next !== "object") throw new OpError(`Missing path segment: ${key}`);
    node = next as Container;
  }
  return node;
}

/** Applies ops to a deep copy, then validates the whole document. Throws on any problem. */
export function applyOps(portfolio: Portfolio, ops: Op[]): Portfolio {
  const draft = structuredClone(portfolio) as unknown;

  for (const op of ops) {
    const keys = parsePath(op.path);
    const last = keys[keys.length - 1]!;
    const parent = walk(draft, keys.slice(0, -1));

    if (op.op === "set") {
      parent[last] = structuredClone(op.value);
    } else if (op.op === "remove") {
      if (Array.isArray(parent) && typeof last === "number") parent.splice(last, 1);
      else delete parent[last];
    } else {
      const target = parent[last];
      if (!Array.isArray(target)) throw new OpError(`Insert target is not a list: ${op.path}`);
      const index = Math.min(op.index ?? target.length, target.length);
      target.splice(index, 0, structuredClone(op.value));
    }
  }

  const result = portfolioSchema.safeParse(draft);
  if (!result.success) {
    throw new OpError(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return result.data;
}
