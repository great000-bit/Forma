import type { NicheSlug } from "@/lib/niches";

/**
 * What the interview agent must cover for each niche, taken from the
 * "Required sections" in docs/research/*.md. Topics are asked in order;
 * the agent may merge or skip a topic once the answers already cover it.
 */
export type InterviewTopic = {
  id: string;
  /** What the agent needs to learn. Used in the prompt. */
  goal: string;
  /** A short, human fallback question used when the AI is unavailable. */
  ask: string;
};

const identity: InterviewTopic = {
  id: "identity",
  goal: "Full name, the name they want shown, their role title and city or country.",
  ask: "Let's start simple. What's your name, what do you do, and where are you based?",
};
const status: InterviewTopic = {
  id: "status",
  goal: "Availability: full-time, contract, freelance, internships, booked or not looking. Remote or on-site.",
  ask: "Are you open to work right now? Full-time, freelance, or just showing your work?",
};
const contact: InterviewTopic = {
  id: "contact",
  goal: "Email, WhatsApp number with country code, and the profile links they want shown. CV link if they have one.",
  ask: "How should people reach you? Email, WhatsApp, and any profiles you want linked.",
};
const tone: InterviewTopic = {
  id: "tone",
  goal: "How they want to sound: e.g. calm and professional, warm and friendly, bold.",
  ask: "Last one. How should your portfolio sound: calm and professional, warm and friendly, or bold?",
};
const experience: InterviewTopic = {
  id: "experience",
  goal: "Past roles: title, company, years. For beginners: training, school or bootcamp instead.",
  ask: "Where have you worked before? Roles, companies and years are enough. If you're just starting, tell me about your training.",
};

type NicheSpec = { work: InterviewTopic; skills: InterviewTopic; extra?: InterviewTopic };

const work = (goal: string, ask: string): InterviewTopic => ({ id: "work", goal, ask });
const skills = (goal: string, ask: string): InterviewTopic => ({ id: "skills", goal, ask });
const extra = (goal: string, ask: string): InterviewTopic => ({ id: "extra", goal, ask });

const design = (thing: string) =>
  work(
    `2 to 4 ${thing}: name, company or "personal/practice project", their role, the problem, key decisions, the result (numbers only if they give them), links or images, NDA yes/no.`,
    `Tell me about one ${thing.replace(/s$/, "")} you're proud of. What was the problem, what did you do, and what changed?`,
  );

const SPECS: Record<NicheSlug, NicheSpec> = {
  "ui-ux-design": {
    work: design("projects"),
    skills: skills("Methods and tools: research, interaction, visual, prototyping, design systems, Figma.", "Which skills and tools do you lean on most?"),
    extra: extra("Testimonials, writing, side projects or art (optional).", "Anything else worth showing, like testimonials, writing or side projects?"),
  },
  "product-design": {
    work: work("2 to 4 cases: context, goal and how success was measured, constraints, their role and team, decisions and why, result, physical or digital.", "Tell me about a product you shaped. What was the goal, and what decision mattered most?"),
    skills: skills("Strategy, research, interaction, visual, prototyping, systems, front-end; tools.", "What are you strongest at, and which tools do you use?"),
  },
  "ux-research": {
    work: work("2 to 4 studies: research question, method and why, participants, top insights, what changed because of it, limits.", "Tell me about a study you ran. What did you want to learn, and what changed because of it?"),
    skills: skills("Methods (interviews, usability, surveys, analytics) and tools.", "Which research methods and tools do you use most?"),
    extra: extra("Background field, publications, talks (optional).", "Did you come from another field, or have talks or writing to show?"),
  },
  "graphic-design": {
    work: work("6 to 12 pieces: client, discipline, year, their role, credits, one-line concept, images.", "Which pieces should lead your portfolio? Tell me the client and what each was for."),
    skills: skills("Disciplines: identity, editorial, packaging, posters, lettering, social; tools.", "Which kinds of design do you do most?"),
    extra: extra("Clients, awards, shop or prints (optional).", "Any clients, awards or a shop you want to mention?"),
  },
  "brand-identity": {
    work: work("3 to 6 identity cases: client, industry, brief, strategy line, final mark, system, applications.", "Pick an identity you designed. Who was the client and what problem did the brand solve?"),
    skills: skills("Services: strategy, naming, logo, guidelines, packaging, rebrands.", "Which brand services do you offer?"),
  },
  "motion-design": {
    work: work("Reel link, then 4 to 8 projects: client, studio or agency, year, exact role, tools, film link.", "Do you have a reel? Send the link, then tell me about one project and your exact role."),
    skills: skills("Specialty (2D, 3D, titles, UI motion) and tools (After Effects, Cinema 4D, Blender).", "What kind of motion work do you do, and in which tools?"),
  },
  "video-editing": {
    work: work("Reel, then 4 to 10 projects: title, client or channel, format, role (edit, colour, sound), link, results only if given.", "Share your reel, then one project: who was it for and what did you do on it?"),
    skills: skills("Formats (YouTube, short-form, ads, music videos, weddings) and software.", "Which formats do you edit, and in what software?"),
    extra: extra("Packages and turnaround times (optional).", "Do you offer packages or have standard turnaround times?"),
  },
  "3d-art": {
    work: work("6 to 20 pieces: title, type (character, environment, product, archviz), software, client or personal.", "Which 3D pieces should people see first? What were they for?"),
    skills: skills("Specialty and tools (Blender, Maya, ZBrush, Substance, Unreal).", "What's your 3D specialty, and which tools do you use?"),
  },
  illustration: {
    work: work("8 to 24 pieces: client or personal, use (cover, packaging, editorial), year, market.", "Which illustrations should lead? Who were they for?"),
    skills: skills("Markets: editorial, picture books, brand, maps, medical, murals, lettering.", "Who usually buys your work: publishers, brands, magazines?"),
    extra: extra("Agent, shop, books, awards (optional).", "Do you have an agent, a shop or books to show?"),
  },
  photography: {
    work: work("2 to 6 galleries: name, client or event, location, photos.", "Which kinds of shoots do you want to show? Weddings, portraits, products?"),
    skills: skills("Specialties, areas served, travel.", "Where do you work, and do you travel for shoots?"),
    extra: extra("Packages and prices (optional), testimonials.", "Do you want to show prices or packages?"),
  },
  "data-science": {
    work: work("3 to 5 projects: business question, data, methods and why, metric and result (only if given), caveats, repo/notebook/demo links.", "Tell me about a data project. What question were you answering, and what did you find?"),
    skills: skills("Stack: Python, R, SQL, ML libraries, cloud.", "Which tools and languages do you use?"),
  },
  "data-analysis": {
    work: work("3 to 6 projects: business question, dataset (real or synthetic), what they did, key insight, recommendation, dashboard link.", "Tell me about a dashboard or analysis you're proud of. What question did it answer?"),
    skills: skills("Tools: Excel, SQL, Power BI, Tableau, Python; certifications.", "Which tools do you use, and any certifications?"),
  },
  "ml-ai-engineering": {
    work: work("3 to 5 systems: problem, architecture, model choice and why, evaluation vs baseline, deployment, result, links.", "Tell me about a model or AI system you built. How did you know it worked?"),
    skills: skills("Stack: PyTorch, Hugging Face, LLM tooling, vector DBs, cloud, MLOps.", "What's in your ML stack?"),
  },
  cybersecurity: {
    work: work("Labs, write-ups, disclosures or incident cases (sanitised): goal, environment, tools, findings, mitigations.", "Tell me about a lab, CTF or security project. What did you find and fix?"),
    skills: skills("Focus (SOC, pentest, AppSec, GRC, DFIR) and certifications.", "What's your security focus, and which certifications do you hold?"),
  },
  "cloud-devops": {
    work: work("Projects: problem, architecture, tools, result (cost, uptime, deploy time; only real numbers).", "Tell me about infrastructure you built or improved. What changed?"),
    skills: skills("Clouds, IaC, CI/CD, containers; certifications.", "Which clouds and tools do you work with?"),
  },
  "mobile-development": {
    work: work("Apps: what it does, their role, stack, store links, screenshots, users or rating if given.", "Tell me about an app you built. What does it do and where can people get it?"),
    skills: skills("Platforms and stack: Swift, Kotlin, Flutter, React Native.", "Which platforms and frameworks do you build with?"),
  },
  "game-development": {
    work: work("Games: title, genre, platform, role, team size, play link, trailer.", "Tell me about a game you worked on. What was your role, and can people play it?"),
    skills: skills("Role and engine: Unity, Unreal, Godot.", "Which engine do you use, and what's your role on a team?"),
  },
  "technical-writing": {
    work: work("3 to 6 samples: title, doc type, audience, their role, tools, link.", "Share a doc you wrote. Who was it for, and what did it help them do?"),
    skills: skills("Doc types, tools (Markdown, Git, Docusaurus, OpenAPI).", "Which kinds of docs and tools do you work with?"),
  },
  "product-management": {
    work: work("2 to 4 cases: problem, evidence, options, decision, what shipped, outcome, their role vs team.", "Tell me about a product decision you owned. What did you choose, and why?"),
    skills: skills("Discovery, analytics, experimentation, stakeholder work, technical depth.", "What are your strongest product skills?"),
  },
  "qa-testing": {
    work: work("Projects: product, scope, approach, tools, results.", "Tell me about a product you tested. What was your approach?"),
    skills: skills("Manual vs automation, tools (Cypress, Playwright, Selenium), ISTQB.", "Do you focus on manual or automated testing, and with which tools?"),
  },
  blockchain: {
    work: work("Projects: what it does, chain, contract or repo links, audits, their role. No price talk.", "Tell me about a contract, dApp or protocol you worked on. What does it do?"),
    skills: skills("Role and languages: Solidity, Rust, Move; chains.", "Which chains and languages do you work with?"),
  },
  "embedded-iot": {
    work: work("Projects: problem, hardware, MCU, firmware, photos or video, result.", "Tell me about a hardware project. What did you build and how does it work?"),
    skills: skills("Firmware, PCB, protocols, tools (KiCad, STM32, ESP32).", "Which boards, protocols and tools do you use?"),
  },
  "ar-vr": {
    work: work("Projects: concept, platform, their role, tech, demo video, try link.", "Tell me about an AR or VR experience you built. What can people do in it?"),
    skills: skills("Platforms (Quest, Vision Pro, WebXR), engines, tools.", "Which platforms and engines do you build for?"),
  },
  "social-media-management": {
    work: work("Accounts and campaigns: goal, platforms, content, role, results with time period (only if given).", "Tell me about a page or campaign you ran. What was the goal and what happened?"),
    skills: skills("Platforms, tools, services; packages (optional).", "Which platforms and tools do you work with?"),
  },
  copywriting: {
    work: work("Samples: client, format, brief, the copy or link, result if given; spec work labelled.", "Share a piece of copy you're proud of. Who was it for and what was it meant to do?"),
    skills: skills("Specialty: conversion, email, brand voice, SEO, UX, scripts.", "What kind of copy do you write most?"),
  },
  "web-development": {
    work: work("3 to 8 projects: what it does, their part, stack, live URL, repo, result if given.", "Tell me about a site or app you built. What does it do, and what was your part?"),
    skills: skills("Stack and tools; services for freelancers.", "What's your stack? If you freelance, which services do you offer?"),
  },
};

export function interviewTopics(niche: NicheSlug | "other"): InterviewTopic[] {
  const spec: NicheSpec = niche === "other" ? SPECS["ui-ux-design"] : SPECS[niche];
  return [identity, status, spec.work, spec.skills, experience, ...(spec.extra ? [spec.extra] : []), contact, tone];
}
