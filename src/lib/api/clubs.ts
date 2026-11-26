import { normalizeUuid } from "@/lib/uuid";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

export interface LeagueClub {
  id: string;
  slug: string;
  name: string;
  city: string;
  status: string;
  settings?: Record<string, unknown>;
}

interface ApiClub {
  id: string;
  slug: string;
  name: string;
  city: string;
  status: string;
  settings?: Record<string, unknown>;
}

function mapClub(raw: ApiClub): LeagueClub {
  return {
    id: normalizeUuid(raw.id),
    slug: raw.slug,
    name: raw.name,
    city: raw.city,
    status: raw.status,
    settings: raw.settings,
  };
}

export async function fetchClubs(opts?: { cookie?: string; absolute?: boolean }): Promise<LeagueClub[]> {
  const { response, data } = await apiRequest<{ clubs: ApiClub[] } & ApiErrorBody>("/clubs", {
    absolute: opts?.absolute ?? typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message || "Не удалось загрузить клубы");
  }
  return (data?.clubs ?? []).map(mapClub);
}

export async function fetchClubBySlug(
  slug: string,
  opts?: { cookie?: string; absolute?: boolean },
): Promise<LeagueClub | null> {
  const { response, data } = await apiRequest<{ club: ApiClub } & ApiErrorBody>(
    `/clubs/${encodeURIComponent(slug)}`,
    {
      absolute: opts?.absolute ?? typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  if (response.status === 404) return null;
  if (!response.ok || !data?.club) {
    throw new ApiError(response.status, data?.code, data?.message || "Не удалось загрузить клуб");
  }
  return mapClub(data.club);
}

async function serverCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const header = jar.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
    return header || undefined;
  } catch {
    return undefined;
  }
}

/** Current tenant club for organizer (includes safe settings). */
export async function fetchOrganizerClub(): Promise<LeagueClub> {
  const cookieHeader = await serverCookieHeader();
  const { response, data } = await apiRequest<{ club: ApiClub } & ApiErrorBody>("/organizer/club", {
    absolute: typeof window === "undefined",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
  if (!response.ok || !data?.club) {
    throw new ApiError(response.status, data?.code, data?.message || "Не удалось загрузить клуб");
  }
  return mapClub(data.club);
}

export interface UpdateOrganizerClubInput {
  name?: string;
  city?: string;
  settings?: {
    timezone?: string | null;
    locale?: string | null;
  };
}

export async function updateOrganizerClub(
  input: UpdateOrganizerClubInput,
): Promise<{ ok: true; club: LeagueClub } | { ok: false; error: string; code?: string }> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.city !== undefined) body.city = input.city;
  if (input.settings !== undefined) body.settings = input.settings;

  const { response, data } = await apiRequest<{ club: ApiClub } & ApiErrorBody>("/organizer/club", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (response.ok && data?.club) {
    return { ok: true, club: mapClub(data.club) };
  }
  return {
    ok: false,
    error: data?.message ?? "Не удалось сохранить клуб",
    code: data?.code,
  };
}

