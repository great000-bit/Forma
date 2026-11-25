import { NextResponse } from "next/server";
import { aiConfigured, aiProvider, callModel, MODELS } from "@/lib/ai/llm";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/health: checks the AI setup with one tiny call per model.
 * Never returns the key. Rate limited because each check costs a request.
 */
export async function GET(request: Request) {
  if (!rateLimit(clientKey(request, "health"), 5, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Try again in a few minutes." }, { status: 429 });
  }
  if (!aiConfigured()) {
    return NextResponse.json({ configured: false, hint: "Set GEMINI_API_KEY (or ANTHROPIC_API_KEY) in Vercel, then redeploy." });
  }

  const check = async (model: string) => {
    const started = Date.now();
    try {
      await callModel({ model, system: "Reply with OK.", messages: [{ role: "user", content: "ping" }], maxTokens: 5 });
      return { model, ok: true, ms: Date.now() - started };
    } catch (error) {
      return { model, ok: false, ms: Date.now() - started, error: error instanceof Error ? error.message.slice(0, 200) : "Unknown error" };
    }
  };

  const [fast, build] = await Promise.all([check(MODELS.fast), check(MODELS.build)]);
  return NextResponse.json({ configured: true, provider: aiProvider(), fast, build });
}
