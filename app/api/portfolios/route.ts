import { NextResponse } from "next/server";
import { z } from "zod";
import { answerSchema } from "@/lib/ai/contracts";
import { portfolioSchema } from "@/lib/portfolio/schema";
import { supabaseServer } from "@/lib/supabase/auth-server";

const saveSchema = z.object({
  id: z.uuid().optional(),
  portfolio: portfolioSchema,
  answers: z.array(answerSchema).max(30).optional(),
});

/** Save (create or update) the signed-in user's portfolio. RLS enforces ownership. */
export async function POST(request: Request) {
  const supabase = await supabaseServer();
  if (!supabase) return NextResponse.json({ error: "Saving isn't set up yet." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to save your portfolio." }, { status: 401 });

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That portfolio couldn't be saved." }, { status: 400 });

  const { id, portfolio, answers } = parsed.data;
  const row = { user_id: auth.user.id, niche: portfolio.niche, template_id: portfolio.templateId, data: portfolio };

  const result = id
    ? await supabase.from("portfolios").update(row).eq("id", id).select("id").single()
    : await supabase.from("portfolios").insert(row).select("id").single();

  if (result.error || !result.data) {
    console.error("[portfolios] save failed:", result.error?.message);
    return NextResponse.json({ error: "Couldn't save right now. Try again." }, { status: 500 });
  }

  if (answers?.length && !id) {
    await supabase.from("interviews").insert({ user_id: auth.user.id, portfolio_id: result.data.id, answers });
  }

  return NextResponse.json({ id: result.data.id });
}
