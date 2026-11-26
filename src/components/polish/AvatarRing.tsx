"use client";

import { useGaugeFill } from "@/hooks/useGaugeFill";
import { ringStroke } from "@/lib/motion/gauge-fill";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

/** Avatar with progress ring (verification / level). */
export function AvatarRing({
  firstName,
  lastName,
  src,
  progress,
  size = 88,
  className,
  label = "Прогресс профиля",
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  /** 0..100 */
  progress: number;
  size?: number;
  className?: string;
  label?: string;
}) {
  const stroke = 3;
  const { displayValue, ratio, ref } = useGaugeFill({ value: progress, max: 100 });
  const geo = ringStroke(size, stroke, ratio);
  const avatarSize = size <= 56 ? "md" : size <= 80 ? "lg" : "hero";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(displayValue)}%`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={geo.radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={geo.radius}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={geo.strokeDasharray}
          strokeDashoffset={geo.strokeDashoffset}
        />
      </svg>
      <Avatar firstName={firstName} lastName={lastName} src={src} size={avatarSize} />
    </div>
  );
}
