"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CLUB } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { playUiTick } from "@/lib/polish/sounds";
import { readPolishPrefs } from "@/lib/polish/prefs";

/** Logo with a light easter egg on 1–2 quick clicks. */
export function LogoEgg({
  variant = "dark",
  compact = false,
  className,
}: {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}) {
  const clicks = useRef(0);
  const timer = useRef<number | null>(null);
  const [egg, setEgg] = useState(false);

  function onClick(event: React.MouseEvent) {
    clicks.current += 1;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      clicks.current = 0;
    }, 600);
    if (clicks.current >= 2) {
      event.preventDefault();
      clicks.current = 0;
      setEgg(true);
      if (readPolishPrefs().sounds) playUiTick("ok");
      window.setTimeout(() => setEgg(false), 1400);
    }
  }

  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("group inline-flex flex-col gap-1 leading-none", egg && "logo-egg-pop", className)}
      aria-label={`${CLUB.productName} — на главную`}
    >
      <span
        className={cn(
          "text-[0.78rem] font-medium uppercase tracking-[0.16em] transition-opacity group-hover:opacity-60",
          variant === "light" ? "text-white" : "text-ink",
        )}
      >
        {egg ? "Game · Set · Pairly" : CLUB.productName}
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[0.62rem] uppercase tracking-[0.18em]",
            variant === "light" ? "text-white/45" : "text-ink-muted",
          )}
        >
          Платформа турниров
        </span>
      )}
    </Link>
  );
}
