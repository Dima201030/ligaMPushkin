import { cn } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Marmalade / jelly tennis ball — pre-rendered candy translucency with a
 * thick wet highlight. Used as the colourful accent in the paper-and-ink hero.
 */
export function TennisBall({ className }: { className?: string; idPrefix?: string }) {
  return (
    <span className={cn("hero-ball jelly-ball", className)} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}/images/jelly-tennis-ball.webp`}
        alt=""
        width={640}
        height={640}
        draggable={false}
        className="jelly-ball__img"
      />
    </span>
  );
}
