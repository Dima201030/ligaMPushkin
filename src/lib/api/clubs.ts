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
