"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tiny tennis-ball shadow glued to the pointer tip.
 * Fine pointers only; off for touch / coarse / prefers-reduced-motion.
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

    const SIZE = 11;
    const HALF = SIZE / 2;
    // Sit just under the tip — not a trailing decoration.
    const OFFSET_Y = 3;

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      // Snappy follow — barely any lag.
      current.current.x += dx * 0.62;
      current.current.y += dy * 0.62;

      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = null;
      }
    };

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX - HALF;
      target.current.y = event.clientY + OFFSET_Y;

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
      {/* Soft ink silhouette — not the glossy hero ball. */}
      <svg viewBox="0 0 24 24" className="cursor-ball__glyph" focusable="false">
        <defs>
          <filter id="mp-cursor-soft" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="0.55" />
          </filter>
        </defs>
        <circle cx="12" cy="12" r="9.2" fill="#2a2c14" filter="url(#mp-cursor-soft)" />
        <path
          d="M5.2 7.2C9.2 9 10.4 14.2 7.4 18.6"
          fill="none"
          stroke="#eaece5"
          strokeOpacity="0.28"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M18.8 7.2C14.8 9 13.6 14.2 16.6 18.6"
          fill="none"
          stroke="#eaece5"
          strokeOpacity="0.28"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
