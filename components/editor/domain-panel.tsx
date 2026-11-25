"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Globe, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DnsRecord } from "@/lib/domains/hostname";
import { hostnameProblem, normalizeHostname } from "@/lib/domains/hostname";

type State = { hostname: string | null; state?: "active" | "pending" | "unchecked"; records?: DnsRecord[] };

/** Connect your own domain: enter it, add one DNS record, Forma checks until it's live. */
export function DomainPanel({ id }: { id: string }) {
  const [data, setData] = useState<State | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/portfolios/${id}/domain`, { cache: "no-store" });
    if (res.ok) setData((await res.json()) as State);
    else setData({ hostname: null });
  }, [id]);

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(t);
  }, [refresh]);

  // While waiting on DNS, check again every 20 seconds.
  useEffect(() => {
    if (data?.state !== "pending") return;
    const t = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(t);
  }, [data?.state, refresh]);

  const connect = async () => {
    const host = normalizeHostname(input);
    const problem = hostnameProblem(host);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/portfolios/${id}/domain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: host }),
    });
    const json = (await res.json().catch(() => ({}))) as State & { error?: string; upgrade?: boolean };
    setBusy(false);
    if (!res.ok) {
      setUpgrade(Boolean(json.upgrade));
      return setError(json.error ?? "Couldn't connect that domain.");
    }
    setData(json);
  };

  const remove = async () => {
    setBusy(true);
    const res = await fetch(`/api/portfolios/${id}/domain`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setData({ hostname: null });
      setInput("");
    } else setError("Couldn't remove the domain. Try again.");
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(value);
    window.setTimeout(() => setCopied(null), 1500);
  };

  if (!data) return <div className="skeleton h-24" />;

  if (!data.hostname) {
    return (
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-label text-text">
          <Globe className="size-4 text-accent" aria-hidden="true" /> Use your own domain
        </p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="amara.com"
            aria-label="Your domain"
            aria-invalid={error ? true : undefined}
            autoCapitalize="none"
            spellCheck={false}
          />
          <Button variant="secondary" loading={busy} onClick={() => void connect()}>Connect</Button>
        </div>
        {error ? (
          <p role="alert" className="text-body-sm text-error">
            {error}{" "}
            {upgrade ? <a href="/dashboard/billing" className="text-accent underline">See Pro</a> : null}
          </p>
        ) : null}
      </div>
    );
  }

  const live = data.state === "active";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-label text-text">
          <Globe className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate font-mono">{data.hostname}</span>
        </p>
        <span
          className={
            live
              ? "inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-caption text-success"
              : "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-caption text-accent"
          }
        >
          {live ? <Check className="size-3" aria-hidden="true" /> : <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
          {live ? "Live" : data.state === "unchecked" ? "Waiting for setup" : "Checking DNS"}
        </span>
      </div>

      {!live ? (
        <>
          <p className="text-body-sm text-text-soft">
            Add {data.records && data.records.length > 1 ? "these records" : "this record"} where you bought the domain. It can take a few minutes, sometimes a few hours.
          </p>
          <ul className="flex flex-col gap-2">
            {(data.records ?? []).map((r) => (
              <li key={`${r.type}-${r.name}-${r.value}`} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-control border border-border bg-white/[0.02] px-3 py-2 font-mono text-caption">
                <span className="text-text">{r.type}</span>
                <span className="min-w-0">
                  <span className="block truncate text-text-muted">{r.name}</span>
                  <span className="block truncate text-text">{r.value}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void copy(r.value)}
                  className="inline-flex size-9 items-center justify-center rounded-control text-text-muted hover:bg-accent-soft hover:text-text"
                  aria-label={`Copy ${r.type} value`}
                >
                  {copied === r.value ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" onClick={() => void refresh()}>
            <RefreshCw aria-hidden="true" /> Check now
          </Button>
        </>
      ) : null}

      {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
      <button type="button" onClick={() => void remove()} disabled={busy} className="self-start text-body-sm text-text-muted hover:text-error">
        Remove domain
      </button>
    </div>
  );
}
