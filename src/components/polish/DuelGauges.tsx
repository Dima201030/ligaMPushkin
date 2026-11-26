"use client";

import { useGaugeFill } from "@/hooks/useGaugeFill";
import { cn } from "@/lib/utils";

function Gauge({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const { displayValue, ratio, ref } = useGaugeFill({ value, max, durationMs: 850 });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <p className="text-sm font-medium tabular-nums">{Math.round(displayValue)}</p>
      </div>
      <div className="xp-bar-track mt-2">
        <div className="xp-bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

/** You vs opponent duel gauges (rating / winrate style). */
export function DuelGauges({
  youLabel = "Вы",
  opponentLabel = "Соперник",
  youValue,
  opponentValue,
  max,
  className,
}: {
  youLabel?: string;
  opponentLabel?: string;
  youValue: number;
  opponentValue: number;
  max?: number;
  className?: string;
}) {
  const ceiling = max ?? Math.max(youValue, opponentValue, 1) * 1.08;
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <Gauge label={youLabel} value={youValue} max={ceiling} />
      <Gauge label={opponentLabel} value={opponentValue} max={ceiling} />
    </div>
  );
}
