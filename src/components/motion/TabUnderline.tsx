"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/** Sliding underline for filter/view tabs. */
export function TabUnderline<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLElement>(`[data-tab="${value}"]`);
    if (!active) return;
    setBar({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value, items]);

  return (
    <div ref={rowRef} className={cn("tab-underline-row", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          data-tab={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "tab-underline-btn",
            value === item.value ? "text-ink" : "text-ink-muted hover:text-ink",
          )}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span className="tabular-nums text-ink-faint">{item.count}</span>
          ) : null}
        </button>
      ))}
      <span
        className="tab-underline-bar"
        style={{
          transform: `translateX(${bar.left}px)`,
          width: bar.width,
          transition: reduced ? "none" : undefined,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
