"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Number flip / slot when a set score changes. */
export function ScoreFlip({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const prev = useRef(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    if (reduced) return;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 420);
    return () => window.clearTimeout(id);
  }, [value, reduced]);

  return (
    <span className={cn("score-flip tabular-nums", bump && "score-flip-bump", className)}>
      {value}
    </span>
  );
}
