"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Soft unlock pop for category / title badges. */
export function BadgeUnlock({
  children,
  unlockKey,
  className,
}: {
  children: React.ReactNode;
  unlockKey: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (reduced) return;
    setPop(true);
    const id = window.setTimeout(() => setPop(false), 700);
    return () => window.clearTimeout(id);
  }, [unlockKey, reduced]);

  return <span className={cn("badge-unlock", pop && "badge-unlock-pop", className)}>{children}</span>;
}
