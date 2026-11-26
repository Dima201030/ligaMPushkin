import { describe, expect, it } from "vitest";
import {
  clubPath,
  isPlatformClubName,
  isPlatformClubSlug,
  normalizeClubSlug,
  parseClubCookie,
  resolveClubSlug,
  stripClubPrefix,
} from "./tenant";

describe("normalizeClubSlug", () => {
  it("accepts valid slugs and trims/cases them", () => {
    expect(normalizeClubSlug(" Mr-Pushkin ")).toBe("mr-pushkin");
    expect(normalizeClubSlug("demo-club-5275")).toBe("demo-club-5275");
  });

  it("rejects empty, unsafe and malformed slugs", () => {
    expect(normalizeClubSlug(null)).toBeNull();
    expect(normalizeClubSlug("")).toBeNull();
    expect(normalizeClubSlug("  ")).toBeNull();
    expect(normalizeClubSlug("bad slug")).toBeNull();
    expect(normalizeClubSlug("../etc/passwd")).toBeNull();
    expect(normalizeClubSlug("клуб")).toBeNull();
  });
});

describe("resolveClubSlug", () => {
  it("returns the first valid candidate", () => {
    expect(resolveClubSlug(null, "bad slug", "second-club", "third-club")).toBe("second-club");
  });

  it("falls back to the default tenant", () => {
    expect(resolveClubSlug(null, undefined, "")).toBe("mr-pushkin");
  });
});

describe("stripClubPrefix", () => {
  it("keeps plain paths unchanged", () => {
    expect(stripClubPrefix("/tournaments")).toEqual({ clubSlug: null, restPath: "/tournaments" });
    expect(stripClubPrefix("/")).toEqual({ clubSlug: null, restPath: "/" });
  });

  it("extracts an old club prefix and keeps the rest", () => {
    expect(stripClubPrefix("/c/mr-pushkin")).toEqual({ clubSlug: "mr-pushkin", restPath: "/" });
    expect(stripClubPrefix("/c/mr-pushkin/rating")).toEqual({
      clubSlug: "mr-pushkin",
      restPath: "/rating",
    });
  });

  it("ignores malformed prefixes", () => {
    expect(stripClubPrefix("/c/Bad Slug/rating")).toEqual({
      clubSlug: null,
      restPath: "/c/Bad Slug/rating",
    });
  });
});

describe("parseClubCookie", () => {
  it("reads pairly_club from a cookie header", () => {
    expect(parseClubCookie("a=1; pairly_club=mr-pushkin; b=2")).toBe("mr-pushkin");
  });

  it("normalizes and validates values", () => {
    expect(parseClubCookie("pairly_club=MR-PUSHKIN")).toBe("mr-pushkin");
    expect(parseClubCookie("pairly_club=bad slug")).toBeNull();
    expect(parseClubCookie("other=1")).toBeNull();
    expect(parseClubCookie(null)).toBeNull();
  });
});

describe("clubPath", () => {
  it("builds a club path from the current page", () => {
    expect(clubPath("mr-pushkin")).toBe("/c/mr-pushkin");
    expect(clubPath("mr-pushkin", "/rating")).toBe("/c/mr-pushkin/rating");
    expect(clubPath("mr-pushkin", "/c/old/rating")).toBe("/c/mr-pushkin/rating");
  });

  it("falls back to the default slug", () => {
    expect(clubPath("bad slug")).toBe("/c/mr-pushkin");
  });
});

describe("isPlatformClubSlug / isPlatformClubName", () => {
  it("treats pairly as a reserved platform brand, not a club", () => {
    expect(isPlatformClubSlug("pairly")).toBe(true);
    expect(isPlatformClubSlug("Pairly")).toBe(true);
    expect(isPlatformClubSlug("mr-pushkin")).toBe(false);
    expect(isPlatformClubName("Pairly")).toBe(true);
    expect(isPlatformClubName("Mr. Pushkin")).toBe(false);
  });
});
