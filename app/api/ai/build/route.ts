import { NextResponse } from "next/server";
import { aiConfigured, callModel, MODELS, streamModel } from "@/lib/ai/llm";
import { buildRequestSchema, type BuildEvent } from "@/lib/ai/contracts";
import { toneFrom } from "@/lib/ai/interview-fallback";
import { parseSectionLine, takeLines } from "@/lib/ai/ndjson";
import { buildPrompt } from "@/lib/ai/prompts";
import { NICHES } from "@/lib/niches";
import { emptyPortfolio, portfolioSchema, SECTION_IDS, type SectionId } from "@/lib/portfolio/schema";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getTemplate } from "@/templates/catalog";

export const maxDuration = 60;

const STATUS: Record<SectionId, string> = {
  profile: "Setting up your profile",
  about: "Writing your about section",
  skills: "Listing your skills",
  projects: "Laying out your projects",
  experience: "Adding your experience",
  contact: "Connecting your contact links",
};

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "build"), 6, 10 * 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "You've built a few times already. Try again in a few minutes." }, { status: 429 });
  }
  const parsed = buildRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!aiConfigured()) {
    return NextResponse.json({ error: "The AI builder isn't configured yet." }, { status: 503 });
  }

  const { niche, templateId, answers } = parsed.data;
  const template = getTemplate(templateId);
  const nicheLabel = NICHES.find((n) => n.slug === niche)?.label ?? "creative and tech";
  const tone = toneFrom(answers);
  const portfolio = emptyPortfolio(niche, template.id, template.theme);
  const received = new Set<SectionId>();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: BuildEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      const nextStatus = () => {
        const next = SECTION_IDS.find((id) => !received.has(id));
        if (next) send({ type: "status", step: next, text: STATUS[next] });
      };
      const accept = (line: string) => {
        const section = parseSectionLine(line);
        if (!section || received.has(section.id)) return;
        (portfolio.sections as Record<SectionId, unknown>)[section.id] = section.data;
        received.add(section.id);
        send({ type: "section", id: section.id, data: section.data });
        nextStatus();
      };

      nextStatus();

      // Pass 1: stream every section.
      try {
        let buffer = "";
        for await (const chunk of streamModel({ model: MODELS.build, ...buildPrompt(nicheLabel, answers, tone), maxTokens: 4000, signal: request.signal })) {
          const { lines, rest } = takeLines(buffer + chunk);
          buffer = rest;
          lines.forEach(accept);
        }
        if (buffer.trim()) accept(buffer.trim());
      } catch (error) {
        console.error("[ai/build] stream failed:", error instanceof Error ? error.message : error);
      }

      // Pass 2: one retry for anything missing or invalid.
      const missing = SECTION_IDS.filter((id) => !received.has(id));
      if (missing.length > 0 && !request.signal.aborted) {
        try {
          const text = await callModel({ model: MODELS.build, ...buildPrompt(nicheLabel, answers, tone, missing), maxTokens: 3000 });
          takeLines(`${text}\n`).lines.forEach(accept);
        } catch (error) {
          console.error("[ai/build] retry failed:", error instanceof Error ? error.message : error);
        }
      }

      // Safe fallback: anything still missing stays empty so the user can fill it in.
      for (const id of SECTION_IDS) {
        if (!received.has(id)) {
          received.add(id);
          send({ type: "section", id, data: portfolio.sections[id] });
        }
      }

      const final = portfolioSchema.safeParse(portfolio);
      if (final.success) send({ type: "done", portfolio: final.data });
      else send({ type: "error", message: "Something went wrong while putting your portfolio together. Try again." });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
