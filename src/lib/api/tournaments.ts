import type {
  CategorySlug,
  Registration,
  RegistrationStatus,
  Surface,
  Tournament,
  TournamentImage,
  TournamentFormat,
  TournamentStatus,
  TournamentType,
  Venue,
} from "@/lib/types";
import { resolveCoverUrl } from "@/lib/media";
import { normalizeUuid } from "@/lib/uuid";
import { ApiError, apiRequest, type ApiErrorBody } from "./client";

interface ApiVenue {
  id: string;
  name: string;
  address: string;
  courts: number;
  surface: string;
}

interface ApiTournament {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  category: string;
  surface: string;
  format: string;
  status: string;
  starts_at: string;
  ends_at?: string | null;
  registration_opens_at: string;
  registration_closes_at: string;
  venue: ApiVenue;
  entry_fee: number;
  max_participants: number;
  cover_url?: string | null;
  regulations: string;
  season: number;
  is_hidden?: boolean;
  winners?: { place: number; player_ids: string[] }[];
  suggested_places?: { place: number; player_ids: string[] }[];
  places_mismatch?: boolean;
  confirmed_count?: number;
  waitlist_count?: number;
}

interface ApiTournamentImage {
  id: string;
  url: string;
  created_at: string;
}

interface ApiPlayerBrief {
  id: string;
  first_name: string;
  last_name: string;
  level: string;
}

interface ApiRegistration {
  id: string;
  tournament_id: string;
  player_id: string;
  partner_id?: string | null;
  looking_for_partner: boolean;
  status: string;
  seed?: number | null;
  waitlist_position?: number | null;
  registered_at: string;
  player: ApiPlayerBrief;
  partner?: ApiPlayerBrief | null;
}

function mapVenue(raw: ApiVenue): Venue {
  return {
    id: normalizeUuid(raw.id),
    name: raw.name,
    address: raw.address,
    courts: raw.courts,
    surface: raw.surface as Surface,
  };
}

function mapTournamentImage(raw: ApiTournamentImage): TournamentImage {
  return { id: normalizeUuid(raw.id), url: resolveCoverUrl(raw.url), createdAt: raw.created_at };
}

export function mapTournament(
  raw: ApiTournament,
  participants: Registration[] = [],
  images: ApiTournamentImage[] = [],
): Tournament {
  return {
    id: normalizeUuid(raw.id),
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    type: raw.type as TournamentType,
    category: raw.category as CategorySlug,
    surface: raw.surface as Surface,
    format: raw.format as TournamentFormat,
    status: raw.status as TournamentStatus,
    startsAt: raw.starts_at,
    endsAt: raw.ends_at ?? undefined,
    registrationOpensAt: raw.registration_opens_at,
    registrationClosesAt: raw.registration_closes_at,
    venue: mapVenue(raw.venue),
    entryFee: raw.entry_fee,
    maxParticipants: raw.max_participants,
    coverUrl: raw.cover_url ? resolveCoverUrl(raw.cover_url) : undefined,
    regulations: raw.regulations,
    participants,
    images: images.map(mapTournamentImage),
    season: raw.season,
    isHidden: raw.is_hidden ?? false,
    winners: (raw.winners ?? []).map((winner) => ({
      place: winner.place as 1 | 2 | 3,
      playerIds: (winner.player_ids ?? []).map((id) => normalizeUuid(id)),
    })),
    suggestedPlaces: (raw.suggested_places ?? []).map((winner) => ({
      place: winner.place as 1 | 2 | 3,
      playerIds: (winner.player_ids ?? []).map((id) => normalizeUuid(id)),
    })),
    placesMismatch: Boolean(raw.places_mismatch),
  };
}

export function mapRegistration(raw: ApiRegistration): Registration & {
  id: string;
  player?: { id: string; firstName: string; lastName: string; level: string; slug: string; category: CategorySlug; rating: number };
  partner?: { id: string; firstName: string; lastName: string; level: string; slug: string; category: CategorySlug; rating: number };
} {
  const player = {
    id: normalizeUuid(raw.player.id),
    firstName: raw.player.first_name,
    lastName: raw.player.last_name,
    level: raw.player.level,
    slug: raw.player.id,
    category: raw.player.level as CategorySlug,
    rating: 0,
  };
  const partner = raw.partner
    ? {
        id: normalizeUuid(raw.partner.id),
        firstName: raw.partner.first_name,
        lastName: raw.partner.last_name,
        level: raw.partner.level,
        slug: raw.partner.id,
        category: raw.partner.level as CategorySlug,
        rating: 0,
      }
    : undefined;
  return {
    id: normalizeUuid(raw.id),
    playerId: normalizeUuid(raw.player_id),
    partnerId: raw.partner_id ? normalizeUuid(raw.partner_id) : undefined,
    lookingForPartner: raw.looking_for_partner,
    status: raw.status as RegistrationStatus,
    seed: raw.seed ?? undefined,
    registeredAt: raw.registered_at,
    player,
    partner,
  };
}

async function throwIfNotOk(response: Response, data: ApiErrorBody | undefined, fallback: string) {
  if (response.ok) return;
  throw new ApiError(response.status, data?.code, data?.message ?? fallback);
}

export type TournamentListFilters = {
  status?: TournamentStatus | "upcoming" | "all";
  category?: CategorySlug;
  type?: TournamentType;
  year?: number;
  query?: string;
};

function listQuery(filters: TournamentListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.year) params.set("year", String(filters.year));
  if (filters.query) params.set("q", filters.query);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchTournaments(
  filters: TournamentListFilters = {},
  opts?: { cookie?: string },
): Promise<Tournament[]> {
  const { response, data } = await apiRequest<{ tournaments: ApiTournament[] }>(
    `/tournaments${listQuery(filters)}`,
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить турниры");
  return (data?.tournaments ?? []).map((item) => mapTournament(item));
}

export async function fetchTournamentBySlug(
  slug: string,
  opts?: { cookie?: string },
): Promise<{ tournament: Tournament; registrations: ReturnType<typeof mapRegistration>[] } | null> {
  const { response, data } = await apiRequest<{
    tournament: ApiTournament;
    registrations: ApiRegistration[];
    images: ApiTournamentImage[];
  }>(`/tournaments/${encodeURIComponent(slug)}`, {
    absolute: typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить турнир");
  if (!data?.tournament) return null;
  const registrations = (data.registrations ?? []).map(mapRegistration);
  const participants: Registration[] = registrations.map((item) => ({
    playerId: item.playerId,
    partnerId: item.partnerId,
    lookingForPartner: item.lookingForPartner,
    status: item.status,
    seed: item.seed,
    registeredAt: item.registeredAt,
  }));
  return {
    tournament: mapTournament(data.tournament, participants, data.images ?? []),
    registrations,
  };
}

export async function fetchOrganizerTournaments(opts?: { cookie?: string }): Promise<Tournament[]> {
  const { response, data } = await apiRequest<{ tournaments: ApiTournament[] }>(
    "/organizer/tournaments",
    {
      absolute: typeof window === "undefined",
      headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
    },
  );
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить турниры");
  return (data?.tournaments ?? []).map((item) => mapTournament(item));
}

export async function fetchOrganizerTournament(
  id: string,
  opts?: { cookie?: string },
): Promise<{
  tournament: Tournament;
  registrations: ReturnType<typeof mapRegistration>[];
  counts: { confirmed: number; pending: number; waitlist: number };
} | null> {
  const { response, data } = await apiRequest<{
    tournament: ApiTournament;
    registrations: ApiRegistration[];
    images: ApiTournamentImage[];
    counts: { confirmed: number; pending: number; waitlist: number };
  }>(`/organizer/tournaments/${encodeURIComponent(id)}`, {
    absolute: typeof window === "undefined",
    headers: opts?.cookie ? { Cookie: opts.cookie } : undefined,
  });
  if (response.status === 404) return null;
  await throwIfNotOk(response, data as ApiErrorBody | undefined, "Не удалось загрузить турнир");
  if (!data?.tournament) return null;
  const registrations = (data.registrations ?? []).map(mapRegistration);
  const participants: Registration[] = registrations.map((item) => ({
    playerId: item.playerId,
    partnerId: item.partnerId,
    lookingForPartner: item.lookingForPartner,
    status: item.status,
    seed: item.seed,
    registeredAt: item.registeredAt,
  }));
  return {
    tournament: mapTournament(data.tournament, participants, data.images ?? []),
    registrations,
    counts: data.counts ?? { confirmed: 0, pending: 0, waitlist: 0 },
  };
}

export type CreateTournamentInput = {
  title: string;
  description: string;
  type: TournamentType;
  category: CategorySlug;
  surface: Surface;
  format: TournamentFormat;
  status: TournamentStatus;
  startsAt: string;
  endsAt?: string;
  registrationOpensAt?: string;
  registrationClosesAt: string;
  venueName?: string;
  venueAddress?: string;
  venueCourts?: number;
  venueSurface?: Surface;
  entryFee: number;
  maxParticipants: number;
  coverUrl?: string;
  regulations: string;
  season?: number;
};

export async function createOrganizerTournament(
  input: CreateTournamentInput,
): Promise<{ ok: true; tournament: Tournament } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ tournament: ApiTournament } & ApiErrorBody>(
    "/organizer/tournaments",
    {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        type: input.type,
        category: input.category,
        surface: input.surface,
        format: input.format,
        status: input.status,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        registration_opens_at: input.registrationOpensAt,
        registration_closes_at: input.registrationClosesAt,
        venue_name: input.venueName,
        venue_address: input.venueAddress,
        venue_courts: input.venueCourts,
        venue_surface: input.venueSurface,
        entry_fee: input.entryFee,
        max_participants: input.maxParticipants,
        cover_url: input.coverUrl,
        regulations: input.regulations,
        season: input.season,
      }),
    },
  );
  if (response.status === 201 && data?.tournament) {
    return { ok: true, tournament: mapTournament(data.tournament) };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось создать турнир",
  };
}

export async function updateOrganizerTournament(
  id: string,
  input: Partial<CreateTournamentInput> & { status?: TournamentStatus },
): Promise<{ ok: true; tournament: Tournament } | { ok: false; error: string }> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.description !== undefined) body.description = input.description;
  if (input.type !== undefined) body.type = input.type;
  if (input.category !== undefined) body.category = input.category;
  if (input.surface !== undefined) body.surface = input.surface;
  if (input.format !== undefined) body.format = input.format;
  if (input.status !== undefined) body.status = input.status;
  if (input.startsAt !== undefined) body.starts_at = input.startsAt;
  if (input.endsAt !== undefined) body.ends_at = input.endsAt;
  if (input.registrationOpensAt !== undefined) body.registration_opens_at = input.registrationOpensAt;
  if (input.registrationClosesAt !== undefined) body.registration_closes_at = input.registrationClosesAt;
  if (input.venueName !== undefined) body.venue_name = input.venueName;
  if (input.venueAddress !== undefined) body.venue_address = input.venueAddress;
  if (input.venueCourts !== undefined) body.venue_courts = input.venueCourts;
  if (input.venueSurface !== undefined) body.venue_surface = input.venueSurface;
  if (input.entryFee !== undefined) body.entry_fee = input.entryFee;
  if (input.maxParticipants !== undefined) body.max_participants = input.maxParticipants;
  if (input.coverUrl !== undefined) body.cover_url = input.coverUrl;
  if (input.regulations !== undefined) body.regulations = input.regulations;
  if (input.season !== undefined) body.season = input.season;

  const { response, data } = await apiRequest<{ tournament: ApiTournament } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
  if (response.ok && data?.tournament) {
    return { ok: true, tournament: mapTournament(data.tournament) };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось обновить турнир",
  };
}

export async function deleteOrganizerTournament(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody & { message?: string }>(
    `/organizer/tournaments/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (response.status === 204 || response.ok) return { ok: true };
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось удалить турнир",
  };
}

export async function setOrganizerTournamentVisibility(
  id: string,
  hidden: boolean,
): Promise<{ ok: true; hidden: boolean } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ hidden: boolean } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(id)}/visibility`,
    {
      method: "POST",
      body: JSON.stringify({ hidden }),
    },
  );
  if (response.ok && data && typeof data.hidden === "boolean") {
    return { ok: true, hidden: data.hidden };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось изменить видимость",
  };
}

export async function saveTournamentPlaces(
  id: string,
  places: { place: 1 | 2 | 3; playerIds: string[] }[],
): Promise<{ ok: true; winners: { place: 1 | 2 | 3; playerIds: string[] }[] } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{
    places?: { place: number; player_ids: string[] }[];
  } & ApiErrorBody>(`/organizer/tournaments/${encodeURIComponent(id)}/places`, {
    method: "PUT",
    body: JSON.stringify({
      places: places
        .filter((place) => place.playerIds.length > 0)
        .map((place) => ({ place: place.place, player_ids: place.playerIds })),
    }),
  });
  if (response.ok) {
    return {
      ok: true,
      winners: (data?.places ?? []).map((place) => ({
        place: place.place as 1 | 2 | 3,
        playerIds: (place.player_ids ?? []).map((id) => normalizeUuid(id)),
      })),
    };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось сохранить призёров",
  };
}

export async function createRegistration(
  slug: string,
  body?: { partnerId?: string; lookingForPartner?: boolean },
): Promise<{ ok: true; status: RegistrationStatus } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ registration: ApiRegistration } & ApiErrorBody>(
    `/tournaments/${encodeURIComponent(slug)}/registrations`,
    {
      method: "POST",
      body: JSON.stringify({
        partner_id: body?.partnerId,
        looking_for_partner: body?.lookingForPartner ?? false,
      }),
    },
  );
  if (response.status === 201 && data && "registration" in data && data.registration) {
    return { ok: true, status: data.registration.status as RegistrationStatus };
  }
  const errBody = data as ApiErrorBody | undefined;
  if (response.status === 403) {
    return {
      ok: false,
      error:
        errBody?.code === "profile_unverified"
          ? "Профиль ещё не подтверждён организатором (нужна верификация)."
          : errBody?.message ?? "Регистрация запрещена (403).",
    };
  }
  return {
    ok: false,
    error: errBody?.message ?? "Не удалось подать заявку",
  };
}

export async function cancelRegistration(
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(
    `/tournaments/${encodeURIComponent(slug)}/registrations/me`,
    { method: "DELETE" },
  );
  if (response.ok) return { ok: true };
  return {
    ok: false,
    error: data?.message ?? "Не удалось отменить заявку",
  };
}

export async function updateOrganizerRegistrationStatus(
  tournamentId: string,
  registrationId: string,
  status: RegistrationStatus,
): Promise<{ ok: true; status: RegistrationStatus } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ registration: ApiRegistration } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/registrations/${encodeURIComponent(registrationId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
  if (response.ok && data && "registration" in data && data.registration) {
    return { ok: true, status: data.registration.status as RegistrationStatus };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось обновить статус заявки",
  };
}

export async function addOrganizerRegistration(
  tournamentId: string,
  input: { playerId: string; partnerId?: string; lookingForPartner?: boolean },
): Promise<{ ok: true; status: RegistrationStatus } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<{ registration: ApiRegistration } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/registrations`,
    {
      method: "POST",
      body: JSON.stringify({
        player_id: input.playerId,
        partner_id: input.partnerId,
        looking_for_partner: input.lookingForPartner ?? false,
      }),
    },
  );
  if (response.status === 201 && data && "registration" in data && data.registration) {
    return { ok: true, status: data.registration.status as RegistrationStatus };
  }
  return {
    ok: false,
    error: (data as ApiErrorBody | undefined)?.message ?? "Не удалось добавить участника",
  };
}

export async function uploadTournamentImage(
  tournamentId: string,
  file: File,
): Promise<{ ok: true; image: TournamentImage } | { ok: false; error: string }> {
  const body = new FormData();
  body.append("file", file);
  const { response, data } = await apiRequest<{ image: ApiTournamentImage } & ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/images`,
    { method: "POST", body },
  );
  if (!response.ok || !data?.image) {
    return { ok: false, error: data?.message ?? "Не удалось загрузить изображение" };
  }
  return { ok: true, image: mapTournamentImage(data.image) };
}

export async function deleteTournamentImage(
  tournamentId: string,
  imageId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { response, data } = await apiRequest<ApiErrorBody>(
    `/organizer/tournaments/${encodeURIComponent(tournamentId)}/images/${encodeURIComponent(imageId)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    return { ok: false, error: data?.message ?? "Не удалось удалить изображение" };
  }
  return { ok: true };
}
