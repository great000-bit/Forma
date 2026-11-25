import { NextResponse } from "next/server";
import { z } from "zod";
import { paystackConfigured, startCheckout } from "@/lib/billing/paystack";
import { supabaseServer } from "@/lib/supabase/auth-server";

const body = z.object({ interval: z.enum(["monthly", "yearly"]) });

/** Returns a Paystack checkout URL for the signed-in user. */
export async function POST(request: Request) {
  if (!paystackConfigured()) return NextResponse.json({ error: "Payments open at launch." }, { status: 503 });
  const supabase = await supabaseServer();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const user = data.user;
  if (!user?.email) return NextResponse.json({ error: "Sign in again to upgrade." }, { status: 401 });

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pick monthly or yearly." }, { status: 400 });

  const origin = new URL(request.url).origin;
  const checkout = await startCheckout({
    email: user.email,
    userId: user.id,
    interval: parsed.data.interval,
    callbackUrl: `${origin}/dashboard/billing?paid=1`,
  });
  if (!checkout) return NextResponse.json({ error: "Couldn't start checkout. Try again." }, { status: 502 });
  return NextResponse.json({ url: checkout.authorization_url });
}
