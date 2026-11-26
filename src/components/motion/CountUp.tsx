"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  reelCyclesForIndex,
  reelDelayMs,
  reelFaces,
  reelOffsetEm,
  tokenizeFormatted,
} from "@/lib/motion/digit-reel";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { cn, formatNumber } from "@/lib/utils";
import { useCountUp } from "@/hooks/useCountUp";

const REEL_BASE_MS = 900;
const REEL_STAGGER_MS = 90;

function DigitSlot({
  digit,
  index,
  digitCount,
  play,
  durationMs,
}: {
  digit: number;
  index: number;
  digitCount: number;
  play: boolean;
  durationMs: number;
}) {
  const cycles = reelCyclesForIndex(index, digitCount);
  const faces = useMemo(() => reelFaces(digit, cycles), [digit, cycles]);
  const offset = reelOffsetEm(digit, cycles);
  const delay = reelDelayMs(index, REEL_STAGGER_MS);
  const spinMs = durationMs + delay;

  return (
    <span className="digit-reel-slot" aria-hidden="true">
      <span
        className={cn("digit-reel-strip", play && "digit-reel-strip-spin")}
        style={
          {
            "--reel-offset": offset,
            "--reel-duration": `${spinMs}ms`,
            "--reel-delay": "0ms",
          } as CSSProperties
        }
      >
        {faces.map((face, faceIndex) => (
          <span key={`${face}-${faceIndex}`} className="digit-reel-face">
            {face}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Integer count-up as fixed-width casino digit reels — no layout shift while spinning.
 * Falls back to tween + tabular-nums for fractional values.
 */
export function CountUp({
  value,
  className,
  decimals = 0,
  format = "number",
  suffix = "",
  durationMs = REEL_BASE_MS,
}: {
  value: number;
  className?: string;
  decimals?: number;
  format?: "number" | "plain";
  suffix?: string;
  durationMs?: number;
}) {
  if (decimals > 0) {
    return (
      <TweenCountUp
        value={value}
        className={className}
        decimals={decimals}
        format={format}
        suffix={suffix}
        durationMs={durationMs}
      />
    );
  }

  return (
    <ReelCountUp
      value={value}
      className={className}
      format={format}
      suffix={suffix}
      durationMs={durationMs}
    />
  );
}

function ReelCountUp({
  value,
  className,
  format,
  suffix,
  durationMs,
}: {
  value: number;
  className?: string;
  format: "number" | "plain";
  suffix: string;
  durationMs: number;
}) {
  const rounded = Math.round(value);
  const formatted = format === "number" ? formatNumber(rounded) : String(rounded);
  const tokens = useMemo(() => tokenizeFormatted(formatted), [formatted]);
  const digitCount = tokens.filter((t) => t.kind === "digit").length;

  const ref = useRef<HTMLSpanElement | null>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setMotionOk(false);
      setShouldPlay(false);
      return;
    }
    setMotionOk(true);
    setShouldPlay(false);
  }, [formatted]);

  useEffect(() => {
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
  }, [motionOk, formatted]);

  const play = motionOk && shouldPlay;
  let digitIndex = 0;

  return (
    <span
      ref={ref}
      className={cn("digit-reel tabular-nums", className)}
      aria-label={`${formatted}${suffix}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === "sep") {
          return (
            <span key={`s-${i}`} className="digit-reel-sep" aria-hidden="true">
              {token.char}
            </span>
          );
        }
        const index = digitIndex;
        digitIndex += 1;
        if (!motionOk) {
          return (
            <span key={`d-${i}`} className="digit-reel-slot digit-reel-static" aria-hidden="true">
              {token.digit}
            </span>
          );
        }
        return (
          <DigitSlot
            key={`d-${i}-${token.digit}`}
            digit={token.digit}
            index={index}
            digitCount={digitCount}
            play={play}
            durationMs={durationMs}
          />
        );
      })}
      {suffix ? <span className="digit-reel-suffix">{suffix}</span> : null}
    </span>
  );
}

/** Legacy tween path for fractional values — reserves final width via ch. */
function TweenCountUp({
  value,
  className,
  decimals,
  format,
  suffix,
  durationMs,
}: {
  value: number;
  className?: string;
  decimals: number;
  format: "number" | "plain";
  suffix: string;
  durationMs?: number;
}) {
  const { displayValue, ref } = useCountUp({ value, decimals, durationMs });
  const finalText =
    format === "number" && decimals === 0
      ? formatNumber(Math.round(value))
      : value.toFixed(decimals);
  const text =
    format === "number" && decimals === 0
      ? formatNumber(Math.round(displayValue))
      : displayValue.toFixed(decimals);

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={cn("inline-block tabular-nums", className)}
      style={{ minWidth: `${finalText.length + suffix.length}ch` }}
    >
      {text}
      {suffix}
    </span>
  );
}
