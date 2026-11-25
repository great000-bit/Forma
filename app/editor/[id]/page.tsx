import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { portfolioUrl } from "@/lib/portfolio/slug";
import { siteConfig } from "@/lib/site";
import { currentUser, supabaseServer } from "@/lib/supabase/auth-server";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/login?next=/editor/${id}`);

  const supabase = await supabaseServer();
  const { data } = supabase ? await supabase.from("portfolios").select("data, slug, status").eq("id", id).maybeSingle() : { data: null };
  const parsed = portfolioSchema.safeParse(data?.data);
  if (!parsed.success) notFound();

  const published =
    data?.status === "published" && data.slug
      ? { slug: data.slug as string, url: portfolioUrl(data.slug as string, siteConfig.url, process.env.PORTFOLIO_ROOT_DOMAIN) }
      : null;

  return <Editor id={id} initial={parsed.data} published={published} />;
}
