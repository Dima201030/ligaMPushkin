"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/** Light pull-to-refresh feel on mobile (visual + soft reload). */
export function PullToRefreshHint() {
  const router = useRouter();
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onStart = (event: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current = event.touches[0]?.clientY ?? null;
    };
    const onMove = (event: TouchEvent) => {
      if (startY.current == null) return;
      const dy = (event.touches[0]?.clientY ?? 0) - startY.current;
      setPull(Math.max(0, Math.min(72, dy * 0.35)));
    };
    const onEnd = () => {
      if (pull > 54) router.refresh();
      startY.current = null;
      setPull(0);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [pull, router]);

  if (pull <= 0) return null;

  return (
    <div className="ptr-hint" style={{ height: pull }} aria-hidden="true">
      <span className="ptr-hint-dot" />
    </div>
  );
}
