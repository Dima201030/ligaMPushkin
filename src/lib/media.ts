// In production the app is mounted under a secret base path, so public assets
// and Go API files at /api/files/{id} must be requested through that prefix.
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const COVER_PLACEHOLDER_PATH = "/images/cover-placeholder.svg";

/** Neutral cover; always includes NEXT_PUBLIC_BASE_PATH when set. */
export const COVER_PLACEHOLDER = `${BASE_PATH}${COVER_PLACEHOLDER_PATH}`;

/**
 * Legacy club photos are no longer shipped. Any cover that still points to a
 * local photo falls back to the neutral platform placeholder. API file URLs get
 * the current base path so they resolve both in the browser and on the server.
 */
export function resolveCoverUrl(url?: string | null): string {
  if (!url) return COVER_PLACEHOLDER;
  if (
    url === COVER_PLACEHOLDER_PATH ||
    url.startsWith("/images/cover-placeholder")
  ) {
    return COVER_PLACEHOLDER;
  }
  if (url.startsWith("/images/")) {
    return COVER_PLACEHOLDER;
  }
  if (url.startsWith("/api/")) {
    return `${BASE_PATH}${url}`;
  }
  return url;
}
