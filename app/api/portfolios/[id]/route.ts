import { NextResponse } from "next/server";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { supabaseServer } from "@/lib/supabase/auth-server";

type Ctx = { params: Promise<{ id: string }> };

/** Autosave from the editor. RLS limits updates to the owner. */
export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await supabaseServer();
  if (!supabase) return NextResponse.json({ error: "Saving isn't set up yet." }, { status: 503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in again to keep saving." }, { status: 401 });

  const parsed = portfolioSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Some fields need fixing." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("portfolios")
    .update({ data: parsed.data, niche: parsed.data.niche, template_id: parsed.data.templateId })
    .eq("id", id)
    .select("updated_at")
    .single();

  if (error || !data) return NextResponse.json({ error: "Couldn't save. Check your connection." }, { status: 500 });
  return NextResponse.json({ updatedAt: data.updated_at });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await supabaseServer();
  if (!supabase) return NextResponse.json({ error: "Not set up." }, { status: 503 });
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't delete." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
