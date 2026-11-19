"use client";

import { useEffect, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";

/**
 * boot  — Pushkin alone (Push + kin closed as one word)
 * burst — jelly births from the middle of Pushkin
 * mr    — Mr. arrives on the left
 * idle  — Melike hover: lift + scale; active squish
 */
type Phase = "boot" | "burst" | "mr" | "idle";

export function HeroWordmark() {
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("idle");
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase("burst"), 480),
      window.setTimeout(() => setPhase("mr"), 480 + 1750),
      window.setTimeout(() => setPhase("idle"), 480 + 1750 + 560),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <h1 className="hero-wordmark" data-phase={phase} aria-label="Mr. Pushkin">
      <span className="hero-word hero-word--mr" aria-hidden="true">
        Mr.
      </span>
      <span className="hero-pushkin" aria-hidden="true">
        <span className="hero-word hero-word--push">Push</span>
        <span className="hero-ball-slot">
          <TennisBall />
        </span>
        <span className="hero-word hero-word--kin">kin</span>
      </span>
    </h1>
  );
}
