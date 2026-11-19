"use client";

import { useEffect, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";

type Phase = "boot" | "intro" | "idle";

/**
 * Melike-style hero: words split, jelly ball bursts with elastic overshoot,
 * then rests static. Hover fires a one-shot jelly jiggle (not a held pose).
 */
export function HeroWordmark() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [jiggle, setJiggle] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("idle");
      return;
    }

    let introTimer = 0;
    let idleTimer = 0;

    introTimer = window.setTimeout(() => setPhase("intro"), 40);
    // Intro settles ~0.7s after start (text ~0.5s, ball spring ~0.55–0.6s).
    idleTimer = window.setTimeout(() => setPhase("idle"), 780);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return (
    <h1 className="hero-wordmark" data-phase={phase}>
      <span className="hero-word hero-word--left">лига</span>
      <span
        className="hero-ball-slot"
        data-jiggle={jiggle ? "true" : undefined}
        onMouseEnter={() => {
          if (phase !== "idle") return;
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches === false) return;
          setJiggle(false);
          // Retrigger one-shot animation even on rapid re-entry.
          requestAnimationFrame(() => setJiggle(true));
        }}
        onAnimationEnd={(event) => {
          if (event.animationName === "jelly-jiggle") setJiggle(false);
        }}
      >
        <TennisBall idPrefix="mp-hero-jelly" />
      </span>
      <span className="hero-word hero-word--right">сильных</span>
    </h1>
  );
}
