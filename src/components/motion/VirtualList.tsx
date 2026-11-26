"use client";

import { useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Lightweight windowed list for long rankings / participants. */
export function VirtualList<T>({
  items,
  estimateRowHeight = 56,
  overscan = 6,
  className,
  height = 420,
  renderRow,
  getKey,
}: {
  items: T[];
  estimateRowHeight?: number;
  overscan?: number;
  className?: string;
  height?: number;
  renderRow: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => setScrollTop(node.scrollTop);
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  const total = items.length * estimateRowHeight;
  const start = Math.max(0, Math.floor(scrollTop / estimateRowHeight) - overscan);
  const visibleCount = Math.ceil(height / estimateRowHeight) + overscan * 2;
  const end = Math.min(items.length, start + visibleCount);
  const slice = useMemo(() => items.slice(start, end), [items, start, end]);

  return (
    <div
      ref={scrollerRef}
      className={cn("virtual-list", className)}
      style={{ height, overflow: "auto" }}
    >
      <div style={{ height: total, position: "relative" }}>
        <div style={{ transform: `translateY(${start * estimateRowHeight}px)` }}>
          {slice.map((item, i) => {
            const index = start + i;
            return (
              <div key={getKey(item, index)} style={{ height: estimateRowHeight }}>
                {renderRow(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
