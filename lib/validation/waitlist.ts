import { z } from "zod";
import { WAITLIST_NICHE_OPTIONS } from "@/lib/niches";

const nicheValues = new Set(WAITLIST_NICHE_OPTIONS.map((o) => o.value));

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(80, "Keep your name under 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email")
    .max(254, "That email is too long")
    .pipe(z.email("That email doesn't look right")),
  niche: z.string().refine((value) => nicheValues.has(value), "Pick the field closest to your work"),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistField = keyof WaitlistInput;

export type WaitlistResponse =
  | { ok: true }
  | {
      ok: false;
      error: "invalid" | "duplicate" | "unavailable" | "server";
      fieldErrors?: Partial<Record<WaitlistField, string[]>>;
    };
