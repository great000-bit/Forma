import { describe, expect, it } from "vitest";
import { adminEmails, isAdminEmail } from "@/lib/admin/access";

describe("admin access", () => {
  it("parses a comma list and ignores junk", () => {
    expect(adminEmails(" A@x.com, ,nope, b@y.io ")).toEqual(["a@x.com", "b@y.io"]);
  });
  it("matches case-insensitively and denies by default", () => {
    expect(isAdminEmail("A@X.com", "a@x.com")).toBe(true);
    expect(isAdminEmail("c@x.com", "a@x.com")).toBe(false);
    expect(isAdminEmail(null, "a@x.com")).toBe(false);
    expect(isAdminEmail("a@x.com", "")).toBe(false);
  });
});
