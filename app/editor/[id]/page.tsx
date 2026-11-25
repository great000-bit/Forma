import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { currentUser, supabaseServer } from "@/lib/supabase/auth-server";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/login?next=/editor/${id}`);

  const supabase = await supabaseServer();
  const { data } = supabase ? await supabase.from("portfolios").select("data").eq("id", id).maybeSingle() : { data: null };
  const parsed = portfolioSchema.safeParse(data?.data);
  if (!parsed.success) notFound();

  return <Editor id={id} initial={parsed.data} />;
}
