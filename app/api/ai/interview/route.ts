import { NextResponse } from "next/server";
import { aiConfigured, callModel, extractJson, MODELS } from "@/lib/ai/llm";
import {
  interviewModelSchema,
  interviewRequestSchema,
  type InterviewResponse,
} from "@/lib/ai/contracts";
import { fallbackNext } from "@/lib/ai/interview-fallback";
import { interviewPrompt } from "@/lib/ai/prompts";
import { NICHES, type NicheSlug } from "@/lib/niches";
import { interviewTopics } from "@/lib/portfolio/niche-config";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const MAX_QUESTIONS = 14;
const nicheSlugs = new Set<string>(NICHES.map((n) => n.slug));

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "interview"), 60, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const parsed = interviewRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { answers } = parsed.data;
  const niche = (parsed.data.niche ?? "other") as NicheSlug | "other";
  const topics = interviewTopics(niche);
  const total = Math.max(topics.length, answers.length + 1);

  const reply = (body: Omit<InterviewResponse, "progress">) =>
    NextResponse.json({ ...body, progress: { answered: answers.length, total } } satisfies InterviewResponse);

  if (answers.length >= MAX_QUESTIONS) return reply({ done: true, next: null, niche: null, source: "fallback" });

  const fallbackReply = () => {
    const next = fallbackNext(topics, answers);
    return reply({ done: next === null, next, niche: null, source: "fallback" });
  };

  if (!aiConfigured()) return fallbackReply();

  const prompt = interviewPrompt(topics, answers, Boolean(parsed.data.niche));
  const asked = new Set(answers.map((a) => a.question.toLowerCase()));

  // One try, one retry, then the deterministic fallback.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callModel({ model: MODELS.fast, ...prompt, maxTokens: 300, json: true });
      const result = interviewModelSchema.safeParse(extractJson(text));
      if (!result.success) continue;
      const { next } = result.data;
      if (next && asked.has(next.question.toLowerCase())) continue; // never repeat
      const detected = result.data.niche && nicheSlugs.has(result.data.niche) ? result.data.niche : null;
      return reply({ done: next === null, next, niche: detected, source: "ai" });
    } catch (error) {
      console.error("[ai/interview]", error instanceof Error ? error.message : error);
    }
  }
  return fallbackReply();
}
