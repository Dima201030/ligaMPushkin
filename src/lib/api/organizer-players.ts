import { apiRequest, type ApiErrorBody } from "./client";
import type { CategorySlug } from "@/lib/types";

export interface PlaceholderPlayer {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  level: CategorySlug;
  phone?: string;
  verificationStatus: string;
  rating: number;
  points: number;
  userStatus: string;
  isPlaceholder: true;
  createdAt?: string;
}

export async function createPlaceholderPlayer(input: {
  firstName: string;
  lastName: string;
  level: CategorySlug;
  phone?: string;
}): Promise<{ ok: true; player: Record<string, unknown> } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ player: Record<string, unknown> } & ApiErrorBody>(
    "/organizer/players",
    {
      method: "POST",
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        level: input.level,
        phone: input.phone || undefined,
      }),
    },
  );
  if (response.ok) return { ok: true, player: data?.player ?? {} };
  return { ok: false, error: data?.message ?? "Не удалось добавить игрока" };
}

export async function listPlaceholderPlayers(): Promise<PlaceholderPlayer[]> {
  const { response, data } = await apiRequest<{
    players: Array<{
      id: string;
      first_name: string;
      last_name: string;
      slug: string;
      level: string;
      phone?: string | null;
      verification_status?: string;
      rating: number;
      points: number;
      user_status: string;
      created_at?: string;
    }>;
  }>("/organizer/players/placeholders");
  if (!response.ok) return [];
  return (data?.players ?? []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    slug: row.slug,
    level: row.level as CategorySlug,
    phone: row.phone ?? undefined,
    verificationStatus: row.verification_status ?? "approved",
    rating: row.rating,
    points: row.points,
    userStatus: row.user_status,
    isPlaceholder: true as const,
    createdAt: row.created_at,
  }));
}

export async function mergePlaceholderPlayer(
  placeholderId: string,
  sourceUserId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(
    `/organizer/players/${encodeURIComponent(placeholderId)}/merge`,
    {
      method: "POST",
      body: JSON.stringify({ source_user_id: sourceUserId }),
    },
  );
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось объединить аккаунты" };
}

/** Owner erase: anonymize account and hide from members/ranking/players/registrations. */
export async function deleteOrganizerPlayer(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(
    `/organizer/players/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (response.ok) return { ok: true };
  return { ok: false, error: data?.message ?? "Не удалось удалить аккаунт" };
}
