"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks `[data-reveal]` nodes as visible when they enter the viewport.
 * Soft editorial rise — not a cascade of staggered cards.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((node) => node.setAttribute("data-revealed", "true"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    nodes.forEach((node) => {
      if (node.getAttribute("data-revealed") === "true") return;
      io.observe(node);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
