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
import { latestNews, newsBySlug, events } from "@/lib/mock/news";
import { getPlayerMatches, getTournamentMatches } from "@/lib/mock/matches";
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
  const { status = "upcoming", category, type, year, query } = filters;
  let result = [...tournaments];

  if (status === "upcoming") {
    result = result.filter((item) =>
      ["registration_soon", "registration_open", "registration_closed", "scheduled", "live"].includes(item.status),
    );
  } else if (status !== "all") {
    result = result.filter((item) => item.status === status);
  }

  if (category) result = result.filter((item) => item.category === category);
  if (type) result = result.filter((item) => item.type === type);
  if (year) result = result.filter((item) => item.season === year);
  if (query) {
    const needle = query.toLowerCase();
    result = result.filter((item) => item.title.toLowerCase().includes(needle));
  }

  return result.sort((a, b) => {
    if (status === "completed") return +new Date(b.startsAt) - +new Date(a.startsAt);
    return +new Date(a.startsAt) - +new Date(b.startsAt);
  });
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  return getTournament(slug) ?? null;
}

export async function getTournamentPage(slug: string) {
  const tournament = getTournament(slug);
  if (!tournament) return null;
  return {
    tournament: tournament as Tournament,
    matches: getTournamentMatches(tournament.id),
    participants: tournament.participants.map((registration) => ({
      ...registration,
      player: playerById.get(registration.playerId),
      partner: registration.partnerId ? playerById.get(registration.partnerId) : undefined,
    })),
    similar: completedTournaments
      .filter((item) => item.id !== tournament.id && item.category === tournament.category)
      .slice(0, 3),
  };
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
  return [...tournaments].sort((a, b) => {
    const order: Record<TournamentStatus, number> = {
      live: 0,
      registration_open: 1,
      registration_soon: 2,
      registration_closed: 3,
      scheduled: 4,
      draft: 5,
      completed: 6,
      cancelled: 7,
    };
    const diff = order[a.status] - order[b.status];
    return diff !== 0 ? diff : +new Date(a.startsAt) - +new Date(b.startsAt);
  });
}

export async function getOrganizerTournament(id: string) {
  const tournament = tournamentById.get(id);
  if (!tournament) return null;

  const participants = tournament.participants.map((registration) => ({
    ...registration,
    player: playerById.get(registration.playerId)!,
    partner: registration.partnerId ? playerById.get(registration.partnerId) : undefined,
  }));

  return {
    tournament: tournament as Tournament,
    participants,
    matches: getTournamentMatches(tournament.id),
    confirmed: participants.filter((item) => item.status === "confirmed").length,
    pending: participants.filter((item) => item.status === "pending").length,
    waitlist: participants.filter((item) => item.status === "waitlist").length,
    revenue: participants.filter((item) => item.status === "confirmed").length * tournament.entryFee,
    winners: (tournament.winners ?? []).map((winner) => ({
      ...winner,
      players: winner.playerIds.map((playerId) => playerById.get(playerId)).filter(Boolean),
    })),
  };
}

export async function getMatchDesk() {
  return {
    live: liveMatches,
    scheduled: scheduledMatches,
    completed: recentResults,
    tournaments: upcomingTournaments,
  };
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
  return tournaments
    .filter((tournament) => tournament.participants.length > 0)
    .map((tournament) => ({
      id: tournament.id,
      title: tournament.title,
      format: tournament.format,
      type: tournament.type,
      category: tournament.category,
      maxParticipants: tournament.maxParticipants,
      status: tournament.status,
      entries: tournament.participants
        .filter((registration) => registration.status !== "cancelled" && registration.status !== "rejected")
        .map((registration) => {
          const player = playerById.get(registration.playerId);
          return {
            playerId: registration.playerId,
            name: player ? `${player.lastName} ${player.firstName.charAt(0)}.` : registration.playerId,
            seed: registration.seed,
            rating: player?.rating ?? 0,
          };
        }),
    }));
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
