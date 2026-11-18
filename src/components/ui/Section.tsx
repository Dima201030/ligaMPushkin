import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHead({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Все",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-5", className)}>
      <div className="min-w-0 max-w-[58ch]">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && (
          <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[0.8rem] font-semibold text-ink-soft shadow-xs transition-colors hover:border-line-strong hover:text-ink"
        >
          {linkLabel}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className={cn("page-shell relative", compact ? "py-10 md:py-14" : "py-14 md:py-20")}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-[70ch]">
            {eyebrow && <p className="eyebrow eyebrow-plain mb-4 text-sky">{eyebrow}</p>}
            <h1 className="max-w-[20ch] text-white">{title}</h1>
            {description && (
              <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-white/60 md:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-ink-muted"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && <span className="text-ink-faint">/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-soft">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-line px-6 py-16 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="mt-2 max-w-[42ch] text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
