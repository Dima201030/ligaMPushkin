"use client";

import { useEffect, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";

type Phase = "boot" | "intro" | "idle";

/**
 * Hero title with Melike-style intro: words split apart while a jelly ball
 * bursts from the center with elastic overshoot, then idles with a soft float.
 */
export function HeroWordmark() {
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("idle");
      return;
    }

    let introTimer = 0;
    let idleTimer = 0;

    introTimer = window.setTimeout(() => setPhase("intro"), 40);
    idleTimer = window.setTimeout(() => setPhase("idle"), 1180);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return (
    <h1 className="hero-wordmark" data-phase={phase}>
      <span className="hero-word hero-word--left">лига</span>
      <span className="hero-ball-slot">
        <TennisBall idPrefix="mp-hero-jelly" />
      </span>
      <span className="hero-word hero-word--right">сильных</span>
    </h1>
  );
}
