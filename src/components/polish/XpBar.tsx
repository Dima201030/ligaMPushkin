"use client";

import { useGaugeFill } from "@/hooks/useGaugeFill";
import { cn } from "@/lib/utils";

/** Level XP bar fill using shared gauge tween. */
export function XpBar({
  value,
  max = 100,
  label = "Прогресс уровня",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const { displayValue, ratio, ref } = useGaugeFill({ value, max });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn("xp-bar", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="stat-label">{label}</p>
        <p className="text-[0.7rem] tabular-nums text-ink-muted">
          {Math.round(displayValue)} / {max}
        </p>
      </div>
      <div className="xp-bar-track mt-2" aria-hidden="true">
        <div className="xp-bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
