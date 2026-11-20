/** Tenant club slug helpers. Product brand is Pairly; club slug is separate. */

export const CLUB_COOKIE = "pairly_club";
export const CLUB_HEADER = "X-Club-Slug";
export const CLUB_PATH_PREFIX = "/c";

/** Default tenant for the first club install — not a product name. */
export const DEFAULT_CLUB_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_CLUB_SLUG?.trim().toLowerCase() || "mr-pushkin";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeClubSlug(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  if (!slug || !SLUG_RE.test(slug)) return null;
  return slug;
}

export function resolveClubSlug(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    const slug = normalizeClubSlug(candidate);
    if (slug) return slug;
  }
  return DEFAULT_CLUB_SLUG;
}

/** Strip optional /c/:slug prefix from a pathname (no basePath). */
export function stripClubPrefix(pathname: string): {
  clubSlug: string | null;
  restPath: string;
} {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const match = path.match(/^\/c\/([a-z0-9]+(?:-[a-z0-9]+)*)(\/.*)?$/);
  if (!match) {
    return { clubSlug: null, restPath: path === "" ? "/" : path };
  }
  const rest = match[2] && match[2].length > 0 ? match[2] : "/";
  return { clubSlug: match[1], restPath: rest };
}

/** Build /c/:slug/... path for switching tenants while keeping the current page. */
export function clubPath(slug: string, pathname = "/"): string {
  const normalized = normalizeClubSlug(slug) || DEFAULT_CLUB_SLUG;
  const { restPath } = stripClubPrefix(pathname);
  if (restPath === "/") return `${CLUB_PATH_PREFIX}/${normalized}`;
  return `${CLUB_PATH_PREFIX}/${normalized}${restPath}`;
}

export function parseClubCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CLUB_COOKIE) {
      return normalizeClubSlug(decodeURIComponent(rest.join("=")));
    }
  }
  return null;
}
