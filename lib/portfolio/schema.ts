import { z } from "zod";

/**
 * The portfolio document. Every template renders from this one shape, the AI
 * builder writes it section by section, and the edit agent changes it with ops.
 * Adding a template never changes this schema.
 */

// AI and forms often send "" or null for "nothing"; treat both as absent.
const blankToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);
const optional = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(blankToUndefined, schema.optional());

const text = (max: number) => z.string().trim().max(max);
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^https?:\/\//i.test(v), "Links must start with http:// or https://");

const link = z.object({ label: text(30).min(1), href: httpUrl });

export const SECTION_IDS = ["profile", "about", "skills", "projects", "experience", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const AVAILABILITY = ["open", "freelance", "booked", "not-looking", "unknown"] as const;

export const profileSchema = z.object({
  name: text(80).default(""),
  role: text(80).default(""),
  location: text(80).default(""),
  tagline: text(160).default(""),
  status: z.enum(AVAILABILITY).catch("unknown"),
  statusNote: text(120).default(""),
  avatarUrl: optional(httpUrl),
});

export const aboutSchema = z.object({
  body: text(1200).default(""),
});

export const skillsSchema = z.object({
  groups: z
    .array(z.object({ label: text(40).default(""), items: z.array(text(40).min(1)).max(20).default([]) }))
    .max(6)
    .default([]),
});

export const PROJECT_LABELS = ["client", "personal", "practice", "nda"] as const;

export const projectSchema = z.object({
  id: text(40).min(1),
  title: text(100).min(1),
  context: text(80).default(""),
  role: text(80).default(""),
  year: text(20).default(""),
  summary: text(300).default(""),
  result: text(160).default(""),
  tags: z.array(text(30).min(1)).max(8).default([]),
  links: z.array(link).max(4).default([]),
  imageUrl: optional(httpUrl),
  label: z.enum(PROJECT_LABELS).catch("client"),
});

export const projectsSchema = z.object({
  items: z.array(projectSchema).max(12).default([]),
});

export const experienceItemSchema = z.object({
  role: text(80).min(1),
  org: text(80).default(""),
  start: text(20).default(""),
  end: text(20).default(""),
  summary: text(240).default(""),
});

export const experienceSchema = z.object({
  items: z.array(experienceItemSchema).max(10).default([]),
});

export const contactSchema = z.object({
  heading: text(80).default(""),
  email: optional(z.string().trim().max(254).pipe(z.email())),
  whatsapp: optional(text(20).regex(/^\+?[0-9 ]{7,20}$/, "Use digits, with the country code")),
  phone: optional(text(20).regex(/^\+?[0-9 ()-]{7,20}$/)),
  links: z.array(link).max(8).default([]),
  cvUrl: optional(httpUrl),
});

export const sectionSchemas = {
  profile: profileSchema,
  about: aboutSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  experience: experienceSchema,
  contact: contactSchema,
} as const;

export const themeSchema = z.object({
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .catch("#5B4DFF"),
  mode: z.enum(["light", "dark"]).catch("light"),
  font: z.enum(["sans", "serif", "mono"]).catch("sans"),
});

export const portfolioSchema = z.object({
  version: z.literal(1),
  niche: text(64).min(1),
  templateId: text(64).min(1),
  sections: z.object(sectionSchemas),
  layout: z.object({
    order: z.array(z.enum(SECTION_IDS)).default([...SECTION_IDS]),
    hidden: z.array(z.enum(SECTION_IDS)).default([]),
  }),
  theme: themeSchema,
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type Sections = Portfolio["sections"];
export type Project = z.infer<typeof projectSchema>;
export type Theme = z.infer<typeof themeSchema>;

export function emptySections(): Sections {
  return {
    profile: profileSchema.parse({}),
    about: aboutSchema.parse({}),
    skills: skillsSchema.parse({}),
    projects: projectsSchema.parse({}),
    experience: experienceSchema.parse({}),
    contact: contactSchema.parse({}),
  };
}

export function emptyPortfolio(niche: string, templateId: string, theme?: Partial<Theme>): Portfolio {
  return {
    version: 1,
    niche,
    templateId,
    sections: emptySections(),
    layout: { order: [...SECTION_IDS], hidden: [] },
    theme: themeSchema.parse(theme ?? {}),
  };
}
