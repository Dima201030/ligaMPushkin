/** Client prefs for brand polish (sounds / seasonal / cursor). All off by default. */

export type PolishPrefs = {
  sounds: boolean;
  seasonal: boolean;
  ballCursor: boolean;
  onboardingSeen: boolean;
};

export const POLISH_PREFS_KEY = "pairly_polish_prefs";

export const DEFAULT_POLISH_PREFS: PolishPrefs = {
  sounds: false,
  seasonal: false,
  ballCursor: false,
  onboardingSeen: false,
};

export function readPolishPrefs(): PolishPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_POLISH_PREFS };
  try {
    const raw = window.localStorage.getItem(POLISH_PREFS_KEY);
    if (!raw) return { ...DEFAULT_POLISH_PREFS };
    return { ...DEFAULT_POLISH_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_POLISH_PREFS };
  }
}

export function writePolishPrefs(patch: Partial<PolishPrefs>): PolishPrefs {
  const next = { ...readPolishPrefs(), ...patch };
  try {
    window.localStorage.setItem(POLISH_PREFS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}
