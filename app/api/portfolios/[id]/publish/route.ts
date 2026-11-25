import { NextResponse } from "next/server";
import { z } from "zod";
import { portfolioUrl, slugProblem } from "@/lib/portfolio/slug";
import { supabaseServer } from "@/lib/supabase/auth-server";

type Ctx = { params: Promise<{ id: string }> };
const body = z.object({ slug: z.string().trim().toLowerCase().max(40) });

async function owner() {
  const supabase = await supabaseServer();
  if (!supabase) return { supabase: null, user: null } as const;
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user } as const;
}

/** Publish (or move) a portfolio to a slug. */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user } = await owner();
  if (!supabase) return NextResponse.json({ error: "Publishing isn't set up yet." }, { status: 503 });
  if (!user) return NextResponse.json({ error: "Sign in again to publish." }, { status: 401 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a link name." }, { status: 400 });
  const problem = slugProblem(parsed.data.slug);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const { data, error } = await supabase
    .from("portfolios")
    .update({ slug: parsed.data.slug, status: "published" })
    .eq("id", id)
    .select("slug")
    .single();

  if (error?.code === "23505") return NextResponse.json({ error: "Someone already has that link. Try another." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Couldn't publish right now." }, { status: 500 });

  const origin = new URL(request.url).origin;
  return NextResponse.json({ slug: data.slug, url: portfolioUrl(data.slug, origin, process.env.PORTFOLIO_ROOT_DOMAIN) });
}

/** Unpublish: the link stops working, the portfolio stays as a draft. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const { supabase, user } = await owner();
  if (!supabase || !user) return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  const { error } = await supabase.from("portfolios").update({ status: "draft" }).eq("id", id);
  if (error) return NextResponse.json({ error: "Couldn't unpublish." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
