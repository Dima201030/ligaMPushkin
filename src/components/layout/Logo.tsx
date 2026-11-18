import Link from "next/link";
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
      aria-label="Mr. Pushkin League — на главную"
    >
      <span
        className={cn(
          "text-[0.78rem] font-medium uppercase tracking-[0.16em] transition-opacity group-hover:opacity-60",
          variant === "light" ? "text-white" : "text-ink",
        )}
      >
        Mr. Pushkin
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[0.62rem] uppercase tracking-[0.18em]",
            variant === "light" ? "text-white/45" : "text-ink-muted",
          )}
        >
          Теннисная лига
        </span>
      )}
    </Link>
  );
}
