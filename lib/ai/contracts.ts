import { z } from "zod";
import { NICHES } from "@/lib/niches";
import { portfolioSchema, SECTION_IDS } from "@/lib/portfolio/schema";

/** Request and response shapes shared by the AI routes and the builder UI. */

const nicheValues = new Set<string>([...NICHES.map((n) => n.slug), "other"]);
export const nicheField = z.string().refine((v) => nicheValues.has(v), "Unknown niche");

export const answerSchema = z.object({
  topic: z.string().trim().min(1).max(40),
  question: z.string().trim().max(400),
  answer: z.string().trim().max(2000),
  skipped: z.boolean().default(false),
});
export type Answer = z.infer<typeof answerSchema>;

export const interviewRequestSchema = z.object({
  niche: nicheField.optional(),
  answers: z.array(answerSchema).max(30),
});

export const interviewResponseSchema = z.object({
  done: z.boolean(),
  next: z.object({ topic: z.string(), question: z.string() }).nullable(),
  niche: z.string().nullable(),
  progress: z.object({ answered: z.number(), total: z.number() }),
  source: z.enum(["ai", "fallback"]),
});
export type InterviewResponse = z.infer<typeof interviewResponseSchema>;

/** What the model must return for an interview turn. */
export const interviewModelSchema = z.object({
  covered: z.array(z.string()).default([]),
  next: z
    .object({ topic: z.string().min(1).max(40), question: z.string().trim().min(3).max(240) })
    .nullable(),
  niche: z.string().nullable().default(null),
});

export const buildRequestSchema = z.object({
  niche: nicheField,
  templateId: z.string().min(1).max(64),
  answers: z.array(answerSchema).min(1).max(30),
});

export const buildEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("status"), step: z.enum(SECTION_IDS), text: z.string() }),
  z.object({ type: z.literal("section"), id: z.enum(SECTION_IDS), data: z.unknown() }),
  z.object({ type: z.literal("done"), portfolio: portfolioSchema }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);
export type BuildEvent = z.infer<typeof buildEventSchema>;

export const editRequestSchema = z.object({
  portfolio: portfolioSchema,
  instruction: z.string().trim().min(2, "Tell Forma what to change").max(500),
});
