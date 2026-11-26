import type { Match, MatchSide, MatchStatus, TournamentFormat, TournamentType } from "@/lib/types";
import { normalizeUuid, uuidsEqual } from "@/lib/uuid";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

interface ApiPlayerBrief {
  id: string;
  slug?: string;
  first_name: string;
  last_name: string;
  level: string;
}

interface ApiMatchSide {
  side: number;
  player_id?: string | null;
  partner_id?: string | null;
  seed?: number | null;
  label?: string | null;
  is_bye?: boolean;
  player?: ApiPlayerBrief | null;
  partner?: ApiPlayerBrief | null;
}

export interface ApiMatch {
  id: string;
  tournament_id: string;
  tournament_slug?: string;
  tournament_title?: string;
  tournament_type?: string;
  bracket_key: string;
  stage: string;
  round_index: number;
  position: number;
  round_label: string;
  scheduled_at?: string | null;
  court?: string | null;
  status: string;
  score_sets?: number[][] | null;
  score_text?: string | null;
  winner_side?: number | null;
  next_match_id?: string | null;
  next_slot?: number | null;
  is_bye: boolean;
  version: number;
  side1: ApiMatchSide;
  side2: ApiMatchSide;
}

export interface BracketMeta {
  status: string;
  version: number;
  publishedAt?: string;
  thirdPlace: boolean;
  format: TournamentFormat | string;
  matchCount: number;
}

export interface BracketDrawSummary {
  entriesCount: number;
  bracketSize: number;
  byes: number;
  matchCount: number;
}

function mapBracketMeta(raw: {
  status: string;
  version?: number;
  published_at?: string | null;
  third_place?: boolean;
  format: string;
  match_count?: number;
}): BracketMeta {
  return {
    status: raw.status,
    version: raw.version ?? 0,
    publishedAt: raw.published_at ?? undefined,
    thirdPlace: Boolean(raw.third_place),
    format: raw.format,
    matchCount: raw.match_count ?? 0,
  };
}

function mapSide(side: ApiMatchSide): MatchSide {
  const briefs = [side.player, side.partner].filter(Boolean) as ApiPlayerBrief[];
  const playerIds = [side.player_id, side.partner_id]
    .filter((id): id is string => Boolean(id))
    .map((id) => normalizeUuid(id));
  // Keep bye / explicit labels only. Do not copy brief names into label —
  // MatchRow links /players/{slug} from players[]; a name label shadows that.
  let label: string | undefined;
  if (side.is_bye) {
    label = "Пропуск";
  } else if (briefs.length === 0 && side.label?.trim()) {
    label = side.label.trim();
  }
  return {
    playerIds,
    players: briefs.map((brief) => ({
      id: normalizeUuid(brief.id),
      slug: brief.slug?.trim() || undefined,
      firstName: brief.first_name,
      lastName: brief.last_name,
    })),
    seed: side.seed ?? undefined,
    label,
  };
}

export function mapMatch(raw: ApiMatch, fallbackTitle = "Турнир"): Match {
  const type = (raw.tournament_type ?? "singles") as TournamentType;
  const status = (raw.status === "bye" ? "bye" : raw.status) as MatchStatus;
  return {
    id: normalizeUuid(raw.id),
    tournamentId: normalizeUuid(raw.tournament_id),
    tournamentSlug: raw.tournament_slug,
    tournamentTitle: raw.tournament_title ?? fallbackTitle,
    type,
    stage: raw.round_label || raw.stage,
    round: raw.stage || `R${raw.round_index}`,
    roundIndex: raw.round_index,
    bracketStage: raw.stage,
    scheduledAt: raw.scheduled_at ?? new Date().toISOString(),
    court: raw.court ?? undefined,
    status,
    side1: mapSide(raw.side1),
    side2: mapSide(raw.side2),
    side1Bye: Boolean(raw.side1?.is_bye),
    side2Bye: Boolean(raw.side2?.is_bye),
    score: raw.score_text ?? undefined,
    winner: raw.winner_side === 1 || raw.winner_side === 2 ? (raw.winner_side as 1 | 2) : null,
    isBye: Boolean(raw.is_bye) || status === "bye",
    isDoubles: ["doubles", "mixed", "teams"].includes(type),
    version: raw.version,
  };
}

async function throwIfNotOk(response: Response, data: ApiErrorBody | undefined, fallback: string) {
  if (response.ok) return;
  throw new ApiError(response.status, data?.code, data?.message ?? fallback);
}

function serverOpts(opts?: { cookie?: string; absolute?: boolean }) {
  return {
    // Default absolute on server only; browser must stay same-origin.
    absolute: opts?.absolute ?? typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  } as const;
}

export async function fetchTournamentBracket(
  slug: string,
  opts?: { cookie?: string; absolute?: boolean },
): Promise<{ bracket: BracketMeta; matches: Match[] }> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
    matches: ApiMatch[];
  }>(`/tournaments/${encodeURIComponent(slug)}/bracket`, serverOpts(opts));
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить сетку");
  const title = data?.matches?.[0]?.tournament_title;
  return {
    bracket: data?.bracket
      ? mapBracketMeta(data.bracket)
      : { status: "none", version: 0, thirdPlace: false, format: "olympic", matchCount: 0 },
    matches: (data?.matches ?? []).map((item) => mapMatch(item, title)),
  };
}

export async function fetchTournamentMatches(
  slug: string,
  opts?: { cookie?: string; absolute?: boolean },
): Promise<Match[]> {
  const { response, data } = await apiRequest<{ matches: ApiMatch[] }>(
    `/tournaments/${encodeURIComponent(slug)}/matches`,
    serverOpts(opts),
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить матчи");
  return (data?.matches ?? []).map((item) => mapMatch(item));
}

export async function fetchOrganizerBracket(
  tournamentId: string,
  opts?: { cookie?: string; absolute?: boolean },
): Promise<{ bracket: BracketMeta; matches: Match[] }> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
    matches: ApiMatch[];
  }>(`/organizer/tournaments/${encodeURIComponent(tournamentId)}/bracket`, serverOpts(opts));
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить сетку");
  const title = data?.matches?.[0]?.tournament_title;
  return {
    bracket: data?.bracket
      ? mapBracketMeta(data.bracket)
      : { status: "none", version: 0, thirdPlace: false, format: "olympic", matchCount: 0 },
    matches: (data?.matches ?? []).map((item) => mapMatch(item, title)),
  };
}

export async function fetchOrganizerTournamentMatches(
  tournamentId: string,
  opts?: { cookie?: string; absolute?: boolean },
): Promise<Match[]> {
  const { response, data } = await apiRequest<{ matches: ApiMatch[] }>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/matches`,
    serverOpts(opts),
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить матчи");
  return (data?.matches ?? []).map((item) => mapMatch(item));
}

export async function fetchOrganizerMatches(opts?: { cookie?: string; absolute?: boolean }): Promise<Match[]> {
  const { response, data } = await apiRequest<{ matches: ApiMatch[] }>("/organizer/matches", serverOpts(opts));
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить матчи");
  return (data?.matches ?? []).map((item) => mapMatch(item));
}

/**
 * Fresh match snapshot for optimistic concurrency (version).
 * Relies on apiRequest / serverOpts: browser → same-origin, server → absolute.
 */
export async function fetchOrganizerMatch(matchId: string): Promise<Match | null> {
  const all = await fetchOrganizerMatches();
  return all.find((match) => uuidsEqual(match.id, matchId)) ?? null;
}

/**
 * Run a match mutation with the latest version. On 409 conflict, refetch once and retry.
 * Keeps the scoring API contract (sets + version) unchanged.
 * If the version refetch fails (network), falls back to the local match so save still works.
 */
export async function withFreshMatchVersion<T>(
  matchId: string,
  local: Pick<Match, "id" | "version"> & Partial<Match>,
  run: (fresh: Match) => Promise<T>,
): Promise<T> {
  let fresh: Match = { ...(local as Match), id: matchId };
  try {
    const remote = await fetchOrganizerMatch(matchId);
    if (remote) {
      fresh = remote;
      if (
        local.version !== undefined &&
        remote.version !== undefined &&
        remote.version < local.version
      ) {
        fresh = { ...remote, version: local.version };
      }
    } else if (local.version === undefined) {
      throw new ApiError(404, "not_found", "Матч не найден — обновите страницу");
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw err;
    if (local.version === undefined) {
      throw err instanceof ApiError
        ? err
        : new ApiError(502, "upstream", "Не удалось обновить данные матча. Обновите страницу.");
    }
    // Keep local version — submitScore still goes through same-origin proxy.
  }

  try {
    return await run(fresh);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 409 || err.code !== "conflict") {
      throw err;
    }
    let again: Match | null = null;
    try {
      again = await fetchOrganizerMatch(matchId);
    } catch {
      throw err;
    }
    if (!again || again.version === fresh.version) {
      throw err;
    }
    return run(again);
  }
}

export type GenerateBracketInput = {
  thirdPlace?: boolean;
  groupSize?: number;
  qualifiersPerGroup?: number;
  seeding?: "seed" | "rating" | "random";
  randomSeed?: number;
};

export async function generateBracket(
  tournamentId: string,
  input: GenerateBracketInput = {},
): Promise<{ bracket: BracketMeta; draw?: BracketDrawSummary; matches: Match[] }> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
    draw?: {
      entries_count: number;
      bracket_size: number;
      byes: number;
      match_count: number;
    };
    matches: ApiMatch[];
  } & ApiErrorBody>(`/organizer/tournaments/${encodeURIComponent(tournamentId)}/bracket/generate`, {
    method: "POST",
    body: JSON.stringify({
      third_place: input.thirdPlace,
      group_size: input.groupSize,
      qualifiers_per_group: input.qualifiersPerGroup,
      seeding: input.seeding,
      random_seed: input.randomSeed,
    }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось сгенерировать сетку");
  }
  const title = data?.matches?.[0]?.tournament_title;
  return {
    bracket: data?.bracket
      ? mapBracketMeta(data.bracket)
      : { status: "draft", version: 0, thirdPlace: Boolean(input.thirdPlace), format: "olympic", matchCount: 0 },
    draw: data?.draw
      ? {
          entriesCount: data.draw.entries_count,
          bracketSize: data.draw.bracket_size,
          byes: data.draw.byes,
          matchCount: data.draw.match_count,
        }
      : undefined,
    matches: (data?.matches ?? []).map((item) => mapMatch(item, title)),
  };
}

export type BracketSlotRef = {
  matchId: string;
  side: 1 | 2;
};

export async function swapBracketSlots(
  tournamentId: string,
  a: BracketSlotRef,
  b: BracketSlotRef,
): Promise<{ bracket: BracketMeta; matches: Match[] }> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
    matches: ApiMatch[];
  } & ApiErrorBody>(`/organizer/tournaments/${encodeURIComponent(tournamentId)}/bracket/swap`, {
    method: "POST",
    body: JSON.stringify({
      a: { match_id: a.matchId, side: a.side },
      b: { match_id: b.matchId, side: b.side },
    }),
  });
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось поменять слоты");
  }
  const title = data?.matches?.[0]?.tournament_title;
  return {
    bracket: data?.bracket
      ? mapBracketMeta(data.bracket)
      : { status: "draft", version: 0, thirdPlace: false, format: "olympic", matchCount: 0 },
    matches: (data?.matches ?? []).map((item) => mapMatch(item, title)),
  };
}

export async function publishBracket(tournamentId: string): Promise<BracketMeta> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
  } & ApiErrorBody>(`/organizer/tournaments/${encodeURIComponent(tournamentId)}/bracket/publish`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось опубликовать сетку");
  }
  return data?.bracket
    ? mapBracketMeta(data.bracket)
    : { status: "published", version: 0, thirdPlace: false, format: "olympic", matchCount: 0 };
}

/** Backfill playoff A1/B1/… slots from finished group standings. */
export async function syncBracketQualifiers(
  tournamentId: string,
): Promise<{ bracket: BracketMeta; matches: Match[] }> {
  const { response, data } = await apiRequest<{
    bracket: {
      status: string;
      version: number;
      published_at?: string | null;
      third_place: boolean;
      format: string;
      match_count?: number;
    };
    matches: ApiMatch[];
  } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/bracket/sync-qualifiers`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось обновить плей-офф");
  }
  const title = data?.matches?.[0]?.tournament_title;
  return {
    bracket: data?.bracket
      ? mapBracketMeta(data.bracket)
      : { status: "published", version: 0, thirdPlace: false, format: "olympic", matchCount: 0 },
    matches: (data?.matches ?? []).map((item) => mapMatch(item, title)),
  };
}

export async function submitScore(
  matchId: string,
  input: { sets: number[][]; version: number },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}/score`,
    {
      method: "POST",
      body: JSON.stringify({ sets: input.sets, version: input.version }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось сохранить счёт");
  }
  return mapMatch(data.match);
}

export async function walkover(
  matchId: string,
  input: { winnerSide: 1 | 2; reason?: string; version: number },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}/walkover`,
    {
      method: "POST",
      body: JSON.stringify({
        winner_side: input.winnerSide,
        reason: input.reason,
        version: input.version,
      }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось зафиксировать тех. победу");
  }
  return mapMatch(data.match);
}

export async function retireMatch(
  matchId: string,
  input: { winnerSide: 1 | 2; sets?: number[][]; reason?: string; version: number },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}/retire`,
    {
      method: "POST",
      body: JSON.stringify({
        winner_side: input.winnerSide,
        sets: input.sets,
        reason: input.reason,
        version: input.version,
      }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось зафиксировать отказ");
  }
  return mapMatch(data.match);
}

export async function disqualifyMatch(
  matchId: string,
  input: { winnerSide: 1 | 2; reason?: string; version: number },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}/disqualify`,
    {
      method: "POST",
      body: JSON.stringify({
        winner_side: input.winnerSide,
        reason: input.reason,
        version: input.version,
      }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось дисквалифицировать");
  }
  return mapMatch(data.match);
}

export async function fetchMyMatches(opts?: { cookie?: string }): Promise<Match[]> {
  const { response, data } = await apiRequest<{ matches: ApiMatch[] }>("/auth/me/matches", {
    absolute: typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (!response.ok) return [];
  return (data?.matches ?? []).map((item) => mapMatch(item));
}

export async function cancelMatch(
  matchId: string,
  input: { reason?: string; version: number },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ reason: input.reason, version: input.version }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось отменить матч");
  }
  return mapMatch(data.match);
}

export async function updateSchedule(
  matchId: string,
  input: { scheduledAt?: string; court?: string; markLive?: boolean },
): Promise<Match> {
  const { response, data } = await apiRequest<{ match: ApiMatch } & ApiErrorBody>(
    `/organizer/matches/${encodeURIComponent(matchId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        scheduled_at: input.scheduledAt,
        court: input.court,
        mark_live: input.markLive,
      }),
    },
  );
  if (!response.ok || !data?.match) {
    throw new ApiError(response.status, data?.code, data?.message ?? "Не удалось обновить матч");
  }
  return mapMatch(data.match);
}

/** Parse UI score text like "6:4, 3:6, 10:7" into [[6,4],[3,6],[10,7]]. */
export function parseScoreDraft(input: string): number[][] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[,;]+/).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;
  const sets: number[][] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)\s*[:\-–]\s*(\d+)$/);
    if (!match) return null;
    sets.push([Number(match[1]), Number(match[2])]);
  }
  return sets;
}
