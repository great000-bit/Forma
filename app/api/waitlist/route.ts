import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase/server";
import { waitlistSchema, type WaitlistResponse } from "@/lib/validation/waitlist";

function reply(body: WaitlistResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, error: "invalid" }, 400);
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return reply(
      { ok: false, error: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      400,
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.error("[waitlist] Supabase environment variables are not set");
    return reply({ ok: false, error: "unavailable" }, 503);
  }

  const { error } = await supabase.from("waitlist").insert(parsed.data);

  if (error) {
    // 23505: unique_violation on lower(email)
    if (error.code === "23505") return reply({ ok: false, error: "duplicate" }, 409);
    console.error("[waitlist] Insert failed:", error.message);
    return reply({ ok: false, error: "server" }, 500);
  }

  return reply({ ok: true }, 201);
}
