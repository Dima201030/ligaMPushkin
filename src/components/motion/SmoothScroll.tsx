"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/** Smooth scroll for in-page anchors; respects reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      const node = document.getElementById(id);
      if (!node) return;
      event.preventDefault();
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
