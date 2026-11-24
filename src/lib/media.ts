export const COVER_PLACEHOLDER = "/images/cover-placeholder.svg";

// In production the app is mounted under a secret base path, so files served by
// the Go API at /api/files/{id} must be requested through that same prefix.
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/**
 * Legacy club photos are no longer shipped. Any cover that still points to a
 * local photo falls back to the neutral platform placeholder. API file URLs get
 * the current base path so they resolve both in the browser and on the server.
 */
export function resolveCoverUrl(url?: string | null): string {
  if (!url) return COVER_PLACEHOLDER;
  if (url.startsWith("/images/") && !url.startsWith("/images/cover-placeholder")) {
    return COVER_PLACEHOLDER;
  }
  if (url.startsWith("/api/")) {
    return `${BASE_PATH}${url}`;
  }
  return url;
}
