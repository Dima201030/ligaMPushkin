import { cn } from "@/lib/utils";

/** Brand jelly-ball loader instead of a generic spinner. */
export function JellyLoader({
  label = "Загрузка",
  className,
  size = 36,
}: {
  label?: string;
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("jelly-loader", className)} role="status" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/jelly-tennis-ball.webp"
        alt=""
        width={size}
        height={size}
        className="jelly-loader-ball"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      <span className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
