import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/auth-server";

/** OAuth and email-confirmation landing: exchanges the code for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  let reason = url.searchParams.get("error_description") ?? (code ? "exchange" : "no_code");
  const supabase = await supabaseServer();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    reason = error.message;
    console.error("auth callback", error.message);
  }
  const back = new URL("/login", url.origin);
  back.searchParams.set("error", "auth");
  back.searchParams.set("reason", reason.slice(0, 120));
  return NextResponse.redirect(back);
}
