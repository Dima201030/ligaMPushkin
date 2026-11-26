import { describe, expect, it } from "vitest";
import {
  validateBirthAge,
  validateClubFields,
  validateCoverFile,
} from "./club-limits";

describe("validateClubFields", () => {
  it("rejects short name and slug", () => {
    const errors = validateClubFields({ name: "ab", slug: "ab" });
    expect(errors.name).toBeTruthy();
    expect(errors.slug).toBeTruthy();
  });

  it("accepts valid club", () => {
    const errors = validateClubFields({
      name: "Demo Tennis",
      slug: "demo-tennis",
      city: "СПб",
    });
    expect(errors).toEqual({});
  });
});

describe("validateCoverFile", () => {
  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(6 * 1024 * 1024)], "x.jpg", {
      type: "image/jpeg",
    });
    expect(validateCoverFile(file)).toMatch(/5 МБ/);
  });

  it("rejects gif", () => {
    const file = new File([new Uint8Array(16)], "x.gif", { type: "image/gif" });
    expect(validateCoverFile(file)).toMatch(/JPEG/);
  });
});

describe("validateBirthAge", () => {
  it("rejects too young and too old", () => {
    expect(validateBirthAge("2024-01-01", new Date("2026-11-26"))).toMatch(/Возраст/);
    expect(validateBirthAge("1900-01-01", new Date("2026-11-26"))).toMatch(/Возраст/);
    expect(validateBirthAge("1990-05-01", new Date("2026-11-26"))).toBeNull();
  });
});
