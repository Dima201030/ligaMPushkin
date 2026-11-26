import { ApiError, apiRequest, type ApiErrorBody } from "./client";

export async function applyManualRating(input: {
  playerId: string;
  pointsDelta: number;
  ratingDelta?: number;
  reason: string;
  discipline?: string;
  season?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>("/organizer/ratings/manual", {
    method: "POST",
    body: JSON.stringify({
      player_id: input.playerId,
      points_delta: input.pointsDelta,
      rating_delta: input.ratingDelta ?? 0,
      reason: input.reason,
      discipline: input.discipline ?? "overall",
      season: input.season,
    }),
  });
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось скорректировать рейтинг" };
}

export async function snapshotRatings(season?: number): Promise<{ ok: true; players: number } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ players: number } & ApiErrorBody>("/organizer/ratings/snapshot", {
    method: "POST",
    body: JSON.stringify({ season }),
  });
  if (response.ok) return { ok: true, players: data?.players ?? 0 };
  return { ok: false, error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось пересчитать рейтинг" };
}

export async function updateOrganizerPlayer(
  id: string,
  input: { level?: string; city?: string; bio?: string; playerStatus?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(`/organizer/players/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      level: input.level,
      city: input.city,
      bio: input.bio,
      player_status: input.playerStatus,
    }),
  });
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось обновить игрока" };
}

export async function fetchOrganizerPlayersList(opts?: { cookie?: string }) {
  const { response, data } = await apiRequest<{
    players: Array<{
      id: string;
      slug: string;
      first_name: string;
      last_name: string;
      level: string;
      city: string;
      bio: string;
      status: string;
      birth_date?: string | null;
      verification_status?: string;
      rating: number;
      points: number;
      wins: number;
      losses: number;
      member_since?: string;
      email?: string;
      phone?: string | null;
      user_status?: string;
      role?: string;
      is_placeholder?: boolean;
    }>;
  }>("/organizer/players", {
    // Server: hit Go API directly. Browser: same-origin /basePath/api via nginx
    // (absolute 127.0.0.1:3020 is unreachable from the client → «Не удалось загрузить»).
    absolute: typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, undefined, "Не удалось загрузить игроков");
  }
  return data?.players ?? [];
}

export async function confirmPlayerVerification(
  id: string,
  input: {
    firstName: string;
    lastName: string;
    birthDate: string;
    level?: string;
    phone?: string;
    status: "approved" | "rejected";
    note?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { response, data } = await apiRequest<ApiErrorBody>(
      `/organizer/players/${encodeURIComponent(id)}/verify`,
      {
        method: "POST",
        body: JSON.stringify({
          first_name: input.firstName,
          last_name: input.lastName,
          birth_date: input.birthDate,
          level: input.level,
          phone: input.phone,
          status: input.status,
          note: input.note,
        }),
      },
    );
    if (response.ok) return { ok: true };
    return { ok: false, error: data?.message ?? "Не удалось подтвердить профиль" };
  } catch {
    return {
      ok: false,
      error: "Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.",
    };
  }
}
