import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/** Soft flame mark for win streaks (2+). */
export function StreakFlame({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  if (streak < 2) return null;
  return (
    <span className={cn("streak-flame", className)} title={`Серия побед: ${streak}`}>
      <Flame className="size-3.5" aria-hidden="true" />
      <span className="tabular-nums">{streak}</span>
      <span className="sr-only">Серия побед: {streak}</span>
    </span>
  );
}
