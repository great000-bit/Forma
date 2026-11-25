/** Emails allowed into /admin, from the ADMIN_EMAILS env (comma separated). */
export function adminEmails(raw = process.env.ADMIN_EMAILS ?? ""): string[] {
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

export function isAdminEmail(email: string | null | undefined, raw?: string): boolean {
  if (!email) return false;
  return adminEmails(raw).includes(email.trim().toLowerCase());
}
