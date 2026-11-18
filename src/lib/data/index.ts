import { cookies } from "next/headers";
import type {
  CategorySlug,
  ClubEvent,
  NewsPost,
  PlayerTitle,
  RankingEntry,
  Tournament,
  TournamentStatus,
  TournamentType,
} from "@/lib/types";
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
import { latestNews, newsBySlug, events } from "@/lib/mock/news";
import { getPlayerMatches } from "@/lib/mock/matches";
import {
  archiveTournaments,
  completedTournaments,
  getTournament,
  tournamentById,
  tournaments,
  upcomingTournaments,
} from "@/lib/mock/tournaments";
import {
  currentPlayer,
  getPlayerBySlug,
  playerById,
  playerTitles,
  players,
} from "@/lib/mock/players";
import {
  auditLog,
  getRankings,
  ratingHistory,
  recentRegistrations,
  topPlayers,
} from "@/lib/mock/ratings";
import { liveMatches, recentResults, scheduledMatches } from "@/lib/mock/matches";

export interface TournamentFilters {
  status?: TournamentStatus | "upcoming" | "all";
  category?: CategorySlug;
  type?: TournamentType;
  year?: number;
  query?: string;
}

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
  return {
    upcoming: upcomingTournaments.filter((tournament) => tournament.status !== "live").slice(0, 3),
    heroTournament: upcomingTournaments[0] ?? completedTournaments[0],
    live: liveMatches,
    results: recentResults.slice(0, 5),
    top: topPlayers,
    news: latestNews.slice(0, 3),
    events: events.slice(0, 4),
    stats: {
      players: 318,
      tournaments: 28,
      matches: 1460,
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
              birthYear: 1990,
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
              birthYear: 1990,
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
  const { category, query } = filters;
  let result = [...players];
  if (category) result = result.filter((item) => item.category === category);
  if (query) {
    const needle = query.toLowerCase();
    result = result.filter((item) =>
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(needle),
    );
  }
  return result.sort((a, b) => b.rating - a.rating);
}

export async function listPlayersWithRank() {
  const rankings = getRankings();
  return players
    .map((player) => ({
      player,
      rank: rankings.find((entry) => entry.playerId === player.id)?.position ?? 0,
    }))
    .sort((a, b) => a.rank - b.rank);
}

export async function getPlayerProfile(slug: string) {
  const player = getPlayerBySlug(slug);
  if (!player) return null;

  const ranking = getRankings();
  const categoryRanking = getRankings(player.category);
  const rank = ranking.find((entry) => entry.playerId === player.id)?.position ?? 0;
  const categoryRank =
    categoryRanking.find((entry) => entry.playerId === player.id)?.position ?? 0;

  return {
    player,
    matches: getPlayerMatches(player.id),
    titles: (playerTitles[player.id] ?? []) as PlayerTitle[],
    rank,
    categoryRank,
    categoriesCount: getRankings().length,
    categoryCount: categoryRanking.length,
    form: player.trend.slice(-5).map((value, index, array) =>
      index === 0 ? 0 : value - array[index - 1],
    ),
  };
}

export async function getRankingPage(category?: CategorySlug) {
  const ranking = getRankings(category);
  return {
    ranking: ranking as RankingEntry[],
    rows: ranking.map((entry) => ({
      ...entry,
      player: playerById.get(entry.playerId)!,
    })),
    totalPlayers: getRankings().length,
    season: 2026,
  };
}

export async function listNews(limit?: number) {
  const result = [...latestNews];
  return (limit ? result.slice(0, limit) : result) as NewsPost[];
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  return newsBySlug.get(slug) ?? null;
}

export async function listEvents(): Promise<ClubEvent[]> {
  return [...events].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export async function getEventBySlug(slug: string): Promise<ClubEvent | null> {
  return events.find((event) => event.slug === slug) ?? null;
}

export async function listArchive(filters: { year?: number; category?: CategorySlug; type?: TournamentType } = {}) {
  const { year, category, type } = filters;
  let result = [...archiveTournaments];
  if (year) result = result.filter((item) => item.season === year);
  if (category) result = result.filter((item) => item.category === category);
  if (type) result = result.filter((item) => item.type === type);
  return result;
}

export async function getArchiveYears() {
  return Array.from(new Set(tournaments.map((item) => item.season))).sort((a, b) => b - a);
}

export async function getCabinetData() {
  const matches = getPlayerMatches(currentPlayer.id);
  return {
    player: currentPlayer,
    registrations: [
      {
        tournament: getTournament("novogodniy-parnyy-2026")!,
        status: "confirmed" as const,
        partner: playerById.get("p05")!,
      },
      {
        tournament: getTournament("miks-vecher-noyabr")!,
        status: "confirmed" as const,
        partner: undefined,
      },
    ],
    matches: matches.slice(0, 6),
    upcoming: matches
      .filter((match) => match.status === "scheduled" || match.status === "live")
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    ranking: getRankings().find((entry) => entry.playerId === currentPlayer.id)!,
    titles: playerTitles[currentPlayer.id] ?? [],
    history: [
      { id: "h01", match: "Осенний Кубок · Финал", date: agoDays(7, 16), delta: 46, after: 1842, reason: "Победа, финал Masters" },
      { id: "h02", match: "Осенний Кубок · Полуфинал", date: agoDays(8, 15), delta: 24, after: 1796, reason: "Победа, полуфинал Masters" },
      { id: "h03", match: "Hard Cup · Финал", date: agoDays(26, 15), delta: 28, after: 1698, reason: "Победа, финал Challenger" },
      { id: "h04", match: "Летний Кубок · Финал", date: agoDays(82, 16), delta: -32, after: 1670, reason: "Поражение, финал Masters" },
    ],
  };
}

function agoDays(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
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
        birthYear: 1990,
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
            birthYear: 1990,
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
  return {
    ranking: getRankings().map((entry) => ({
      ...entry,
      player: playerById.get(entry.playerId)!,
    })),
    history: ratingHistory,
    audit: auditLog,
    players,
  };
}

export async function getContentDesk() {
  return {
    news: latestNews,
    events,
  };
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
  return {
    stats: {
      players: 318,
      activeTournaments: 4,
      upcoming: 11,
      newRegistrations: 27,
    },
    registrations: recentRegistrations.map((entry) => ({
      ...entry,
      player: playerById.get(entry.playerId)!,
    })),
    tournaments: upcomingTournaments.slice(0, 5),
    results: recentResults.slice(0, 5),
    audit: auditLog,
    ratingHistory,
    players,
    matches: [...liveMatches, ...scheduledMatches].slice(0, 8),
    news: latestNews,
    events,
  };
}

export async function listOrganizerPlayers(query?: string) {
  const normalized = query?.toLowerCase();
  return players
    .filter((player) =>
      normalized
        ? `${player.firstName} ${player.lastName} ${player.slug}`.toLowerCase().includes(normalized)
        : true,
    )
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "ru"));
}

export { currentPlayer, getRankings, players, tournaments };
