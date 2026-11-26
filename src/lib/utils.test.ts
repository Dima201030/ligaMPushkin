import { describe, expect, it } from "vitest";
import { daysUntil, plural, pluralizePlayers, publicCity, publicPhone, winRate } from "./utils";

describe("publicCity", () => {
  it("hides legacy club city values", () => {
    expect(publicCity("Пушкин")).toBe("");
    expect(publicCity("Санкт-Петербург")).toBe("");
    expect(publicCity("Pushkin")).toBe("");
  });

  it("keeps real cities and trims them", () => {
    expect(publicCity(" Москва ")).toBe("Москва");
    expect(publicCity("Казань")).toBe("Казань");
  });

  it("handles empty values", () => {
    expect(publicCity("")).toBe("");
    expect(publicCity("   ")).toBe("");
    expect(publicCity(null)).toBe("");
    expect(publicCity(undefined)).toBe("");
  });
});

describe("publicPhone", () => {
  it("hides synthetic and placeholder phones", () => {
    expect(publicPhone("+79990001122")).toBe("");
    expect(publicPhone("+7 911 000-00-34")).toBe("");
    expect(publicPhone("123")).toBe("");
  });

  it("keeps plausible numbers", () => {
    expect(publicPhone("+7 921 555-12-34")).toBe("+7 921 555-12-34");
  });
});

describe("plural", () => {
  it("selects the Russian form", () => {
    expect(plural(1, "игрок", "игрока", "игроков")).toBe("игрок");
    expect(plural(2, "игрок", "игрока", "игроков")).toBe("игрока");
    expect(plural(5, "игрок", "игрока", "игроков")).toBe("игроков");
    expect(plural(11, "игрок", "игрока", "игроков")).toBe("игроков");
    expect(plural(21, "игрок", "игрока", "игроков")).toBe("игрок");
  });
});

describe("pluralizePlayers", () => {
  it("formats player counts", () => {
    expect(pluralizePlayers(1)).toBe("1 игрок");
    expect(pluralizePlayers(3)).toBe("3 игрока");
    expect(pluralizePlayers(12)).toBe("12 игроков");
  });
});

describe("winRate", () => {
  it("returns 0 without matches", () => {
    expect(winRate(0, 0)).toBe(0);
  });

  it("computes the percentage", () => {
    expect(winRate(3, 1)).toBe(75);
    expect(winRate(1, 2)).toBe(33);
  });
});

describe("daysUntil", () => {
  it("counts whole days ahead", () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntil(inThreeDays)).toBe(3);
  });

  it("returns negative values for the past", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntil(yesterday)).toBe(-1);
  });
});
