"use client";

import { cn } from "@/lib/utils";

/** Bulk actions progress bar for organizer batch ops. */
export function BulkProgress({
  done,
  total,
  label = "Обработка",
  className,
}: {
  done: number;
  total: number;
  label?: string;
  className?: string;
}) {
  if (total <= 0) return null;
  const ratio = Math.min(1, Math.max(0, done / total));
  return (
    <div className={cn("bulk-progress", className)} role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <p className="stat-label">{label}</p>
        <p className="text-[0.7rem] tabular-nums text-ink-muted">
          {done} / {total}
        </p>
      </div>
      <div className="xp-bar-track mt-2">
        <div className="xp-bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
