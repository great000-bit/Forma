import { describe, expect, it } from "vitest";
import { hostnameProblem, isApex, isAppHost, normalizeHostname, routingRecord } from "@/lib/domains/hostname";

describe("custom domains", () => {
  it("normalises what people paste", () => {
    expect(normalizeHostname("  https://www.Amara.com/work?x=1 ")).toBe("www.amara.com");
    expect(normalizeHostname("amara.com.")).toBe("amara.com");
    expect(normalizeHostname("amara.com:8080")).toBeNull();
    expect(normalizeHostname("")).toBeNull();
  });

  it("rejects hosts that can't be a portfolio domain", () => {
    expect(hostnameProblem("amara")).toMatch(/ending/);
    expect(hostnameProblem("192.168.0.1")).not.toBeNull();
    expect(hostnameProblem("amara.forma.app")).toMatch(/own/);
    expect(hostnameProblem("site.vercel.app")).toMatch(/own/);
    expect(hostnameProblem("-bad.com")).not.toBeNull();
    expect(hostnameProblem("amara.com")).toBeNull();
    expect(hostnameProblem("portfolio.amara.com.ng")).toBeNull();
  });

  it("knows apex from subdomain, including .com.ng", () => {
    expect(isApex("amara.com")).toBe(true);
    expect(isApex("amara.com.ng")).toBe(true);
    expect(isApex("www.amara.com")).toBe(false);
    expect(isApex("work.amara.com.ng")).toBe(false);
  });

  it("gives the right DNS record", () => {
    expect(routingRecord("amara.com")).toEqual({ type: "A", name: "@", value: "76.76.21.21" });
    expect(routingRecord("www.amara.com")).toEqual({ type: "CNAME", name: "www", value: "cname.vercel-dns.com" });
    expect(routingRecord("work.amara.com.ng")).toEqual({ type: "CNAME", name: "work", value: "cname.vercel-dns.com" });
  });

  it("never treats Forma's own hosts as custom domains", () => {
    const site = "https://forma.app";
    expect(isAppHost("forma.app", site, undefined)).toBe(true);
    expect(isAppHost("www.forma.app", site, undefined)).toBe(true);
    expect(isAppHost("forma-nine-ecru.vercel.app", site, undefined)).toBe(true);
    expect(isAppHost("localhost", site, undefined)).toBe(true);
    expect(isAppHost("amara.forma.app", site, "forma.app")).toBe(true);
    expect(isAppHost("amara.com", site, "forma.app")).toBe(false);
  });
});
