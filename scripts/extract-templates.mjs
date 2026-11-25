// One-off: pull the 20 template concepts per niche out of docs/research/*.md.
import { readFileSync } from "node:fs";
const R = "docs/research/";
const sources = {
  "product-design": "product-design.md", "ux-research": "ux-research.md", "graphic-design": "graphic-design.md",
  "brand-identity": "brand-identity.md", "motion-design": "motion-design.md", "video-editing": "video-editing.md",
  "3d-art": "3d-art.md", illustration: "illustration.md", photography: "photography.md",
  "data-science": "data-science.md", "data-analysis": "data-analysis.md", "ml-ai-engineering": "ml-ai-engineering.md",
  "technical-writing": "technical-writing.md", "product-management": "product-management.md",
  "web-development": "web-development.md",
};
const inlineSrc = {
  cybersecurity: "Cybersecurity", "cloud-devops": "Cloud/DevOps", "mobile-development": "Mobile Development",
  "game-development": "Game Development", "qa-testing": "QA Testing", blockchain: "Blockchain",
  "embedded-iot": "Embedded/IoT", "ar-vr": "AR/VR",
  "social-media-management": "Social Media Management", copywriting: "Copywriting",
};
const out = {};
const clean = (s) => s.replace(/\*\*/g, "").trim();
for (const [slug, file] of Object.entries(sources)) {
  const md = readFileSync(R + file, "utf8");
  const sec = md.slice(md.indexOf("20 original templates"));
  const rows = [...sec.matchAll(/^\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm)].map((m) => [clean(m[1]), clean(m[2])]);
  if (rows.length >= 20) { out[slug] = rows.slice(0, 20); continue; }
  const line = sec.split("\n").find((l) => /^1 \*\*/.test(l));
  out[slug] = line.split(" · ").map((p) => { const m = p.match(/\*\*(.+?)\*\*\s*(?:\((.+)\))?/); return [m[1], m[2] ?? ""]; });
}
const tech = readFileSync(R + "technical-niches.md", "utf8") + readFileSync(R + "marketing-niches.md", "utf8");
for (const [slug, head] of Object.entries(inlineSrc)) {
  const sec = tech.slice(tech.indexOf("## " + head));
  const line = sec.split("\n").find((l) => l.startsWith("**20 templates:**"));
  out[slug] = line.replace("**20 templates:**", "").replace(/\.$/, "").split(" · ").map((p) => {
    p = clean(p); const m = p.match(/^(.+?)\s*(?:\((.+)\))?$/); return [m[1].trim(), m[2] ?? ""];
  });
}
console.log(JSON.stringify(out, null, 1));
