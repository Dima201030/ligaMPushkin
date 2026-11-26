import type { CategorySlug, Player } from "@/lib/types";
import { normalizeUuid } from "@/lib/uuid";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

interface ApiPlayer {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  level: string;
  category?: string;
  gender?: string | null;
  city: string;
  bio: string;
  avatar_url?: string | null;
  status: string;
  rating: number;
  points: number;
  singles_points?: number;
  doubles_points?: number;
  matches_played?: number;
  wins: number;
  losses: number;
  provisional?: boolean;
  member_since?: string;
}

function mapPlayer(raw: ApiPlayer): Player {
  const gender =
    raw.gender === "female" || raw.gender === "male" ? raw.gender : "male";
  const category = (raw.category || raw.level || "rookies") as CategorySlug;
  return {
    id: normalizeUuid(raw.id),
    slug: raw.slug,
    firstName: raw.first_name,
    lastName: raw.last_name,
    gender,
    birthYear: 0,
    city: raw.city || "",
    category,
    rating: raw.rating,
    points: raw.points,
    wins: raw.wins,
    losses: raw.losses,
    tournamentsCount: 0,
    titlesCount: 0,
    bestRank: 0,
    trend: [],
    bio: raw.bio || "",
    memberSince: raw.member_since || "",
    status: (raw.status as Player["status"]) || "active",
    avatarUrl: raw.avatar_url ?? undefined,
  };
}

async function throwIfNotOk(response: Response, data: ApiErrorBody | undefined, fallback: string) {
  if (response.ok) return;
  throw new ApiError(response.status, data?.code, data?.message ?? fallback);
}

export type PlayerListFilters = {
  category?: CategorySlug;
  query?: string;
  limit?: number;
  offset?: number;
};

function listQuery(filters: PlayerListFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.query) params.set("q", filters.query);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchPlayers(
  filters: PlayerListFilters = {},
  opts?: { cookie?: string },
): Promise<Player[]> {
  const { response, data } = await apiRequest<{ players: ApiPlayer[] }>(
    `/players${listQuery(filters)}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить игроков");
  return (data?.players ?? []).map(mapPlayer);
}

export async function fetchPlayerBySlug(
  slug: string,
  opts?: { cookie?: string },
): Promise<Player | null> {
  const { response, data } = await apiRequest<{ player: ApiPlayer }>(
    `/players/${encodeURIComponent(slug)}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить игрока");
  return data?.player ? mapPlayer(data.player) : null;
}
