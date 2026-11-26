import { describe, expect, it } from "vitest";
import {
  easeOutCubic,
  gaugeFillAt,
  gaugeRatio,
  ringStroke,
} from "./gauge-fill";

describe("easeOutCubic", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("eases ahead of linear mid-way", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("gaugeFillAt", () => {
  it("returns endpoints", () => {
    expect(gaugeFillAt(0, 0, 80)).toBe(0);
    expect(gaugeFillAt(1, 0, 80)).toBe(80);
  });

  it("interpolates with easing", () => {
    const mid = gaugeFillAt(0.5, 0, 100);
    expect(mid).toBeGreaterThan(50);
    expect(mid).toBeLessThan(100);
  });
});

describe("gaugeRatio", () => {
  it("clamps to 0..1", () => {
    expect(gaugeRatio(-10)).toBe(0);
    expect(gaugeRatio(50)).toBe(0.5);
    expect(gaugeRatio(150)).toBe(1);
  });

  it("handles zero max", () => {
    expect(gaugeRatio(10, 0)).toBe(0);
  });
});

describe("ringStroke", () => {
  it("maps empty and full fill to dash offsets", () => {
    const empty = ringStroke(100, 8, 0);
    const full = ringStroke(100, 8, 1);
    expect(empty.strokeDashoffset).toBeCloseTo(empty.circumference);
    expect(full.strokeDashoffset).toBeCloseTo(0);
  });
});
