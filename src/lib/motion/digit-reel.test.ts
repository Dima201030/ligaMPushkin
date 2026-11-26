import { describe, expect, it } from "vitest";
import {
  reelCyclesForIndex,
  reelDelayMs,
  reelFaces,
  reelOffsetEm,
  tokenizeFormatted,
} from "./digit-reel";

describe("tokenizeFormatted", () => {
  it("splits digits and separators", () => {
    expect(tokenizeFormatted("1 542")).toEqual([
      { kind: "digit", digit: 1 },
      { kind: "sep", char: " " },
      { kind: "digit", digit: 5 },
      { kind: "digit", digit: 4 },
      { kind: "digit", digit: 2 },
    ]);
  });

  it("keeps narrow no-break spaces as separators", () => {
    expect(tokenizeFormatted("1\u202f542")).toEqual([
      { kind: "digit", digit: 1 },
      { kind: "sep", char: "\u202f" },
      { kind: "digit", digit: 5 },
      { kind: "digit", digit: 4 },
      { kind: "digit", digit: 2 },
    ]);
  });

  it("handles a single digit", () => {
    expect(tokenizeFormatted("7")).toEqual([{ kind: "digit", digit: 7 }]);
  });
});

describe("reelOffsetEm", () => {
  it("lands on the digit after full cycles", () => {
    expect(reelOffsetEm(5, 2)).toBe(-(2 * 10 + 5));
    expect(reelOffsetEm(0, 1)).toBe(-10);
  });

  it("normalizes out-of-range digits", () => {
    expect(reelOffsetEm(15, 1)).toBe(-(10 + 5));
  });
});

describe("reelFaces", () => {
  it("ends on the target digit", () => {
    const faces = reelFaces(3, 1);
    expect(faces.at(-1)).toBe(3);
    expect(faces).toHaveLength(10 + 4);
  });
});

describe("reelCyclesForIndex", () => {
  it("gives rightmost digits more spin", () => {
    expect(reelCyclesForIndex(0, 3)).toBe(3);
    expect(reelCyclesForIndex(2, 3)).toBe(1);
  });
});

describe("reelDelayMs", () => {
  it("staggers left-to-right", () => {
    expect(reelDelayMs(0)).toBe(0);
    expect(reelDelayMs(2, 90)).toBe(180);
  });
});
