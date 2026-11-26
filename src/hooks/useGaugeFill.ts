"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  GAUGE_FILL_DURATION_MS,
  easeOutCubic,
  gaugeFillAt,
  gaugeRatio,
} from "@/lib/motion/gauge-fill";

export type UseGaugeFillOptions = {
  /** Target numeric value (e.g. win rate percent). */
  value: number;
  /** Upper bound for ratio helpers. Default 100. */
  max?: number;
  /** Animation length in ms. Default ~1s. */
  durationMs?: number;
  /**
   * Start when the element enters the viewport.
   * If false, animates on mount. Default true.
   */
  playOnView?: boolean;
  /** Easing for the fill clock. */
  ease?: (t: number) => number;
};

export type UseGaugeFillResult = {
  /** Animated display value (same units as `value`). */
  displayValue: number;
  /** Animated 0..1 fill ratio against `max`. */
  ratio: number;
  /** Attach to the gauge root so play-on-view can observe it. */
  ref: RefObject<HTMLElement | null>;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reusable gauge fill: animates from 0 → value over ~1s when the meter appears.
 * Use for win-rate rings, progress bars, and similar meters.
 */
export function useGaugeFill({
  value,
  max = 100,
  durationMs = GAUGE_FILL_DURATION_MS,
  playOnView = true,
  ease = easeOutCubic,
}: UseGaugeFillOptions): UseGaugeFillResult {
  const ref = useRef<HTMLElement | null>(null);
  // SSR shows the final value; motion users reset to 0 before first paint.
  const [displayValue, setDisplayValue] = useState(value);
  const [motionOk, setMotionOk] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(!playOnView);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      setMotionOk(false);
      return;
    }
    setDisplayValue(0);
    setMotionOk(true);
  }, [value]);

  useEffect(() => {
    if (!playOnView) {
      setShouldPlay(true);
      return;
    }
    if (!motionOk) return;

    const node = ref.current;
    if (!node) {
      setShouldPlay(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShouldPlay(true);
          io.disconnect();
          break;
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.2 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [playOnView, motionOk]);

  useEffect(() => {
    if (!shouldPlay || !motionOk) return;
    if (durationMs <= 0) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    setDisplayValue(0);

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      setDisplayValue(gaugeFillAt(t, 0, value, ease));
      if (t < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(tick);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [shouldPlay, motionOk, value, durationMs, ease]);

  return {
    displayValue,
    ratio: gaugeRatio(displayValue, max),
    ref,
  };
}
