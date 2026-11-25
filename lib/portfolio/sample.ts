import { NICHES } from "@/lib/niches";
import { portfolioSchema, type Portfolio } from "@/lib/portfolio/schema";
import { getTemplate } from "@/templates/catalog";

/**
 * Sample content for template previews. A made-up person, clearly labelled as
 * sample on every preview page. Project titles change per niche so each
 * gallery reads like the field it is for.
 */
const WORK: Record<string, [string, string, string]> = {
  "ui-ux-design": ["Savings app onboarding", "Clinic booking flow", "Market vendor dashboard"],
  "product-design": ["Payments checkout", "Driver app redesign", "Design system v2"],
  "ux-research": ["Why traders drop off", "Diary study: first salary", "Usability test, bus app"],
  "graphic-design": ["Festival poster series", "Book cover set", "Restaurant menu system"],
  "brand-identity": ["Fintech rebrand", "Bakery identity", "Logistics wordmark"],
  "motion-design": ["App launch film", "Logo animation set", "Explainer loop"],
  "video-editing": ["Documentary short", "Music video edit", "Brand campaign cut"],
  "3d-art": ["Product renders", "Lagos street scene", "Character turnaround"],
  illustration: ["Children's book spreads", "Editorial portraits", "Packaging art"],
  photography: ["Wedding in Enugu", "Market portraits", "Product shoot"],
  "data-science": ["Churn model for a telco", "Crop yield forecast", "Fraud detection"],
  "data-analysis": ["Sales dashboard", "Inventory report", "Customer survey analysis"],
  "ml-ai-engineering": ["Support ticket classifier", "Speech-to-text for Yoruba", "Model serving pipeline"],
  cybersecurity: ["Home SOC lab", "Web app pentest write-up", "Phishing response playbook"],
  "cloud-devops": ["Kubernetes migration", "CI pipeline rebuild", "Cost cut on AWS"],
  "mobile-development": ["Savings app (Flutter)", "Delivery rider app", "Offline-first notes"],
  "game-development": ["Ayo board game", "Jam entry: Danfo Rush", "Platformer prototype"],
  "technical-writing": ["API reference rewrite", "Getting started guide", "Release notes system"],
  "product-management": ["Launched bill payments", "Cut onboarding time", "Merchant pricing tiers"],
  "qa-testing": ["Playwright suite for checkout", "Mobile regression plan", "API contract tests"],
  blockchain: ["Remittance smart contract", "Audit: lending pool", "Hackathon dApp"],
  "embedded-iot": ["Solar battery monitor", "Soil moisture sensors", "Smart meter firmware"],
  "ar-vr": ["Museum AR tour", "VR safety training", "WebXR product viewer"],
  "social-media-management": ["Restaurant Instagram relaunch", "TikTok series for a salon", "LinkedIn for a founder"],
  copywriting: ["Fintech landing page", "Welcome email series", "Radio ad scripts"],
  "web-development": ["School results portal", "Online store", "Open source CLI"],
};

export function samplePortfolio(niche: string, templateId: string): Portfolio {
  const label = NICHES.find((n) => n.slug === niche)?.label ?? "Designer";
  const work = WORK[niche] ?? WORK["ui-ux-design"]!;
  const template = getTemplate(templateId);
  return portfolioSchema.parse({
    version: 1,
    niche,
    templateId,
    sections: {
      profile: {
        name: "Adaeze Okafor",
        role: label,
        location: "Lagos, Nigeria",
        tagline: "I make useful things for people who are short on time and data.",
        status: "open",
      },
      about: {
        body: "Five years in, mostly with startups in Lagos and remote teams in Europe. I care about clear work, honest numbers and finishing what I start. This is sample text so you can see the layout.",
      },
      skills: {
        groups: [
          { label: "Core", items: ["Research", "Planning", "Delivery", "Writing"] },
          { label: "Tools", items: ["Figma", "Notion", "Google Sheets"] },
        ],
      },
      projects: {
        items: work.map((title, i) => ({
          id: `p${i + 1}`,
          title,
          context: ["Fintech startup", "Health startup", "Personal project"][i],
          role: "Lead",
          year: String(2026 - i),
          summary: "What the problem was, what I did about it and what changed. Sample text.",
          result: i === 0 ? "Sample result line goes here" : "",
          tags: ["Sample", label],
          label: i === 2 ? "personal" : "client",
        })),
      },
      experience: {
        items: [
          { role: label, org: "A Lagos startup", start: "2023", end: "Now", summary: "Sample role summary." },
          { role: "Junior " + label, org: "An agency", start: "2021", end: "2023" },
        ],
      },
      contact: {
        heading: "Let's work together",
        email: "hello@example.com",
        whatsapp: "+234 800 000 0000",
        links: [{ label: "LinkedIn", href: "https://www.linkedin.com" }],
      },
    },
    layout: {},
    theme: { accent: "#5B4DFF", mode: "light", font: "sans", ...template.theme },
  });
}
