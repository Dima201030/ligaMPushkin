"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, done: total <= 0 };
}

/** Live countdown with second tick to tournament start. */
export function Countdown({
  targetIso,
  className,
  label = "До старта",
}: {
  targetIso: string;
  className?: string;
  label?: string;
}) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds, done } = parts(target - now);

  if (Number.isNaN(target)) return null;

  return (
    <div className={cn("countdown", className)} aria-live="polite">
      <p className="stat-label">{done ? "Старт" : label}</p>
      {done ? (
        <p className="mt-2 text-sm font-medium text-positive">Турнир начался</p>
      ) : (
        <p className="countdown-digits mt-2 tabular-nums">
          {days > 0 ? <span>{days}д </span> : null}
          <span>{String(hours).padStart(2, "0")}</span>:
          <span>{String(minutes).padStart(2, "0")}</span>:
          <span className="countdown-sec">{String(seconds).padStart(2, "0")}</span>
        </p>
      )}
    </div>
  );
}
