import "server-only";

/**
 * Provider-agnostic model client. Server-only: keys never reach the browser.
 * Supports Anthropic (Claude) and Google (Gemini) over plain fetch.
 *
 * AI_PROVIDER=anthropic | gemini. If unset, uses whichever key is present
 * (Anthropic first).
 */

type Provider = "anthropic" | "gemini";

function provider(): Provider | null {
  const chosen = process.env.AI_PROVIDER?.toLowerCase();
  if (chosen === "gemini") return process.env.GEMINI_API_KEY ? "gemini" : null;
  if (chosen === "anthropic") return process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export function aiProvider(): Provider | null {
  return provider();
}

export function aiConfigured(): boolean {
  return provider() !== null;
}

const DEFAULTS: Record<Provider, { fast: string; build: string }> = {
  anthropic: { fast: "claude-haiku-5-5", build: "claude-sonnet-5-5" },
  gemini: { fast: "gemini-3.1-flash-lite", build: "gemini-3.5-flash" },
};

/** Model ids for the active provider; override with AI_MODEL_FAST / AI_MODEL_BUILD. */
export const MODELS = {
  get fast() {
    return process.env.AI_MODEL_FAST ?? process.env.ANTHROPIC_MODEL_FAST ?? DEFAULTS[provider() ?? "anthropic"].fast;
  },
  get build() {
    return process.env.AI_MODEL_BUILD ?? process.env.ANTHROPIC_MODEL_BUILD ?? DEFAULTS[provider() ?? "anthropic"].build;
  },
};

export class AIUnavailableError extends Error {}

type Message = { role: "user" | "assistant"; content: string };
export type ModelRequest = {
  model: string;
  system: string;
  messages: Message[];
  maxTokens?: number;
  /** Ask the provider for JSON output where supported. */
  json?: boolean;
  signal?: AbortSignal;
};

function active(): Provider {
  const p = provider();
  if (!p) throw new AIUnavailableError("No AI provider configured");
  return p;
}

async function failure(res: Response, name: string): Promise<Error> {
  const detail = (await res.text().catch(() => "")).slice(0, 300);
  return new Error(`${name} API ${res.status}: ${detail}`);
}

// ---------- Anthropic ----------

function anthropicInit(req: ModelRequest, stream: boolean): RequestInit {
  return {
    method: "POST",
    signal: req.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: req.model, system: req.system, messages: req.messages, max_tokens: req.maxTokens ?? 1024, stream }),
  };
}

// ---------- Gemini ----------

const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";

function geminiInit(req: ModelRequest): RequestInit {
  return {
    method: "POST",
    signal: req.signal,
    headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: {
        // Gemini's thinking tokens count against this limit, so allow more room.
        maxOutputTokens: Math.max((req.maxTokens ?? 1024) * 4, 2048),
        ...(req.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  };
}

type GeminiChunk = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]; error?: { message?: string } };

function geminiText(chunk: GeminiChunk): string {
  return (chunk.candidates?.[0]?.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");
}

// ---------- Public API ----------

export async function callModel(req: ModelRequest): Promise<string> {
  if (active() === "gemini") {
    const res = await fetch(`${GEMINI}/${encodeURIComponent(req.model)}:generateContent`, geminiInit(req));
    if (!res.ok) throw await failure(res, "Gemini");
    return geminiText((await res.json()) as GeminiChunk);
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", anthropicInit(req, false));
  if (!res.ok) throw await failure(res, "Claude");
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
}

/** Yields text as it streams. Throws on API errors. */
export async function* streamModel(req: ModelRequest): AsyncGenerator<string> {
  const gemini = active() === "gemini";
  const res = gemini
    ? await fetch(`${GEMINI}/${encodeURIComponent(req.model)}:streamGenerateContent?alt=sse`, geminiInit(req))
    : await fetch("https://api.anthropic.com/v1/messages", anthropicInit(req, true));
  if (!res.ok || !res.body) throw await failure(res, gemini ? "Gemini" : "Claude");

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
      if (!payload || payload === "[DONE]") continue;
      let event: unknown;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }
      if (gemini) {
        const chunk = event as GeminiChunk;
        if (chunk.error) throw new Error(`Gemini stream error: ${chunk.error.message ?? "unknown"}`);
        const text = geminiText(chunk);
        if (text) yield text;
      } else {
        const e = event as { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } };
        if (e.type === "content_block_delta" && e.delta?.type === "text_delta" && e.delta.text) yield e.delta.text;
        else if (e.type === "error") throw new Error(`Claude stream error: ${e.error?.message ?? "unknown"}`);
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
