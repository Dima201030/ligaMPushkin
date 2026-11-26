import {
  CATEGORY_BY_SLUG,
  MATCH_STATUS_LABEL,
  STATUS_BY_VALUE,
  SURFACE_LABEL,
  TYPE_BY_VALUE,
} from "@/lib/domain";
import type { CategorySlug, MatchStatus, Surface, TournamentStatus, TournamentType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  className,
  withName = true,
}: {
  category: CategorySlug;
  className?: string;
  withName?: boolean;
}) {
  const item = CATEGORY_BY_SLUG[category];
  return (
    <span
      className={cn("badge border", className)}
      style={{
        color: item.color,
        backgroundColor: `${item.color}14`,
        borderColor: `${item.color}40`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
      {withName ? item.name : item.shortName}
    </span>
  );
}

const STATUS_TONE = {
  neutral: "badge-neutral",
  blue: "badge-blue",
  positive: "badge-positive",
  negative: "badge-negative",
  warning: "badge-warning",
} as const;

export function StatusPill({
  status,
  className,
  dot = true,
}: {
  status: TournamentStatus;
  className?: string;
  dot?: boolean;
}) {
  const item = STATUS_BY_VALUE[status];
  return (
    <span className={cn("badge", STATUS_TONE[item.tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {item.label}
    </span>
  );
}

export function MatchStatusPill({ status, className }: { status: MatchStatus; className?: string }) {
  const tone =
    status === "live"
      ? "badge-negative"
      : status === "completed" || status === "walkover"
        ? "badge-positive"
        : status === "cancelled" || status === "bye"
          ? "badge-neutral"
          : "badge-blue";
  return (
    <span className={cn("badge", tone, className)}>
      {status === "live" && <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden="true" />}
      {MATCH_STATUS_LABEL[status]}
    </span>
  );
}

export function SurfaceBadge({ surface, className }: { surface: Surface; className?: string }) {
  return <span className={cn("badge badge-outline", className)}>{SURFACE_LABEL[surface]}</span>;
}

export function TypeBadge({ type, className }: { type: TournamentType; className?: string }) {
  const item = TYPE_BY_VALUE[type];
  return <span className={cn("badge badge-neutral", className)}>{item.label}</span>;
}
