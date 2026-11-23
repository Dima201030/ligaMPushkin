import { cookies } from "next/headers";
import type {
  CategorySlug,
  ClubEvent,
  NewsPost,
  Player,
  RankingEntry,
  Tournament,
  TournamentStatus,
  TournamentType,
  Venue,
} from "@/lib/types";
import { CLUB } from "@/lib/domain";
import {
  fetchOrganizerTournament,
  fetchOrganizerTournaments,
  fetchTournamentBySlug,
  fetchTournaments,
} from "@/lib/api/tournaments";
import {
  fetchOrganizerMatches,
  fetchOrganizerTournamentMatches,
  fetchTournamentMatches,
} from "@/lib/api/matches";
import { fetchPlayerBySlug, fetchPlayers } from "@/lib/api/players";
import { fetchRankings } from "@/lib/api/rankings";
import {
  fetchEventBySlug,
  fetchEvents,
  fetchNews,
  fetchNewsBySlug,
  fetchPage,
  type CmsPage,
} from "@/lib/api/content";
import { fetchMyRegistrations, fetchSession } from "@/lib/api/auth";
import { fetchMyMatches } from "@/lib/api/matches";
import { fetchOrganizerEvents, fetchOrganizerNews } from "@/lib/api/organizer-content";
import { fetchOrganizerPlayersList } from "@/lib/api/organizer-ratings";

export interface TournamentFilters {
  status?: TournamentStatus | "upcoming" | "all";
  category?: CategorySlug;
  type?: TournamentType;
  year?: number;
  query?: string;
}

export const CLUB_VENUES: Venue[] = [
  {
    id: "club-default",
    name: CLUB.name,
    address: CLUB.address,
    courts: 9,
    surface: "hard",
  },
];

async function requestCookieHeader(): Promise<string | undefined> {
  try {
    const jar = await cookies();
    const all = jar.getAll();
    if (!all.length) return undefined;
    return all.map((item) => `${item.name}=${item.value}`).join("; ");
  } catch {
    return undefined;
  }
}

export async function getHomeData() {
  const cookie = await requestCookieHeader();
  const [upcoming, rankings, news, events, players, allTournaments] = await Promise.all([
    fetchTournaments({ status: "upcoming" }, { cookie }).catch(() => [] as Tournament[]),
    fetchRankings({}, { cookie }).catch(() => null),
    fetchNews({ limit: 3 }, { cookie }).catch(() => [] as NewsPost[]),
    fetchEvents({ limit: 4 }, { cookie }).catch(() => [] as ClubEvent[]),
    fetchPlayers({ limit: 200 }, { cookie }).catch(() => [] as Player[]),
    fetchTournaments({ status: "all" }, { cookie }).catch(() => [] as Tournament[]),
  ]);

  const openOrLive = upcoming.filter((tournament) => tournament.status !== "completed");
  const heroTournament = openOrLive[0] ?? allTournaments[0] ?? null;

  return {
    upcoming: openOrLive.filter((tournament) => tournament.status !== "live").slice(0, 3),
    heroTournament,
    live: [] as Awaited<ReturnType<typeof fetchTournamentMatches>>,
    results: [] as Awaited<ReturnType<typeof fetchTournamentMatches>>,
    top: (rankings?.rows ?? []).slice(0, 5),
    news: news.slice(0, 3),
    events: events.slice(0, 4),
    stats: {
      players: players.length || rankings?.totalPlayers || 0,
      tournaments: allTournaments.length,
      matches: 0,
      courts: 9,
    },
  };
}

export async function listTournaments(filters: TournamentFilters = {}) {
  const cookie = await requestCookieHeader();
  try {
    return await fetchTournaments(
      {
        status: filters.status ?? "upcoming",
        category: filters.category,
        type: filters.type,
        year: filters.year,
        query: filters.query,
      },
      { cookie },
    );
  } catch {
    return [];
  }
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const cookie = await requestCookieHeader();
  try {
    const page = await fetchTournamentBySlug(slug, { cookie });
    return page?.tournament ?? null;
  } catch {
    return null;
  }
}

export async function getTournamentPage(slug: string) {
  const cookie = await requestCookieHeader();
  try {
    const page = await fetchTournamentBySlug(slug, { cookie });
    if (!page) return null;
    const { tournament, registrations } = page;
    const similar = (await fetchTournaments({ status: "upcoming" }, { cookie }))
      .filter((item) => item.id !== tournament.id && item.category === tournament.category)
      .slice(0, 3);
    let matches = [] as Awaited<ReturnType<typeof fetchTournamentMatches>>;
    try {
      matches = await fetchTournamentMatches(slug, { cookie });
    } catch {
      matches = [];
    }
    return {
      tournament,
      matches,
      participants: registrations.map((registration) => ({
        playerId: registration.playerId,
        partnerId: registration.partnerId,
        lookingForPartner: registration.lookingForPartner,
        status: registration.status,
        seed: registration.seed,
        registeredAt: registration.registeredAt,
        player: registration.player
          ? {
              id: registration.player.id,
              slug: registration.player.slug,
              firstName: registration.player.firstName,
              lastName: registration.player.lastName,
              gender: "male" as const,
              birthYear: 0,
              city: "",
              category: registration.player.category,
              rating: registration.player.rating,
              points: 0,
              wins: 0,
              losses: 0,
              tournamentsCount: 0,
              titlesCount: 0,
              bestRank: 0,
              trend: [],
              bio: "",
              memberSince: "",
              status: "active" as const,
            }
          : undefined,
        partner: registration.partner
          ? {
              id: registration.partner.id,
              slug: registration.partner.slug,
              firstName: registration.partner.firstName,
              lastName: registration.partner.lastName,
              gender: "male" as const,
              birthYear: 0,
              city: "",
              category: registration.partner.category,
              rating: registration.partner.rating,
              points: 0,
              wins: 0,
              losses: 0,
              tournamentsCount: 0,
              titlesCount: 0,
              bestRank: 0,
              trend: [],
              bio: "",
              memberSince: "",
              status: "active" as const,
            }
          : undefined,
      })),
      similar,
    };
  } catch {
    return null;
  }
}

export async function listPlayers(filters: { category?: CategorySlug; query?: string } = {}) {
  const cookie = await requestCookieHeader();
  try {
    return await fetchPlayers(
      { category: filters.category, query: filters.query, limit: 200 },
      { cookie },
    );
  } catch {
    return [];
  }
}

export async function listPlayersWithRank() {
  const cookie = await requestCookieHeader();
  try {
    const [players, rankings] = await Promise.all([
      fetchPlayers({ limit: 200 }, { cookie }),
      fetchRankings({}, { cookie }),
    ]);
    const rankById = new Map(rankings.rows.map((row) => [row.playerId, row.position]));
    return players
      .map((player) => ({
        player,
        rank: rankById.get(player.id) ?? 0,
      }))
      .sort((a, b) => {
        if (a.rank && b.rank) return a.rank - b.rank;
        if (a.rank) return -1;
        if (b.rank) return 1;
        return b.player.rating - a.player.rating;
      });
  } catch {
    return [];
  }
}

export async function getPlayerProfile(slug: string) {
  const cookie = await requestCookieHeader();
  try {
    const player = await fetchPlayerBySlug(slug, { cookie });
    if (!player) return null;

    const [globalRankings, categoryRankings] = await Promise.all([
      fetchRankings({}, { cookie }),
      fetchRankings({ category: player.category }, { cookie }),
    ]);
    const rank = globalRankings.rows.find((entry) => entry.playerId === player.id)?.position ?? 0;
    const categoryRank =
      categoryRankings.rows.find((entry) => entry.playerId === player.id)?.position ?? 0;

    return {
      player,
      matches: [] as Awaited<ReturnType<typeof fetchTournamentMatches>>,
      titles: [] as { year: number; tournamentTitle: string; type: TournamentType; place: 1 | 2 | 3 }[],
      rank,
      categoryRank,
      categoriesCount: globalRankings.totalPlayers,
      categoryCount: categoryRankings.totalPlayers,
      form: [] as number[],
    };
  } catch {
    return null;
  }
}

export async function getRankingPage(category?: CategorySlug) {
  const cookie = await requestCookieHeader();
  try {
    const page = await fetchRankings({ category }, { cookie });
    const total = category
      ? page.totalPlayers
      : (await fetchRankings({}, { cookie })).totalPlayers;
    return {
      ranking: page.ranking as RankingEntry[],
      rows: page.rows,
      totalPlayers: total,
      season: page.season,
    };
  } catch {
    return {
      ranking: [] as RankingEntry[],
      rows: [],
      totalPlayers: 0,
      season: new Date().getFullYear(),
    };
  }
}

export async function listNews(limit?: number) {
  const cookie = await requestCookieHeader();
  try {
    return await fetchNews({ limit: limit ?? 50 }, { cookie });
  } catch {
    return [] as NewsPost[];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const cookie = await requestCookieHeader();
  try {
    return await fetchNewsBySlug(slug, { cookie });
  } catch {
    return null;
  }
}

export async function listEvents(): Promise<ClubEvent[]> {
  const cookie = await requestCookieHeader();
  try {
    const events = await fetchEvents({ limit: 100 }, { cookie });
    return [...events].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<ClubEvent | null> {
  const cookie = await requestCookieHeader();
  try {
    return await fetchEventBySlug(slug, { cookie });
  } catch {
    return null;
  }
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  const cookie = await requestCookieHeader();
  try {
    return await fetchPage(slug, { cookie });
  } catch {
    return null;
  }
}

export async function listArchive(
  filters: { year?: number; category?: CategorySlug; type?: TournamentType } = {},
) {
  const cookie = await requestCookieHeader();
  try {
    return await fetchTournaments(
      {
        status: "completed",
        year: filters.year,
        category: filters.category,
        type: filters.type,
      },
      { cookie },
    );
  } catch {
    return [];
  }
}

export async function getArchiveYears() {
  const cookie = await requestCookieHeader();
  try {
    const tournaments = await fetchTournaments({ status: "all" }, { cookie });
    return Array.from(new Set(tournaments.map((item) => item.season))).sort((a, b) => b - a);
  } catch {
    return [];
  }
}

export async function getCabinetData() {
  const session = await fetchSession();
  if (!session) {
    return { session: null, player: null, registrations: [], matches: [], upcoming: [], ranking: null, history: [] };
  }
  const cookie = await requestCookieHeader();
  const [registrations, matches, rankings, ratingEvents] = await Promise.all([
    fetchMyRegistrations().catch(() => []),
    fetchMyMatches({ cookie }).catch(() => []),
    fetchRankings({}, { cookie }).catch(() => null),
    session.profile?.slug
      ? apiRequestJson<{
          events: Array<{
            id: string;
            reason: string;
            points_delta: number;
            rating_delta: number;
            rating_after: number;
            created_at: string;
            kind: string;
          }>;
        }>(`/players/${encodeURIComponent(session.profile.slug)}/rating-events?limit=20`, cookie)
      : Promise.resolve(null),
  ]);

  const profile = session.profile;
  const player: Player | null = profile
    ? {
        id: session.user.id,
        slug: profile.slug,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        gender: "male",
        birthYear: 0,
        city: profile.city,
        category: session.user.level,
        rating: profile.rating,
        points: profile.points,
        wins: profile.wins,
        losses: profile.losses,
        tournamentsCount: 0,
        titlesCount: 0,
        bestRank: 0,
        trend: [],
        bio: profile.bio,
        memberSince: profile.memberSince || "",
        status: (profile.status as Player["status"]) || "active",
        avatarUrl: profile.avatarUrl,
      }
    : null;

  const ranking =
    rankings?.rows.find((row) => row.playerId === session.user.id) ??
    (player
      ? {
          position: 0,
          previousPosition: 0,
          playerId: player.id,
          points: player.points,
          rating: player.rating,
          category: player.category,
        }
      : null);

  const history = (ratingEvents?.events ?? []).map((event) => ({
    id: event.id,
    match: event.kind,
    date: event.created_at,
    delta: event.points_delta || Math.round(event.rating_delta),
    after: event.rating_after,
    reason: event.reason,
  }));

  return {
    session,
    player,
    registrations,
    matches,
    upcoming: matches
      .filter((match) => match.status === "scheduled" || match.status === "live")
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    ranking,
    history,
  };
}

async function apiRequestJson<T>(path: string, cookie?: string): Promise<T | null> {
  try {
    const { apiRequest } = await import("@/lib/api/client");
    const { response, data } = await apiRequest<T>(path, {
      absolute: typeof window === "undefined",
      headers: cookie ? { Cookie: cookie } : undefined,
    });
    if (!response.ok) return null;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function listOrganizerTournaments() {
  const cookie = await requestCookieHeader();
  try {
    return await fetchOrganizerTournaments({ cookie });
  } catch {
    return [];
  }
}

export async function getOrganizerTournament(id: string) {
  const cookie = await requestCookieHeader();
  try {
    const data = await fetchOrganizerTournament(id, { cookie });
    if (!data) return null;
    const { tournament, registrations, counts } = data;
    const participants = registrations.map((registration) => ({
      registrationId: registration.id,
      playerId: registration.playerId,
      partnerId: registration.partnerId,
      lookingForPartner: registration.lookingForPartner,
      status: registration.status,
      seed: registration.seed,
      registeredAt: registration.registeredAt,
      player: {
        id: registration.player?.id ?? registration.playerId,
        slug: registration.player?.slug ?? registration.playerId,
        firstName: registration.player?.firstName ?? "",
        lastName: registration.player?.lastName ?? "",
        gender: "male" as const,
        birthYear: 0,
        city: "",
        category: (registration.player?.category ?? "challenger") as CategorySlug,
        rating: registration.player?.rating ?? 0,
        points: 0,
        wins: 0,
        losses: 0,
        tournamentsCount: 0,
        titlesCount: 0,
        bestRank: 0,
        trend: [],
        bio: "",
        memberSince: "",
        status: "active" as const,
      },
      partner: registration.partner
        ? {
            id: registration.partner.id,
            slug: registration.partner.slug,
            firstName: registration.partner.firstName,
            lastName: registration.partner.lastName,
            gender: "male" as const,
            birthYear: 0,
            city: "",
            category: registration.partner.category,
            rating: registration.partner.rating,
            points: 0,
            wins: 0,
            losses: 0,
            tournamentsCount: 0,
            titlesCount: 0,
            bestRank: 0,
            trend: [],
            bio: "",
            memberSince: "",
            status: "active" as const,
          }
        : undefined,
    }));
    let matches = [] as Awaited<ReturnType<typeof fetchOrganizerTournamentMatches>>;
    try {
      matches = await fetchOrganizerTournamentMatches(tournament.id, { cookie });
    } catch {
      matches = [];
    }
    return {
      tournament,
      participants,
      matches,
      confirmed: counts.confirmed,
      pending: counts.pending,
      waitlist: counts.waitlist,
      revenue: counts.confirmed * tournament.entryFee,
      winners: (tournament.winners ?? []).map((winner) => ({
        ...winner,
        players: winner.playerIds
          .map((playerId) => participants.find((item) => item.playerId === playerId)?.player)
          .filter(Boolean),
      })),
    };
  } catch {
    return null;
  }
}

export async function getMatchDesk() {
  const cookie = await requestCookieHeader();
  try {
    const [allMatches, organizerTournaments] = await Promise.all([
      fetchOrganizerMatches({ cookie }),
      fetchOrganizerTournaments({ cookie }),
    ]);
    return {
      live: allMatches.filter((match) => match.status === "live"),
      scheduled: allMatches.filter((match) => match.status === "scheduled"),
      completed: allMatches.filter(
        (match) => match.status === "completed" || match.status === "walkover",
      ),
      tournaments: organizerTournaments,
    };
  } catch {
    return {
      live: [],
      scheduled: [],
      completed: [],
      tournaments: [],
    };
  }
}

export async function getRatingDesk() {
  const cookie = await requestCookieHeader();
  try {
    const [rankings, players] = await Promise.all([
      fetchRankings({}, { cookie }),
      fetchPlayers({ limit: 200 }, { cookie }),
    ]);
    return {
      ranking: rankings.rows,
      history: [] as { id: string; match: string; date: string; before: number; delta: number; after: number; reason: string }[],
      audit: [] as { id: string; actor: string; action: string; entity: string; createdAt: string }[],
      players,
    };
  } catch {
    return {
      ranking: [],
      history: [],
      audit: [],
      players: [] as Player[],
    };
  }
}

export async function getContentDesk() {
  const cookie = await requestCookieHeader();
  try {
    const [news, events] = await Promise.all([
      fetchOrganizerNews({ cookie }),
      fetchOrganizerEvents({ cookie }),
    ]);
    return { news, events };
  } catch {
    return { news: [] as NewsPost[], events: [] as ClubEvent[] };
  }
}

export async function getBracketSources() {
  const cookie = await requestCookieHeader();
  try {
    const list = await fetchOrganizerTournaments({ cookie });
    const sources = await Promise.all(
      list.map(async (tournament) => {
        let entries: { playerId: string; name: string; seed?: number; rating: number }[] = [];
        try {
          const detail = await fetchOrganizerTournament(tournament.id, { cookie });
          entries = (detail?.registrations ?? [])
            .filter((registration) => registration.status === "confirmed")
            .map((registration) => ({
              playerId: registration.playerId,
              name: registration.player
                ? `${registration.player.lastName} ${registration.player.firstName.charAt(0)}.`
                : registration.playerId,
              seed: registration.seed,
              rating: registration.player?.rating ?? 0,
            }));
        } catch {
          entries = [];
        }
        return {
          id: tournament.id,
          title: tournament.title,
          format: tournament.format,
          type: tournament.type,
          category: tournament.category,
          maxParticipants: tournament.maxParticipants,
          status: tournament.status,
          entries,
        };
      }),
    );
    return sources;
  } catch {
    return [];
  }
}

export async function getOrganizerDashboard() {
  const cookie = await requestCookieHeader();
  try {
    const [tournaments, players, rankings, news, events, matches] = await Promise.all([
      fetchOrganizerTournaments({ cookie }),
      fetchPlayers({ limit: 200 }, { cookie }),
      fetchRankings({}, { cookie }),
      fetchNews({ limit: 10 }, { cookie }),
      fetchEvents({ limit: 10 }, { cookie }),
      fetchOrganizerMatches({ cookie }),
    ]);
    const upcoming = tournaments
      .filter((item) => item.status !== "completed" && item.status !== "cancelled")
      .slice(0, 5);
    return {
      stats: {
        players: players.length,
        activeTournaments: tournaments.filter((item) => item.status === "live").length,
        upcoming: upcoming.length,
        newRegistrations: 0,
      },
      registrations: [] as {
        id: string;
        playerId: string;
        tournamentSlug: string;
        tournamentTitle: string;
        status: "pending" | "confirmed" | "waitlist" | "cancelled" | "rejected";
        createdAt: string;
        player: Player;
      }[],
      tournaments: upcoming,
      results: matches
        .filter((match) => match.status === "completed" || match.status === "walkover")
        .slice(0, 5),
      audit: [] as { id: string; actor: string; action: string; entity: string; createdAt: string }[],
      ratingHistory: [] as {
        id: string;
        match: string;
        date: string;
        before: number;
        delta: number;
        after: number;
        reason: string;
      }[],
      players,
      matches: matches
        .filter((match) => match.status === "live" || match.status === "scheduled")
        .slice(0, 8),
      news,
      events,
      top: rankings.rows.slice(0, 5),
    };
  } catch {
    return {
      stats: { players: 0, activeTournaments: 0, upcoming: 0, newRegistrations: 0 },
      registrations: [],
      tournaments: [] as Tournament[],
      results: [],
      audit: [],
      ratingHistory: [],
      players: [] as Player[],
      matches: [],
      news: [] as NewsPost[],
      events: [] as ClubEvent[],
      top: [],
    };
  }
}

export async function listOrganizerPlayers(query?: string) {
  const cookie = await requestCookieHeader();
  try {
    const rows = await fetchOrganizerPlayersList({ cookie });
    const players: Player[] = rows.map((row) => {
      const birthDate = row.birth_date || undefined;
      const birthYear = birthDate ? Number(birthDate.slice(0, 4)) || 0 : 0;
      const verificationStatus =
        row.verification_status === "approved" || row.verification_status === "rejected"
          ? row.verification_status
          : "pending";
      return {
        id: row.id,
        slug: row.slug,
        firstName: row.first_name,
        lastName: row.last_name,
        gender: "male" as const,
        birthYear,
        birthDate,
        city: row.city || "",
        category: row.level as CategorySlug,
        rating: row.rating,
        points: row.points,
        wins: row.wins,
        losses: row.losses,
        tournamentsCount: 0,
        titlesCount: 0,
        bestRank: 0,
        trend: [],
        bio: row.bio || "",
        memberSince: row.member_since || "",
        status: (row.status as Player["status"]) || "active",
        verificationStatus,
        phone: row.phone ?? undefined,
        email: row.email || undefined,
        isPlaceholder: Boolean(row.is_placeholder) || !row.email,
      };
    });
    const normalized = query?.toLowerCase();
    return players
      .filter((player) =>
        normalized
          ? `${player.firstName} ${player.lastName} ${player.slug}`.toLowerCase().includes(normalized)
          : true,
      )
      .sort((a, b) => a.lastName.localeCompare(b.lastName, "ru"));
  } catch {
    return [];
  }
}
