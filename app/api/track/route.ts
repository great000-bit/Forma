import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySource } from "@/lib/analytics/source";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase/server";

const body = z.object({ id: z.uuid(), referrer: z.string().max(500).optional(), ref: z.string().max(40).optional() });

/** Counts one portfolio view. Anonymous: no cookies, nothing stored about the visitor. */
export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  // One view per visitor per portfolio per few minutes, roughly.
  if (!rateLimit(clientKey(request, `view:${parsed.data.id}`), 1, 5 * 60_000).ok) return new NextResponse(null, { status: 204 });
  if (/bot|crawl|spider|preview|facebookexternalhit|whatsapp/i.test(request.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = getSupabase();
  if (supabase) {
    await supabase.rpc("record_view", {
      p_portfolio: parsed.data.id,
      p_source: classifySource(parsed.data.referrer, parsed.data.ref),
    });
  }
  return new NextResponse(null, { status: 204 });
}
