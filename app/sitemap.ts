import type { MetadataRoute } from "next";
import { NICHES } from "@/lib/niches";
import { siteConfig } from "@/lib/site";
import { TEMPLATES } from "@/templates/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...NICHES.map((n) => ({
      url: `${siteConfig.url}/templates?niche=${n.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TEMPLATES.filter((t) => t.niche !== "all").map((t) => ({
      url: `${siteConfig.url}/templates/${t.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
