import type { Metadata } from "next";
import { Builder } from "@/components/builder/builder";
import { TEMPLATES } from "@/templates/catalog";

export const metadata: Metadata = {
  title: "Build your portfolio",
  robots: { index: false, follow: false },
};

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const found = TEMPLATES.find((t) => t.id === template && t.niche !== "all");
  return <Builder start={found ? { niche: found.niche, templateId: found.id } : undefined} />;
}
