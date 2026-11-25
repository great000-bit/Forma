"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseBrowser } from "@/lib/supabase/browser";

const schema = z.object({
  email: z.string().trim().pipe(z.email("That email doesn't look right")),
  password: z.string().min(8, "Use at least 8 characters"),
});

/** Email + password sign in / sign up, and Google. Minimal by design. */
export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = supabaseBrowser();

  const google = async () => {
    if (!supabase) return setError("Sign in isn't set up yet.");
    setBusy(true);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (e) {
      setError("Google sign in didn't work. Try email instead.");
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNote(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your details");
    if (!supabase) return setError("Sign in isn't set up yet.");

    setBusy(true);
    if (mode === "signin") {
      const { error: e } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (e) return setError("That email and password don't match.");
      router.replace(next);
      router.refresh();
    } else {
      const { data, error: e } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (e) return setError(e.message.includes("registered") ? "You already have an account. Sign in instead." : "Couldn't create your account. Try again.");
      if (data.session) {
        router.replace(next);
        router.refresh();
      } else {
        setNote(`Check ${parsed.data.email} for a link to confirm your account.`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button type="button" variant="secondary" size="lg" onClick={google} disabled={busy} className="w-full">
        Continue with Google
      </Button>
      <div className="flex items-center gap-4 text-caption text-text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p role="alert" className="text-body-sm text-error">{error}</p> : null}
        {note ? <p role="status" className="text-body-sm text-text-soft">{note}</p> : null}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-body-sm text-text-soft">
        {mode === "signin" ? "New to Forma? " : "Already have an account? "}
        <button type="button" className="font-medium text-accent hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
