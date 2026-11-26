/**
 * Approximate LOC snapshot for the Pairly platform stack.
 * Counted on Mac; excludes node_modules, vendor, .next, dist.
 * Update manually when the stack grows materially.
 */
export type ProjectStatRow = {
  id: string;
  /** Short Russian label shown in the organizer UI. */
  label: string;
  /** Repo / package name for operators. */
  repo: string;
  /** Languages counted in the “code” column. */
  languages: string;
  trackedLines: number;
  codeLines: number;
};

export const PROJECT_STATS_AS_OF = "2026-11-26";

export const PROJECT_STAT_ROWS: ProjectStatRow[] = [
  {
    id: "liga-backend",
    label: "API",
    repo: "ligaBackend",
    languages: "Go + SQL",
    trackedLines: 36_000,
    codeLines: 35_000,
  },
  {
    id: "club-ui",
    label: "Клубный UI",
    repo: "ligaMPushkin",
    languages: "TypeScript",
    trackedLines: 46_000,
    codeLines: 25_000,
  },
  {
    id: "pairly-web",
    label: "Сайт Pairly",
    repo: "pairly-web",
    languages: "TypeScript",
    trackedLines: 35_000,
    codeLines: 20_000,
  },
];

export const PROJECT_STATS_TOTAL = {
  trackedLines: 117_000,
  codeLines: 80_000,
} as const;
