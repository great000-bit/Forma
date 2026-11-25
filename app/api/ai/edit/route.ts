import { NextResponse } from "next/server";
import { z } from "zod";
import { aiConfigured, callModel, extractJson, MODELS } from "@/lib/ai/llm";
import { editRequestSchema } from "@/lib/ai/contracts";
import { editPrompt } from "@/lib/ai/prompts";
import { applyOps, opsSchema, OpError } from "@/lib/portfolio/ops";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const modelReply = z.object({ ops: opsSchema, summary: z.string().max(240).default("") });

/** Returns only the diff (ops). The client applies it with the same applyOps. */
export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "edit"), 30, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many edits at once. Give it a minute." }, { status: 429 });

  const parsed = editRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  if (!aiConfigured()) return NextResponse.json({ error: "AI edits aren't configured yet." }, { status: 503 });

  const { portfolio, instruction } = parsed.data;
  const json = JSON.stringify({ sections: portfolio.sections, layout: portfolio.layout, theme: portfolio.theme });
  let lastError: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callModel({ model: MODELS.fast, ...editPrompt(json, instruction, lastError), maxTokens: 2000, json: true });
      const reply = modelReply.safeParse(extractJson(text));
      if (!reply.success) {
        lastError = "Reply was not in the required JSON shape";
        continue;
      }
      applyOps(portfolio, reply.data.ops); // validates; throws if the result is invalid
      return NextResponse.json({ ops: reply.data.ops, summary: reply.data.summary });
    } catch (error) {
      lastError = error instanceof OpError ? error.message : "Model call failed";
      if (!(error instanceof OpError)) console.error("[ai/edit]", error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({ error: "Forma couldn't make that change safely. Try saying it another way." }, { status: 422 });
}
