"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify, slugProblem } from "@/lib/portfolio/slug";
import { DomainPanel } from "@/components/editor/domain-panel";

/** Publish flow: pick a link name, publish, then share (copy, WhatsApp, QR). */
export function PublishDialog({ id, name, published }: { id: string; name: string; published: { slug: string; url: string } | null }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(published?.slug ?? slugify(name));
  const [live, setLive] = useState(published);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    QRCode.toDataURL(live.url, { margin: 1, width: 320, color: { dark: "#0E0E10", light: "#FFFFFF" } })
      .then((data) => !cancelled && setQr(data))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [live]);

  const publish = async () => {
    const problem = slugProblem(slug);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { slug?: string; url?: string; error?: string };
      if (!res.ok || !data.slug || !data.url) throw new Error(data.error ?? "Couldn't publish");
      setLive({ slug: data.slug, url: data.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't publish");
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    setBusy(true);
    const res = await fetch(`/api/portfolios/${id}/publish`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setLive(null);
      setQr(null);
    } else setError("Couldn't unpublish. Try again.");
  };

  const copy = async () => {
    if (!live) return;
    await navigator.clipboard.writeText(live.url).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = live ? `https://wa.me/?text=${encodeURIComponent(`Here's my portfolio: ${live.url}`)}` : "#";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>{live ? "Share" : "Publish"}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-32px)] max-h-[calc(100dvh-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-dialog border border-border bg-surface-raised backdrop-blur-2xl p-8 shadow-pop data-[state=open]:animate-fade-in">
          <Dialog.Close className="absolute top-5 right-5 inline-flex size-11 items-center justify-center rounded-control text-text-muted hover:bg-accent-soft hover:text-text" aria-label="Close">
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>

          {!live ? (
            <>
              <Dialog.Title className="text-h3">Publish your portfolio</Dialog.Title>
              <Dialog.Description className="mt-2 text-body-sm text-text-soft">Pick the name for your link. You can change it later.</Dialog.Description>
              <label htmlFor="slug" className="mt-6 block text-label text-text">Link name</label>
              <div className="mt-2 flex items-center gap-2">
                <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} aria-invalid={error ? true : undefined} />
              </div>
              <p className="mt-2 font-mono text-caption text-text-muted">{slug || "your-name"}.forma.app</p>
              {error ? <p role="alert" className="mt-3 text-body-sm text-error">{error}</p> : null}
              <Button className="mt-6 w-full" size="lg" loading={busy} onClick={() => void publish()}>Publish</Button>
            </>
          ) : (
            <>
              <Dialog.Title className="text-h3">Your portfolio is live</Dialog.Title>
              <Dialog.Description className="mt-2 text-body-sm text-text-soft">Send this link to anyone who wants to work with you.</Dialog.Description>
              <div className="mt-6 flex items-center gap-2 rounded-control border border-border bg-bg p-2 pl-4">
                <span className="flex-1 truncate font-mono text-body-sm text-text">{live.url.replace(/^https?:\/\//, "")}</span>
                <Button size="sm" variant="secondary" onClick={() => void copy()}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button asChild variant="secondary">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" /> WhatsApp</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={live.url} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" /> Open</a>
                </Button>
              </div>
              {qr ? (
                <div className="mt-6 flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
                  <img src={qr} alt={`QR code for ${live.url}`} width={160} height={160} className="rounded-control border border-border" />
                  <a href={qr} download={`${live.slug}-qr.png`} className="text-label text-accent hover:underline">Download QR code</a>
                </div>
              ) : null}
              <div className="mt-6 border-t border-border pt-6">
                <DomainPanel id={id} />
              </div>
              <button type="button" onClick={() => void unpublish()} disabled={busy} className="mt-6 w-full text-center text-body-sm text-text-muted hover:text-error">
                Unpublish
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
