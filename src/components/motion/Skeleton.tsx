import { cn } from "@/lib/utils";

/** Soft skeleton block — swap for content without a flash (pair with fade-in). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-block", className)} aria-hidden="true" />;
}

export function SkeletonLines({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3 w-full", i === lines - 1 && "w-2/3")} />
      ))}
    </div>
  );
}
