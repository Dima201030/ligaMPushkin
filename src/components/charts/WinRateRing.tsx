"use client";

import type { RefObject } from "react";
import { useGaugeFill } from "@/hooks/useGaugeFill";
import { ringStroke } from "@/lib/motion/gauge-fill";

export function WinRateRing({
  value,
  size = 112,
  label = "побед",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 8;
  const { displayValue, ratio, ref } = useGaugeFill({ value, max: 100 });
  const { radius, strokeDasharray, strokeDashoffset } = ringStroke(size, stroke, ratio);
  const shown = Math.round(displayValue);
  const finalLabel = `${Math.round(value)}% ${label}`;

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={finalLabel}>
        <title>{finalLabel}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center" aria-hidden="true">
        <div className="text-2xl font-extrabold tracking-tight text-navy tabular-nums">
          {shown}%
        </div>
        <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </div>
      </div>
    </div>
  );
}
