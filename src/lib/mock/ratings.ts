import type { AuditEntry, CategorySlug, RankingEntry } from "@/lib/types";
import { players } from "./players";
import { ago } from "./clock";

const MOVE_PATTERN = [0, 1, -1, 2, 0, -2, 1, 3, 0, -1, 2, -3, 0, 1, -1, 2, 0, -2];

export function getRankings(category?: CategorySlug): RankingEntry[] {
  const filtered = category ? players.filter((player) => player.category === category) : players;
  return [...filtered]
    .sort((a, b) => b.points - a.points || b.rating - a.rating)
    .map((player, index) => {
      const position = index + 1;
      const move = MOVE_PATTERN[index % MOVE_PATTERN.length];
      return {
        position,
        previousPosition: Math.max(1, position + move),
        playerId: player.id,
        points: player.points,
        rating: player.rating,
        category: player.category,
      };
    });
}

export const globalRankings = getRankings();

export const topPlayers = globalRankings.slice(0, 5).map((entry) => ({
  ...entry,
  player: players.find((player) => player.id === entry.playerId)!,
}));

export const recentRegistrations = [
  { id: "r01", playerId: "p18", tournamentSlug: "novogodniy-parnyy-2026", tournamentTitle: "Новогодний парный турнир", status: "confirmed" as const, createdAt: ago(0, 9, 12) },
  { id: "r02", playerId: "p10", tournamentSlug: "novogodniy-parnyy-2026", tournamentTitle: "Новогодний парный турнир", status: "confirmed" as const, createdAt: ago(0, 11, 40) },
  { id: "r03", playerId: "p16", tournamentSlug: "rooki-cup-9", tournamentTitle: "Rookies Cup #9", status: "pending" as const, createdAt: ago(0, 14, 5) },
  { id: "r04", playerId: "p15", tournamentSlug: "rooki-cup-9", tournamentTitle: "Rookies Cup #9", status: "pending" as const, createdAt: ago(1, 16, 22) },
  { id: "r05", playerId: "p07", tournamentSlug: "miks-vecher-noyabr", tournamentTitle: "Микст-вечер: ноябрь", status: "waitlist" as const, createdAt: ago(1, 18, 10) },
  { id: "r06", playerId: "p06", tournamentSlug: "novogodniy-parnyy-2026", tournamentTitle: "Новогодний парный турнир", status: "waitlist" as const, createdAt: ago(2, 12, 30) },
];

export const auditLog: AuditEntry[] = [
  {
    id: "a01",
    actor: "Ирина Волкова",
    action: "Изменила результат матча",
    entity: "Осенний Кубок · Финал",
    createdAt: ago(6, 18, 40),
  },
  {
    id: "a02",
    actor: "Ирина Волкова",
    action: "Подтвердила регистрацию",
    entity: "Полина Ершова · Rookies Cup #9",
    createdAt: ago(5, 12, 15),
  },
  {
    id: "a03",
    actor: "Турнирный комитет",
    action: "Пересчитала рейтинг сезона",
    entity: "Сезон 2026 · 318 игроков",
    createdAt: ago(4, 20, 0),
  },
  {
    id: "a04",
    actor: "Ирина Волкова",
    action: "Опубликовала турнир",
    entity: "Новогодний парный турнир",
    createdAt: ago(3, 10, 30),
  },
  {
    id: "a05",
    actor: "Администратор",
    action: "Скорректировала рейтинг вручную",
    entity: "Максим Белов · +15 очков",
    createdAt: ago(2, 16, 5),
  },
];

export const ratingHistory = [
  { id: "h01", match: "Осенний Кубок · Финал", date: ago(7, 16), before: 1796, delta: 46, after: 1842, reason: "Победа, финал Masters" },
  { id: "h02", match: "Осенний Кубок · Полуфинал", date: ago(8, 15), before: 1772, delta: 24, after: 1796, reason: "Победа, полуфинал Masters" },
  { id: "h03", match: "Pushkin Open · 1/8", date: ago(1, 11), before: 1842, delta: 0, after: 1842, reason: "Матч ещё не завершён" },
  { id: "h04", match: "Hard Cup · Финал", date: ago(26, 15), before: 1670, delta: 28, after: 1698, reason: "Победа, финал Challenger" },
];
