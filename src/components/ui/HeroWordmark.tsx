"use client";

import { useEffect, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";

/**
 * boot      — only Pushkin
 * burst     — jelly flies out of Pushkin (long elastic)
 * mr        — Mr. arrives on the left
 * idle      — settled; hover = one-shot jiggle
 */
type Phase = "boot" | "burst" | "mr" | "idle";

export function HeroWordmark() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [jiggle, setJiggle] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("idle");
      return;
    }

    const timers = [
      // Let Pushkin land, then birth the jelly from its center.
      window.setTimeout(() => setPhase("burst"), 520),
      // Give the ball a long burst/settle before bringing Mr. in.
      window.setTimeout(() => setPhase("mr"), 520 + 1680),
      window.setTimeout(() => setPhase("idle"), 520 + 1680 + 620),
    ];

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const canJiggle = phase === "idle" || phase === "mr";

  return (
    <h1 className="hero-wordmark" data-phase={phase} aria-label="Mr. Pushkin">
      <span className="hero-word hero-word--mr" aria-hidden="true">
        Mr.
      </span>
      <span
        className="hero-ball-slot"
        data-jiggle={jiggle ? "true" : undefined}
        onMouseEnter={() => {
          if (!canJiggle) return;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches === false) return;
          setJiggle(false);
          requestAnimationFrame(() => setJiggle(true));
        }}
        onAnimationEnd={(event) => {
          if (event.animationName === "jelly-jiggle") setJiggle(false);
        }}
      >
        <TennisBall />
      </span>
      <span className="hero-word hero-word--pushkin" aria-hidden="true">
        Pushkin
      </span>
    </h1>
  );
}
