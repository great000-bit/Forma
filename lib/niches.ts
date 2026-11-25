/**
 * Launch niches from the PRD (section 1.3). Research passes may add more.
 * Icons live in components/marketing/niche-icons.ts so this file stays
 * safe to import on the server and in tests.
 */
export const NICHES = [
  { slug: "ui-ux-design", label: "UI/UX Design" },
  { slug: "product-design", label: "Product Design" },
  { slug: "ux-research", label: "UX Research" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "brand-identity", label: "Brand Identity" },
  { slug: "motion-design", label: "Motion Design" },
  { slug: "video-editing", label: "Video Editing" },
  { slug: "3d-art", label: "3D Art" },
  { slug: "illustration", label: "Illustration" },
  { slug: "photography", label: "Photography" },
  { slug: "data-science", label: "Data Science" },
  { slug: "data-analysis", label: "Data Analysis" },
  { slug: "ml-ai-engineering", label: "ML/AI Engineering" },
  { slug: "cybersecurity", label: "Cybersecurity" },
  { slug: "cloud-devops", label: "Cloud/DevOps" },
  { slug: "mobile-development", label: "Mobile Development" },
  { slug: "game-development", label: "Game Development" },
  { slug: "technical-writing", label: "Technical Writing" },
  { slug: "product-management", label: "Product Management" },
  { slug: "qa-testing", label: "QA Testing" },
  { slug: "blockchain", label: "Blockchain" },
  { slug: "embedded-iot", label: "Embedded/IoT" },
  { slug: "ar-vr", label: "AR/VR" },
  { slug: "social-media-management", label: "Social Media Management" },
  { slug: "copywriting", label: "Copywriting" },
  { slug: "web-development", label: "Web Development" },
] as const;

export type NicheSlug = (typeof NICHES)[number]["slug"];

/** Waitlist also accepts "other" so people outside the list can still join. */
export const WAITLIST_NICHE_OPTIONS: { value: string; label: string }[] = [
  ...NICHES.map((n) => ({ value: n.slug, label: n.label })),
  { value: "other", label: "Something else" },
];
