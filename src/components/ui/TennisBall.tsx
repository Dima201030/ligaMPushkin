import { cn } from "@/lib/utils";

/**
 * Glossy tennis ball — the one colourful object in an otherwise paper-and-ink
 * composition. Rendered as SVG so it stays crisp at display sizes.
 */
export function TennisBall({
  className,
  idPrefix = "mp-ball",
}: {
  className?: string;
  /** Unique prefix when multiple balls share a page (avoids SVG paintServer collisions). */
  idPrefix?: string;
}) {
  const body = `${idPrefix}-body`;
  const seam = `${idPrefix}-seam`;
  const gloss = `${idPrefix}-gloss`;
  const bounce = `${idPrefix}-bounce`;
  const shade = `${idPrefix}-shade`;
  const soften = `${idPrefix}-soften`;
  const clip = `${idPrefix}-clip`;

  return (
    <span className={cn("hero-ball", className)} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="size-full">
        <defs>
          <radialGradient id={body} cx="33%" cy="24%" r="86%">
            <stop offset="0%" stopColor="#f7ff9d" />
            <stop offset="26%" stopColor="#e8f45f" />
            <stop offset="58%" stopColor="#cfe22f" />
            <stop offset="86%" stopColor="#a7bc12" />
            <stop offset="100%" stopColor="#7e930a" />
          </radialGradient>
          <linearGradient id={seam} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="50%" stopColor="#f8fce2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
          </linearGradient>
          <radialGradient id={gloss} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={bounce} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2ff8a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f2ff8a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={shade} cx="74%" cy="80%" r="62%">
            <stop offset="0%" stopColor="#4c5c05" stopOpacity="0.42" />
            <stop offset="65%" stopColor="#4c5c05" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4c5c05" stopOpacity="0" />
          </radialGradient>
          <filter id={soften} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>
          <clipPath id={clip}>
            <circle cx="100" cy="100" r="97" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clip})`}>
          <circle cx="100" cy="100" r="97" fill={`url(#${body})`} />
          <circle cx="100" cy="100" r="97" fill={`url(#${shade})`} />

          {/* seam indentation */}
          <path
            d="M20 44C64 62 76 116 44 162"
            fill="none"
            stroke="#5d6c07"
            strokeOpacity="0.28"
            strokeWidth="8"
            strokeLinecap="round"
            filter={`url(#${soften})`}
          />
          <path
            d="M180 44C136 62 124 116 156 162"
            fill="none"
            stroke="#5d6c07"
            strokeOpacity="0.28"
            strokeWidth="8"
            strokeLinecap="round"
            filter={`url(#${soften})`}
          />

          {/* seam felt */}
          <path
            d="M20 44C64 62 76 116 44 162"
            fill="none"
            stroke={`url(#${seam})`}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M180 44C136 62 124 116 156 162"
            fill="none"
            stroke={`url(#${seam})`}
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* bounce light from the paper */}
          <ellipse cx="84" cy="178" rx="64" ry="26" fill={`url(#${bounce})`} />

          {/* specular */}
          <ellipse
            cx="69"
            cy="52"
            rx="35"
            ry="22"
            fill={`url(#${gloss})`}
            transform="rotate(-30 69 52)"
          />
          <ellipse cx="56" cy="42" rx="11" ry="6" fill="#ffffff" opacity="0.85" transform="rotate(-30 56 42)" />
          <ellipse cx="131" cy="151" rx="24" ry="10" fill="#ffffff" opacity="0.16" transform="rotate(-20 131 151)" />

          {/* rim light */}
          <path
            d="M22 92A80 80 0 0 1 96 21"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}
