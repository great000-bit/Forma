import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/billing/paystack";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Paystack webhook. Verifies the signature, records each event once, then
 * moves the subscription row. Returning non-200 makes Paystack retry, which
 * we rely on when events arrive out of order.
 */
type PaystackEvent = {
  event: string;
  data: {
    id?: number;
    reference?: string;
    paid_at?: string;
    status?: string;
    subscription_code?: string;
    email_token?: string;
    next_payment_date?: string | null;
    metadata?: { user_id?: string } | string | null;
    customer?: { customer_code?: string; email?: string };
    plan?: { plan_code?: string; interval?: string } | Record<string, never>;
    subscription?: { subscription_code?: string };
  };
};

const GRACE_DAYS = 3;

function periodEnd(from: string | undefined, interval: string | undefined): string {
  const d = from ? new Date(from) : new Date();
  if (interval === "annually") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() + GRACE_DAYS);
  return d.toISOString();
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  let evt: PaystackEvent;
  try {
    evt = JSON.parse(raw) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const { event, data } = evt;
  const key = `${event}:${data.id ?? data.subscription_code ?? data.reference ?? "unknown"}`;

  // Once only. A duplicate insert means we've handled it.
  const { error: dupe } = await admin.from("payment_events").insert({ id: key, provider: "paystack", type: event, payload: evt });
  if (dupe?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });

  const customer = data.customer?.customer_code;
  const metadata: { user_id?: string } = typeof data.metadata === "object" && data.metadata ? data.metadata : {};

  const forget = async () => {
    // Let Paystack retry: remove the marker so the retry is processed.
    await admin.from("payment_events").delete().eq("id", key);
  };

  if (event === "charge.success") {
    const plan = data.plan && "plan_code" in data.plan ? data.plan : null;
    if (!plan?.plan_code) return NextResponse.json({ ok: true, ignored: "one-off charge" });

    const userId = metadata.user_id;
    const update = {
      plan: "pro",
      status: "active",
      provider: "paystack",
      customer_code: customer ?? null,
      current_period_end: periodEnd(data.paid_at, plan.interval),
      updated_at: new Date().toISOString(),
    };
    const res = userId
      ? await admin.from("subscriptions").upsert({ user_id: userId, ...update })
      : await admin.from("subscriptions").update(update).eq("customer_code", customer ?? "");
    if (res.error) {
      await forget();
      return NextResponse.json({ error: "save failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (event === "subscription.create") {
    const res = await admin
      .from("subscriptions")
      .update({
        subscription_code: data.subscription_code ?? null,
        email_token: data.email_token ?? null,
        status: "active",
        ...(data.next_payment_date ? { current_period_end: data.next_payment_date } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("customer_code", customer ?? "")
      .select("user_id");
    if (res.error || !res.data?.length) {
      // The first charge hasn't landed yet. Ask Paystack to try again later.
      await forget();
      return NextResponse.json({ error: "customer not linked yet" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  const subCode = data.subscription_code ?? data.subscription?.subscription_code;
  const statusFor: Record<string, string> = {
    "subscription.not_renew": "non_renewing",
    "subscription.disable": "cancelled",
    "invoice.payment_failed": "attention",
  };
  const status = statusFor[event];
  if (status && subCode) {
    const res = await admin
      .from("subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("subscription_code", subCode);
    if (res.error) {
      await forget();
      return NextResponse.json({ error: "save failed" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
