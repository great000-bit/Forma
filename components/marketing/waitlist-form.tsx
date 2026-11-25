"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ease } from "@/lib/motion";
import { WAITLIST_NICHE_OPTIONS } from "@/lib/niches";
import {
  waitlistSchema,
  type WaitlistField,
  type WaitlistResponse,
} from "@/lib/validation/waitlist";

type Values = Record<WaitlistField, string>;
type Errors = Partial<Record<WaitlistField, string>>;
type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

const FIELDS: WaitlistField[] = ["name", "email", "niche"];

function validateField(field: WaitlistField, value: string): string | undefined {
  const result = waitlistSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-body-sm text-error">
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function WaitlistForm() {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    niche: `${uid}-niche`,
  } satisfies Record<WaitlistField, string>;

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const nicheRef = useRef<HTMLSelectElement>(null);

  const [values, setValues] = useState<Values>({ name: "", email: "", niche: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const update = (field: WaitlistField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear an existing error as soon as the input becomes valid; never block typing.
    if (errors[field] && !validateField(field, value)) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
    if (status === "duplicate" || status === "error") setStatus("idle");
  };

  const onBlur = (field: WaitlistField) => {
    if (!values[field]) return; // don't nag on empty fields until submit
    setErrors((e) => ({ ...e, [field]: validateField(field, values[field]) }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const parsed = waitlistSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as WaitlistField;
        next[field] ??= issue.message;
      }
      setErrors(next);
      const first = FIELDS.find((f) => next[f]);
      if (first) ({ name: nameRef, email: emailRef, niche: nicheRef })[first].current?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => null)) as WaitlistResponse | null;

      if (data?.ok) {
        setSubmittedEmail(parsed.data.email);
        setStatus("success");
        return;
      }
      if (data?.error === "duplicate") {
        setStatus("duplicate");
        return;
      }
      if (data?.error === "invalid" && data.fieldErrors) {
        const next: Errors = {};
        for (const f of FIELDS) next[f] = data.fieldErrors[f]?.[0];
        setErrors(next);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          role="status"
          className="flex flex-col items-center py-4 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="flex size-[72px] items-center justify-center rounded-full bg-accent-soft">
            <Check className="size-8 text-accent" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="mt-6 text-h3-m md:text-h3">You&apos;re on the list.</h3>
          <p className="mt-2 text-body text-text-soft">
            We&apos;ll email <span className="font-medium text-text">{submittedEmail}</span> when
            your spot opens.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={onSubmit}
          className="flex flex-col gap-5 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          aria-describedby={`${uid}-status`}
        >
          <div>
            <Label htmlFor={ids.name}>Name</Label>
            <Input
              ref={nameRef}
              id={ids.name}
              name="name"
              autoComplete="name"
              placeholder="Amara Okafor"
              className="mt-2"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() => onBlur("name")}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${ids.name}-error` : undefined}
            />
            <FieldError id={`${ids.name}-error`} message={errors.name} />
          </div>

          <div>
            <Label htmlFor={ids.email}>Email</Label>
            <Input
              ref={emailRef}
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => onBlur("email")}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${ids.email}-error` : undefined}
            />
            <FieldError id={`${ids.email}-error`} message={errors.email} />
          </div>

          <div>
            <Label htmlFor={ids.niche}>What do you do?</Label>
            <div className="mt-2">
              <Select
                ref={nicheRef}
                id={ids.niche}
                name="niche"
                value={values.niche}
                onChange={(e) => {
                  update("niche", e.target.value);
                  setErrors((er) => ({ ...er, niche: validateField("niche", e.target.value) }));
                }}
                aria-invalid={errors.niche ? true : undefined}
                aria-describedby={errors.niche ? `${ids.niche}-error` : undefined}
                className={values.niche ? undefined : "text-text-muted"}
              >
                <option value="" disabled>
                  Pick your field
                </option>
                {WAITLIST_NICHE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <FieldError id={`${ids.niche}-error`} message={errors.niche} />
          </div>

          <Button type="submit" size="lg" loading={status === "submitting"} className="mt-3 w-full">
            {status === "submitting" ? "Joining" : "Join the waitlist"}
          </Button>

          <div id={`${uid}-status`} role="status" aria-live="polite" className="min-h-0">
            {status === "duplicate" ? (
              <p className="flex items-start gap-2 text-body-sm text-text-soft">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                You&apos;re already on the list with that email. We&apos;ll be in touch.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="flex items-start gap-2 text-body-sm text-error">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Something went wrong on our side. Try again in a minute.
              </p>
            ) : null}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
