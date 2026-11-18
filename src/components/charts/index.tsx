import { cn } from "@/lib/utils";

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
  const last = points[points.length - 1];
  const first = points[0];
  const delta = last.value - first.value;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="stat-value text-navy">{last.value}</p>
          <p className="stat-label mt-1.5">текущий рейтинг</p>
        </div>
        <p className={cn("text-xs font-bold", delta >= 0 ? "text-positive" : "text-negative")}>
          {delta >= 0 ? "+" : ""}{delta} за период
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
          <linearGradient id="rating-area" x1="0" y1="0" x2="0" y2="1">
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
        <polygon points={area} fill="url(#rating-area)" />
        <polyline
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

export function WinRateRing({
  value,
  size = 112,
  label = "побед",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${value}% ${label}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-extrabold tracking-tight text-navy">{value}%</div>
        <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</div>
      </div>
    </div>
  );
}

export function FormDots({ form }: { form: number[] }) {
  return (
    <div className="flex items-center gap-1" aria-label="Форма в последних матчах">
      {form.map((delta, index) => (
        <span
          key={index}
          title={delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "0"}
          className={cn(
            "grid size-5 place-items-center rounded-full text-[0.55rem] font-bold",
            delta > 0 && "bg-positive-soft text-positive",
            delta < 0 && "bg-negative-soft text-negative",
            delta === 0 && "bg-surface-hover text-ink-faint",
          )}
        >
          {delta > 0 ? "+" : delta === 0 ? "0" : "−"}
        </span>
      ))}
    </div>
  );
}
