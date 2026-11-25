"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRICES, formatNaira, type Interval } from "@/lib/billing/plans";

/** Starts Paystack checkout for the chosen interval. */
export function UpgradeButtons({ live }: { live: boolean }) {
  const [busy, setBusy] = useState<Interval | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (interval: Interval) => {
    setBusy(interval);
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && json.url) {
      window.location.assign(json.url);
      return;
    }
    setBusy(null);
    setError(json.error ?? "Couldn't start checkout.");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" disabled={!live} loading={busy === "monthly"} onClick={() => void go("monthly")}>
          {formatNaira(PRICES.monthly.ngn)} a month
        </Button>
        <Button size="lg" variant="secondary" disabled={!live} loading={busy === "yearly"} onClick={() => void go("yearly")}>
          {formatNaira(PRICES.yearly.ngn)} a year
        </Button>
      </div>
      {!live ? <p className="text-body-sm text-text-muted">Payments open at launch. Everything is unlocked until then.</p> : null}
      {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
    </div>
  );
}

export function ManageButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setBusy(true);
    const res = await fetch("/api/billing/manage", { method: "POST" });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && json.url) return window.location.assign(json.url);
    setBusy(false);
    setError(json.error ?? "Couldn't open billing.");
  };
  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" loading={busy} onClick={() => void go()}>
        Change card or cancel
      </Button>
      {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
    </div>
  );
}
