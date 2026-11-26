/** Token in a fixed-width numeric reel (digit or separator). */
export type ReelToken =
  | { kind: "digit"; digit: number }
  | { kind: "sep"; char: string };

/** Split a formatted number into fixed digit / separator slots. */
export function tokenizeFormatted(formatted: string): ReelToken[] {
  const tokens: ReelToken[] = [];
  for (const char of formatted) {
    if (char >= "0" && char <= "9") {
      tokens.push({ kind: "digit", digit: Number(char) });
    } else {
      tokens.push({ kind: "sep", char });
    }
  }
  return tokens;
}

/**
 * How many full 0–9 loops a digit strip runs before landing.
 * Later (rightward) digits spin longer — slot-machine stop order.
 */
export function reelCyclesForIndex(index: number, digitCount: number): number {
  const fromRight = Math.max(0, digitCount - 1 - index);
  return 1 + fromRight;
}

/** translateY in `em` for a strip that starts at 0 and ends on `digit` after `cycles` loops. */
export function reelOffsetEm(digit: number, cycles: number): number {
  const d = ((Math.trunc(digit) % 10) + 10) % 10;
  const c = Math.max(0, Math.trunc(cycles));
  return -(c * 10 + d);
}

/** Ordered faces on a digit strip: `cycles` full decades, then 0…digit. */
export function reelFaces(digit: number, cycles: number): number[] {
  const d = ((Math.trunc(digit) % 10) + 10) % 10;
  const c = Math.max(0, Math.trunc(cycles));
  const faces: number[] = [];
  for (let loop = 0; loop < c; loop += 1) {
    for (let n = 0; n < 10; n += 1) faces.push(n);
  }
  for (let n = 0; n <= d; n += 1) faces.push(n);
  return faces;
}

/** Stagger delay so left digits settle first. */
export function reelDelayMs(index: number, stepMs = 90): number {
  return Math.max(0, index) * stepMs;
}
