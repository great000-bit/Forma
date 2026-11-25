import type { Answer } from "@/lib/ai/contracts";
import type { InterviewTopic } from "@/lib/portfolio/niche-config";
import { NICHES } from "@/lib/niches";

/*
  Prompts for the three agents. Shared rules: never invent facts, write like a
  person, no buzzwords, output only the requested JSON.
*/

const VOICE = `Voice rules:
- Short, plain, confident. Sound like a thoughtful person, not a marketing team.
- Never use: passionate, leverage, cutting-edge, innovative, synergy, seamless, robust, delve, unlock, elevate, journey, dynamic, results-driven, "in today's", em dashes.
- Never invent facts, numbers, clients, awards, dates or links. If something is missing, leave the field empty.`;

function transcript(answers: Answer[]): string {
  if (answers.length === 0) return "(no answers yet)";
  return answers
    .map((a, i) => `${i + 1}. [${a.topic}] Q: ${a.question}\n   A: ${a.skipped ? "(skipped)" : a.answer}`)
    .join("\n");
}

export function interviewPrompt(topics: InterviewTopic[], answers: Answer[], nicheKnown: boolean) {
  const nicheList = NICHES.map((n) => n.slug).join(", ");
  const system = `You run the interview for Forma, which builds a portfolio website from the user's answers.
Ask ONE short question at a time (under 25 words). Adapt to what they said. Ask only for what is still missing. Never repeat a question. Skipped topics count as covered.
If an answer is vague, you may ask one follow-up for that topic, never more.
Aim to finish in 8 to 12 questions in total. When every topic is covered, set "next" to null.
${nicheKnown ? "" : `The user has not picked a niche. From their answers, set "niche" to the best match from: ${nicheList}. Use null if unclear.`}
${VOICE}

Topics to cover, in order:
${topics.map((t) => `- ${t.id}: ${t.goal}`).join("\n")}

Reply with JSON only:
{"covered": ["topic ids already covered"], "next": {"topic": "topic id", "question": "..."} | null, "niche": "slug" | null}`;

  return { system, messages: [{ role: "user" as const, content: `Interview so far:\n${transcript(answers)}` }] };
}

const SECTION_SHAPES = `Section shapes (all strings plain text, no markdown):
profile: {"name","role","location","tagline" (one sentence, max 160 chars),"status": "open"|"freelance"|"booked"|"not-looking"|"unknown","statusNote"}
about: {"body"} (2 short paragraphs max, first person, separated by a blank line)
skills: {"groups":[{"label","items":["..."]}]} (max 4 groups, max 8 items each, only skills they named)
projects: {"items":[{"id","title","context" (company/client or empty),"role","year","summary" (1-2 sentences),"result" (only a result they stated, else ""),"tags":[],"links":[{"label","href"}],"label": "client"|"personal"|"practice"|"nda"}]}
experience: {"items":[{"role","org","start","end","summary"}]}
contact: {"heading","email","whatsapp" (digits with country code),"phone","links":[{"label","href"}],"cvUrl"}`;

export function buildPrompt(nicheLabel: string, answers: Answer[], tone: string, only?: string[]) {
  const order = only?.length ? only.join(", ") : "profile, about, skills, projects, experience, contact";
  const system = `You write portfolio content for a ${nicheLabel} professional, using ONLY their interview answers.
Write in their tone: ${tone || "calm and professional"}. Use their own words where they are good.
${VOICE}
- Links must be full URLs they gave you. Otherwise omit them.
- Mark practice or personal work honestly with "label".

Output NDJSON: one line per section, in this order: ${order}.
Each line is exactly: {"section":"<id>","data":{...}}
No other text, no code fences, no blank lines.

${SECTION_SHAPES}`;
  return { system, messages: [{ role: "user" as const, content: `Interview answers:\n${transcript(answers)}` }] };
}

export function editPrompt(portfolioJson: string, instruction: string, previousError?: string) {
  const system = `You edit a portfolio document by returning a list of operations. Change only what the instruction asks.
${VOICE}
Paths are dot-separated under "sections", "layout" or "theme", e.g. "sections.about.body", "sections.projects.items.0.title", "theme.accent", "layout.hidden".
Operations:
{"op":"set","path":"...","value":...}
{"op":"remove","path":"..."}
{"op":"insert","path":"<list path>","index":<optional number>,"value":...}
Theme accent must be a hex colour like "#1F9D6B". theme.mode is "light" or "dark". theme.font is "sans", "serif" or "mono".
Section ids for layout.order and layout.hidden: profile, about, skills, projects, experience, contact.
If the instruction needs facts you don't have (a new project, a number), do not make them up: return no ops and say what you need in "summary".
Reply with JSON only: {"ops":[...],"summary":"one short sentence describing the change"}`;

  const user = `Portfolio:\n${portfolioJson}\n\nInstruction: ${instruction}${
    previousError ? `\n\nYour previous ops were rejected: ${previousError}. Fix them.` : ""
  }`;
  return { system, messages: [{ role: "user" as const, content: user }] };
}
