"use client";

import { useEffect, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";
import { CLUB } from "@/lib/domain";

/**
 * boot  — Pairly closed (Pair + ly as one word)
 * burst — jelly births from the middle
 * idle  — Melike hover: lift + scale; active squish
 */
type Phase = "boot" | "burst" | "idle";

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
      window.setTimeout(() => setPhase("idle"), 480 + 1750),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <h1 className="hero-wordmark" data-phase={phase} aria-label={CLUB.productName}>
      <span className="hero-brand" aria-hidden="true">
        <span className="hero-word hero-word--pair">Pair</span>
        <span className="hero-ball-slot">
          <TennisBall />
        </span>
        <span className="hero-word hero-word--ly">ly</span>
      </span>
    </h1>
  );
}
