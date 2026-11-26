/** Default fill duration for gauges/meters (within the ~0.8–1.2s polish window). */
export const GAUGE_FILL_DURATION_MS = 1000;

/** Shared ease-out used by gauge fills (matches site --ease-out feel). */
export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/**
 * Linearly interpolate and ease a 0→1 clock into a progress value.
 * Pure helper so bars, rings, and number tweens can share one curve.
 */
export function gaugeFillAt(
  t: number,
  from: number,
  to: number,
  ease: (n: number) => number = easeOutCubic,
): number {
  return from + (to - from) * ease(t);
}

/** Ratio of a value against its max, clamped to 0..1. */
export function gaugeRatio(value: number, max = 100): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** SVG ring geometry for a circular gauge at a 0..1 fill ratio. */
export function ringStroke(size: number, strokeWidth: number, ratio: number) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fill = gaugeRatio(ratio, 1);
  return {
    radius,
    circumference,
    strokeDasharray: circumference,
    strokeDashoffset: circumference * (1 - fill),
  };
}
