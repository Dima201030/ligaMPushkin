import { cn } from "@/lib/utils";

export function StatBlock({
  value,
  label,
  hint,
  className,
  tone = "light",
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("stat-value", tone === "dark" ? "text-white" : "text-navy")}>{value}</div>
      <div className={cn("stat-label mt-2", tone === "dark" && "text-white/55")}>{label}</div>
      {hint && <div className="mt-1 text-[0.7rem] text-ink-faint">{hint}</div>}
    </div>
  );
}

export function StatGrid({
  items,
  className,
  tone = "light",
}: {
  items: { value: React.ReactNode; label: string; hint?: string }[];
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <StatBlock key={item.label} {...item} tone={tone} />
      ))}
    </div>
  );
}

export function MetaItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {icon && <span className="mt-0.5 text-ink-faint">{icon}</span>}
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-faint">{label}</p>
        <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
