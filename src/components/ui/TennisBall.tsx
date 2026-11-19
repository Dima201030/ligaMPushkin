import { cn } from "@/lib/utils";

/**
 * Marmalade / jelly tennis ball — translucent gummy body, wet specular,
 * soft candy seams. The one colourful object in the paper-and-ink composition.
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
  const rim = `${idPrefix}-rim`;
  const core = `${idPrefix}-core`;
  const seam = `${idPrefix}-seam`;
  const gloss = `${idPrefix}-gloss`;
  const shade = `${idPrefix}-shade`;
  const clip = `${idPrefix}-clip`;

  return (
    <span className={cn("hero-ball jelly-ball", className)} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible">
        <defs>
          {/* Candy body: lighter translucent core, denser rim */}
          <radialGradient id={body} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#f8ff9a" stopOpacity="0.98" />
            <stop offset="35%" stopColor="#e4f34a" stopOpacity="0.96" />
            <stop offset="68%" stopColor="#c6db1c" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#8aa60a" stopOpacity="0.98" />
          </radialGradient>
          <radialGradient id={core} cx="46%" cy="42%" r="42%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#f2ff8a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f2ff8a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={rim} cx="50%" cy="50%" r="50%">
            <stop offset="62%" stopColor="#4d5f05" stopOpacity="0" />
            <stop offset="86%" stopColor="#4d5f05" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2f3a04" stopOpacity="0.38" />
          </radialGradient>
          <radialGradient id={shade} cx="72%" cy="78%" r="58%">
            <stop offset="0%" stopColor="#3f4d06" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#3f4d06" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3f4d06" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={seam} x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f7fce8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id={gloss} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id={clip}>
            <circle cx="100" cy="100" r="96" />
          </clipPath>
        </defs>

        {/* Soft contact shadow under the gummy */}
        <ellipse cx="100" cy="178" rx="58" ry="12" fill="#23250f" opacity="0.14" />

        <g clipPath={`url(#${clip})`}>
          <circle cx="100" cy="100" r="96" fill={`url(#${body})`} />
          <circle cx="100" cy="100" r="96" fill={`url(#${core})`} />
          <circle cx="100" cy="100" r="96" fill={`url(#${shade})`} />
          <circle cx="100" cy="100" r="96" fill={`url(#${rim})`} />

          {/* Candy seams */}
          <path
            d="M22 46C66 64 78 116 46 162"
            fill="none"
            stroke="#5a6a08"
            strokeOpacity="0.22"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M178 46C134 64 122 116 154 162"
            fill="none"
            stroke="#5a6a08"
            strokeOpacity="0.22"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M22 46C66 64 78 116 46 162"
            fill="none"
            stroke={`url(#${seam})`}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M178 46C134 64 122 116 154 162"
            fill="none"
            stroke={`url(#${seam})`}
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Wet specular — top-left, Melike-style */}
          <ellipse
            cx="68"
            cy="54"
            rx="38"
            ry="24"
            fill={`url(#${gloss})`}
            transform="rotate(-32 68 54)"
          />
          <ellipse
            cx="56"
            cy="44"
            rx="12"
            ry="7"
            fill="#ffffff"
            opacity="0.92"
            transform="rotate(-32 56 44)"
          />

          {/* Soft rim light */}
          <path
            d="M28 98A78 78 0 0 1 98 28"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <ellipse cx="128" cy="148" rx="26" ry="11" fill="#ffffff" opacity="0.14" transform="rotate(-18 128 148)" />
        </g>
      </svg>
    </span>
  );
}
