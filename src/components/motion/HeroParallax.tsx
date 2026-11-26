"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/** Light parallax on `.hero-parallax-lite` — very subtle translate on scroll. */
export function HeroParallax() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const node = document.querySelector<HTMLElement>(".hero-parallax-lite");
    if (!node) return;
    const onScroll = () => {
      const y = Math.min(24, window.scrollY * 0.08);
      node.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      node.style.transform = "";
    };
  }, []);
  return null;
}
