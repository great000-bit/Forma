import { describe, expect, it } from "vitest";
import { waitlistSchema } from "@/lib/validation/waitlist";

describe("waitlistSchema", () => {
  const valid = { name: "Amara Okafor", email: "amara@example.com", niche: "product-design" };

  it("accepts a valid signup", () => {
    expect(waitlistSchema.safeParse(valid).success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = waitlistSchema.parse({ ...valid, email: "  Amara@Example.COM " });
    expect(result.email).toBe("amara@example.com");
  });

  it("trims the name", () => {
    expect(waitlistSchema.parse({ ...valid, name: "  Amara  " }).name).toBe("Amara");
  });

  it("rejects an empty name", () => {
    const result = waitlistSchema.safeParse({ ...valid, name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a bad email with a human message", () => {
    const result = waitlistSchema.safeParse({ ...valid, email: "amara@" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("That email doesn't look right");
    }
  });

  it("accepts the 'other' niche", () => {
    expect(waitlistSchema.safeParse({ ...valid, niche: "other" }).success).toBe(true);
  });

  it("rejects an unknown niche", () => {
    expect(waitlistSchema.safeParse({ ...valid, niche: "astrology" }).success).toBe(false);
  });
});
