import "server-only";

/**
 * Minimal Anthropic Messages API client. Server-only: the key never reaches
 * the browser. Uses fetch directly so there is no SDK version to track.
 */
const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export const MODELS = {
  // Short, frequent calls (interview questions, edits)
  fast: process.env.ANTHROPIC_MODEL_FAST ?? "claude-haiku-5-5",
  // Writing the portfolio
  build: process.env.ANTHROPIC_MODEL_BUILD ?? "claude-sonnet-5-5",
} as const;

export class AIUnavailableError extends Error {}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

type Message = { role: "user" | "assistant"; content: string };
type Request = { model: string; system: string; messages: Message[]; maxTokens?: number; signal?: AbortSignal };

function headers() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AIUnavailableError("ANTHROPIC_API_KEY is not set");
  return { "content-type": "application/json", "x-api-key": key, "anthropic-version": API_VERSION };
}

function body(req: Request, stream: boolean) {
  return JSON.stringify({
    model: req.model,
    system: req.system,
    messages: req.messages,
    max_tokens: req.maxTokens ?? 1024,
    stream,
  });
}

async function failure(res: Response): Promise<Error> {
  const detail = (await res.text().catch(() => "")).slice(0, 300);
  return new Error(`Claude API ${res.status}: ${detail}`);
}

export async function callClaude(req: Request): Promise<string> {
  const res = await fetch(API_URL, { method: "POST", headers: headers(), body: body(req, false), signal: req.signal });
  if (!res.ok) throw await failure(res);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

/** Yields text as it streams. Throws on API errors. */
export async function* streamClaude(req: Request): AsyncGenerator<string> {
  const res = await fetch(API_URL, { method: "POST", headers: headers(), body: body(req, true), signal: req.signal });
  if (!res.ok || !res.body) throw await failure(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      let event: { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }
      if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
        yield event.delta.text;
      } else if (event.type === "error") {
        throw new Error(`Claude stream error: ${event.error?.message ?? "unknown"}`);
      }
    }
  }
}

/** Pulls the first JSON object or array out of model text (handles ```json fences). */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (start === -1 || end < start) throw new Error("No JSON found in model output");
  return JSON.parse(cleaned.slice(start, end + 1));
}
