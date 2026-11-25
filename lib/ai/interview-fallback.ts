import type { Answer } from "@/lib/ai/contracts";
import type { InterviewTopic } from "@/lib/portfolio/niche-config";

/**
 * Deterministic interview used when the AI is unavailable or returns invalid
 * output: ask each topic's fallback question once, in order.
 */
export function fallbackNext(topics: InterviewTopic[], answers: Answer[]) {
  const covered = new Set(answers.map((a) => a.topic));
  const next = topics.find((t) => !covered.has(t.id));
  return next ? { topic: next.id, question: next.ask } : null;
}

/** Picks a topic's tone answer for the builder, if the user gave one. */
export function toneFrom(answers: Answer[]): string {
  const tone = answers.find((a) => a.topic === "tone" && !a.skipped);
  return tone?.answer ?? "";
}
