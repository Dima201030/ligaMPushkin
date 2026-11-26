"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/CountUp";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

export function RatingChart({
  values,
  height = 180,
  className,
  caption = "Динамика рейтинга за последние 8 турниров",
}: {
  values: number[];
  height?: number;
  className?: string;
  caption?: string;
}) {
  const gradId = useId();
  const pathRef = useRef<SVGPolylineElement>(null);
  const [drawn, setDrawn] = useState(false);

  const geometry = useMemo(() => {
    if (values.length < 2) return null;
    const width = 640;
    const padding = 12;
    const min = Math.min(...values) - 18;
    const max = Math.max(...values) + 18;
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (value - min) / range) * (height - padding * 2);
      return { x, y, value };
    });
    const line = points.map((point) => `${point.x},${point.y}`).join(" ");
    const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;
    return {
      width,
      padding,
      points,
      line,
      area,
      last: points[points.length - 1],
      first: points[0],
      delta: points[points.length - 1].value - points[0].value,
    };
  }, [values, height]);

  useEffect(() => {
    if (!geometry) return;
    if (prefersReducedMotion()) {
      setDrawn(true);
      return;
    }
    const node = pathRef.current;
    if (!node) {
      setDrawn(true);
      return;
    }
    const length = node.getTotalLength();
    node.style.strokeDasharray = `${length}`;
    node.style.strokeDashoffset = `${length}`;
    const frame = window.requestAnimationFrame(() => {
      node.style.transition = "stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.strokeDashoffset = "0";
      setDrawn(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [geometry]);

  if (!geometry) return null;

  const { width, padding, points, line, area, last, first, delta } = geometry;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="stat-value text-navy">
            <CountUp value={last.value} />
          </p>
          <p className="stat-label mt-1.5">текущий рейтинг</p>
        </div>
        <p className={cn("text-xs font-bold", delta >= 0 ? "text-positive" : "text-negative")}>
          {delta >= 0 ? "+" : ""}
          {delta} за период
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={caption}
      >
        <title>{caption}</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={height * ratio}
            y2={height * ratio}
            stroke="var(--color-line)"
            strokeDasharray="4 6"
          />
        ))}
        <polygon points={area} fill={`url(#${gradId})`} className={cn("rating-area", drawn && "rating-area-in")} />
        <polyline
          ref={pathRef}
          points={line}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 4.5 : 2.5}
            fill={index === points.length - 1 ? "var(--color-accent)" : "var(--color-surface)"}
            stroke="var(--color-accent)"
            strokeWidth="2"
            className={cn("rating-dot", drawn && "rating-dot-in")}
            style={{ ["--i" as string]: index }}
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[0.65rem] font-medium text-ink-faint">
        <span>{first.value}</span>
        <span>{caption}</span>
        <span>{last.value}</span>
      </div>
    </div>
  );
}
