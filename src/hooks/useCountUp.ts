"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { easeOutCubic, gaugeFillAt } from "@/lib/motion/gauge-fill";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

export type UseCountUpOptions = {
  value: number;
  durationMs?: number;
  decimals?: number;
  playOnView?: boolean;
};

export type UseCountUpResult = {
  displayValue: number;
  ref: RefObject<HTMLElement | null>;
};

/** Count-up tween for ratings, points, dashboard counters. */
export function useCountUp({
  value,
  durationMs = 900,
  decimals = 0,
  playOnView = true,
}: UseCountUpOptions): UseCountUpResult {
  const ref = useRef<HTMLElement | null>(null);
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
    let frame = 0;
    let start: number | null = null;
    setDisplayValue(0);
    const factor = 10 ** decimals;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      const raw = gaugeFillAt(t, 0, value, easeOutCubic);
      setDisplayValue(Math.round(raw * factor) / factor);
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(tick);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [shouldPlay, motionOk, value, durationMs, decimals]);

  return { displayValue, ref };
}
