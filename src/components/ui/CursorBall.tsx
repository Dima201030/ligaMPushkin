"use client";

import { useEffect, useRef, useState } from "react";
import { TennisBall } from "@/components/ui/TennisBall";

/**
 * Soft tennis-ball “shadow” that trails the pointer on fine pointers only.
 * Disabled for touch / coarse pointers and prefers-reduced-motion.
 */
export function CursorBall() {
  const ballRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const shown = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncCapability = () => {
      const ok = finePointer.matches && !reducedMotion.matches;
      setEnabled(ok);
      if (!ok) {
        shown.current = false;
        ballRef.current?.setAttribute("data-visible", "false");
        if (raf.current != null) {
          cancelAnimationFrame(raf.current);
          raf.current = null;
        }
      }
    };

    syncCapability();
    finePointer.addEventListener("change", syncCapability);
    reducedMotion.addEventListener("change", syncCapability);

    return () => {
      finePointer.removeEventListener("change", syncCapability);
      reducedMotion.removeEventListener("change", syncCapability);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const el = ballRef.current;
    if (!el) return;

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      current.current.x += dx * 0.18;
      current.current.y += dy * 0.18;

      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;

      if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = null;
      }
    };

    const onMove = (event: PointerEvent) => {
      // Sit slightly below the tip — a soft shadow under the cursor.
      target.current.x = event.clientX + 14;
      target.current.y = event.clientY + 18;

      if (!shown.current) {
        shown.current = true;
        current.current.x = target.current.x;
        current.current.y = target.current.y;
        el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
        el.setAttribute("data-visible", "true");
      }

      if (raf.current == null) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      shown.current = false;
      el.setAttribute("data-visible", "false");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ballRef} className="cursor-ball" aria-hidden="true" data-visible="false">
      <TennisBall idPrefix="mp-cursor-ball" className="cursor-ball__glyph" />
    </div>
  );
}
