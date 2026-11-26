/** Pairly UUID contract (FE): canonical lowercase string uuid v4 over the wire. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Brand alias — API ids are strings, never numbers. */
export type Uuid = string;

/** Trim + lowercase. Does not validate. */
export function normalizeUuid(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** True when value looks like a canonical UUID (any RFC version 1–8). */
export function isUuid(value: string | null | undefined): boolean {
  const s = normalizeUuid(value);
  return s.length === 36 && UUID_RE.test(s);
}

/** Case/trim-safe equality. Empty values never equal. */
export function uuidsEqual(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizeUuid(a);
  const nb = normalizeUuid(b);
  if (!na || !nb) return false;
  return na === nb;
}

/** Map/Set key for a UUID string. */
export function uuidKey(value: string | null | undefined): string {
  return normalizeUuid(value);
}
