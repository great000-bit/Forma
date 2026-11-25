import { NextResponse } from "next/server";
import { manageLink, paystackConfigured } from "@/lib/billing/paystack";
import { supabaseServer } from "@/lib/supabase/auth-server";

/** Sends people to Paystack's page for changing card or cancelling. */
export async function POST() {
  if (!paystackConfigured()) return NextResponse.json({ error: "Payments open at launch." }, { status: 503 });
  const supabase = await supabaseServer();
  if (!supabase) return NextResponse.json({ error: "Not set up." }, { status: 503 });
  const { data } = await supabase.from("subscriptions").select("subscription_code").maybeSingle();
  const code = (data as { subscription_code: string | null } | null)?.subscription_code;
  if (!code) return NextResponse.json({ error: "No subscription found." }, { status: 404 });
  const link = await manageLink(code);
  if (!link) return NextResponse.json({ error: "Couldn't open billing. Try again." }, { status: 502 });
  return NextResponse.json({ url: link });
}
