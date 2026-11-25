"use client";

import { useEffect } from "react";

/** Sends one anonymous view count after the page has settled. */
export function ViewBeacon({ id }: { id: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const payload = JSON.stringify({
        id,
        referrer: document.referrer || undefined,
        ref: params.get("ref") ?? params.get("utm_source") ?? undefined,
      });
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        void fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [id]);
  return null;
}
