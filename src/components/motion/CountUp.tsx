"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { cn, formatNumber } from "@/lib/utils";

export function CountUp({
  value,
  className,
  decimals = 0,
  format = "number",
  suffix = "",
  durationMs,
}: {
  value: number;
  className?: string;
  decimals?: number;
  format?: "number" | "plain";
  suffix?: string;
  durationMs?: number;
}) {
  const { displayValue, ref } = useCountUp({ value, decimals, durationMs });
  const text =
    format === "number" && decimals === 0
      ? formatNumber(Math.round(displayValue))
      : displayValue.toFixed(decimals);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cn("tabular-nums", className)}>
      {text}
      {suffix}
    </span>
  );
}
