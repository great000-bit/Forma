import { createHmac, timingSafeEqual } from "node:crypto";

/** Paystack signs webhook bodies with HMAC SHA512 of the secret key. */
export function verifySignature(rawBody: string, signature: string | null, secret = process.env.PAYSTACK_SECRET_KEY): boolean {
  if (!signature || !secret || !/^[0-9a-f]+$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
