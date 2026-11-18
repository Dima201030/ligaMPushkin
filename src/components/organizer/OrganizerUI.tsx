import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrganizerHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line">
      <div className="flex flex-wrap items-end justify-between gap-5 px-4 pb-6 pt-7 md:px-8 md:pb-7 md:pt-9 lg:px-10">
        <div className="min-w-0 max-w-[70ch]">
          {eyebrow && <p className="text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted">{eyebrow}</p>}
          <h1 className="mt-3 text-[clamp(2rem,1.6rem+1.6vw,2.9rem)]">{title}</h1>
          {description && <p className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {meta}
          {actions}
        </div>
      </div>
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  flush = false,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}) {
  return (
    <section className={cn("border-t border-line", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 py-4">
          <div>
            {title && <h2 className="text-[0.95rem] font-medium text-ink">{title}</h2>}
            {description && <p className="mt-1 text-[0.72rem] leading-relaxed text-ink-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!flush && "pb-1 pt-1", bodyClassName)}>{children}</div>
    </section>
  );
}

const ICON_TONES = {
  accent: "text-ink-muted",
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
  neutral: "text-ink-muted",
} as const;

export function OrgStat({
  label,
  value,
  hint,
  icon,
  tone = "accent",
  trend,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: keyof typeof ICON_TONES;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <div className="border-t border-line pt-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        {icon && (
          <span className={cn("shrink-0", ICON_TONES[tone])} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="display text-[2.1rem] leading-none tabular-nums">{value}</p>
        {trend && (
          <span className={cn("pb-0.5 text-[0.66rem] font-medium", trend.positive ? "text-positive" : "text-ink-muted")}>
            {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-[0.66rem] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function DemoNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 border-y border-line py-2.5 text-[0.7rem] leading-relaxed text-ink-muted",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
  );
}

export function MiniLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">{children}</p>;
}
