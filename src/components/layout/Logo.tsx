import Link from "next/link";
import { CLUB } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "dark",
  compact = false,
  className,
}: {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex flex-col gap-1 leading-none", className)}
      aria-label={`${CLUB.productName} — на главную`}
    >
      <span
        className={cn(
          "text-[0.78rem] font-medium uppercase tracking-[0.16em] transition-opacity group-hover:opacity-60",
          variant === "light" ? "text-white" : "text-ink",
        )}
      >
        {CLUB.productName}
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
