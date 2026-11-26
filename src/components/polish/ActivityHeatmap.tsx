import { cn } from "@/lib/utils";

/** Compact activity heatmap by weeks (match intensity). */
export function ActivityHeatmap({
  weeks,
  className,
  label = "Активность по неделям",
}: {
  /** 0..3 intensity per week, oldest → newest */
  weeks: number[];
  className?: string;
  label?: string;
}) {
  if (!weeks.length) return null;
  return (
    <div className={cn("activity-heatmap", className)}>
      <p className="stat-label mb-3">{label}</p>
      <div className="flex flex-wrap gap-1" role="img" aria-label={label}>
        {weeks.map((level, index) => (
          <span
            key={index}
            className={cn(
              "activity-cell",
              level <= 0 && "activity-0",
              level === 1 && "activity-1",
              level === 2 && "activity-2",
              level >= 3 && "activity-3",
            )}
            title={`Неделя ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
