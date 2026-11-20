import type { CategorySlug, Player, RankingEntry } from "@/lib/types";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

interface ApiRanking {
  position: number;
  previous_position?: number | null;
  player_id: string;
  slug: string;
  first_name: string;
  last_name: string;
  category: string;
  points: number;
  rating: number;
  singles_points?: number;
  doubles_points?: number;
  calculated_at?: string;
}

export interface RankingRow extends RankingEntry {
  player: Player;
  calculatedAt?: string;
}

export interface RankingsPage {
  season: number;
  source: "snapshot" | "live" | string;
  ranking: RankingEntry[];
  rows: RankingRow[];
  totalPlayers: number;
}

async function throwIfNotOk(response: Response, data: ApiErrorBody | undefined, fallback: string) {
  if (response.ok) return;
  throw new ApiError(response.status, data?.code, data?.message ?? fallback);
}

function mapRow(raw: ApiRanking): RankingRow {
  const category = raw.category as CategorySlug;
  const previous = raw.previous_position ?? raw.position;
  return {
    position: raw.position,
    previousPosition: previous,
    playerId: raw.player_id,
    points: raw.points,
    rating: raw.rating,
    category,
    calculatedAt: raw.calculated_at,
    player: {
      id: raw.player_id,
      slug: raw.slug,
      firstName: raw.first_name,
      lastName: raw.last_name,
      gender: "male",
      birthYear: 0,
      city: "",
      category,
      rating: raw.rating,
      points: raw.points,
      wins: 0,
      losses: 0,
      tournamentsCount: 0,
      titlesCount: 0,
      bestRank: raw.position,
      trend: [],
      bio: "",
      memberSince: "",
      status: "active",
    },
  };
}

export async function fetchRankings(
  filters: { category?: CategorySlug; season?: number } = {},
  opts?: { cookie?: string },
): Promise<RankingsPage> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.season) params.set("season", String(filters.season));
  const qs = params.toString();
  const { response, data } = await apiRequest<{
    season: number;
    source: string;
    rankings: ApiRanking[];
  }>(`/rankings${qs ? `?${qs}` : ""}`, {
    absolute: true,
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить рейтинг");
  const rows = (data?.rankings ?? []).map(mapRow);
  return {
    season: data?.season ?? new Date().getFullYear(),
    source: data?.source ?? "live",
    ranking: rows.map(({ player: _player, calculatedAt: _at, ...entry }) => entry),
    rows,
    totalPlayers: rows.length,
  };
}
