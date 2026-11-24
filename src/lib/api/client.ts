import {
  CLUB_COOKIE,
  CLUB_HEADER,
  DEFAULT_CLUB_SLUG,
  normalizeClubSlug,
  parseClubCookie,
  resolveClubSlug,
} from "@/lib/club/tenant";

const API_BASE =
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export interface ApiErrorBody {
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiPath(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}/api${suffix}`;
}

/**
 * Absolute API URL for server components / RSC (bypass Next relative fetch).
 * Never use from the browser — 127.0.0.1:3020 is unreachable there;
 * browser traffic must stay same-origin via basePath + nginx `/api`.
 */
export function serverApiURL(path: string): string {
  const base = (process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3020").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${suffix}`;
}

/** Absolute only on the server. Browser always gets same-origin `apiPath`. */
export function resolveAbsoluteFlag(absolute?: boolean): boolean {
  if (typeof window !== "undefined") return false;
  return Boolean(absolute);
}

export async function parseJson<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

function clubSlugFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  return parseClubCookie(document.cookie);
}

/** Resolve active club slug for the current request / browser. */
export async function getRequestClubSlug(cookieHeader?: string): Promise<string> {
  if (cookieHeader) {
    return resolveClubSlug(parseClubCookie(cookieHeader), DEFAULT_CLUB_SLUG);
  }
  if (typeof window !== "undefined") {
    return resolveClubSlug(clubSlugFromDocumentCookie(), DEFAULT_CLUB_SLUG);
  }
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return resolveClubSlug(jar.get(CLUB_COOKIE)?.value, DEFAULT_CLUB_SLUG);
  } catch {
    return DEFAULT_CLUB_SLUG;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { absolute?: boolean; clubSlug?: string },
): Promise<{ response: Response; data: T | undefined }> {
  const { absolute, clubSlug: explicitClub, ...rest } = init ?? {};
  // Hard guard: even if a caller passes absolute:true from a client component
  // (MatchScoreDesk, TournamentManage, BracketStudio, …), never hit localhost.
  const url = resolveAbsoluteFlag(absolute) ? serverApiURL(path) : apiPath(path);

  const incoming = new Headers(rest.headers);
  const cookieHeader = incoming.get("Cookie") ?? incoming.get("cookie") ?? undefined;
  const clubSlug =
    normalizeClubSlug(explicitClub) ||
    normalizeClubSlug(incoming.get(CLUB_HEADER)) ||
    (await getRequestClubSlug(cookieHeader));

  // Club catalog endpoints are global — still fine to send header.
  if (!incoming.has(CLUB_HEADER)) {
    incoming.set(CLUB_HEADER, clubSlug);
  }

  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body && !(rest.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...Object.fromEntries(incoming.entries()),
    },
  });
  const data = await parseJson<T>(response);
  return { response, data };
}
