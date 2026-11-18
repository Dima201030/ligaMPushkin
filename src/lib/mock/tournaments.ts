import type { Registration, Tournament, Venue } from "@/lib/types";
import { at, ago } from "./clock";

export const venues: Venue[] = [
  {
    id: "v1",
    name: "Крытые корты Mr. Pushkin",
    address: "Волхонское шоссе, 79А",
    courts: 7,
    surface: "hard",
  },
  {
    id: "v2",
    name: "Грунтовые корты Mr. Pushkin",
    address: "Волхонское шоссе, 79А",
    courts: 2,
    surface: "clay",
  },
  {
    id: "v3",
    name: "Центральный корт",
    address: "Волхонское шоссе, 79А",
    courts: 1,
    surface: "hard",
  },
];

function regs(
  ids: string[],
  options: {
    pending?: string[];
    waitlist?: string[];
    seeds?: Record<string, number>;
    partners?: Record<string, string>;
    registeredDaysAgo?: number;
  } = {},
): Registration[] {
  const { pending = [], waitlist = [], seeds = {}, partners = {}, registeredDaysAgo = 14 } = options;
  return ids.map((playerId) => ({
    playerId,
    partnerId: partners[playerId],
    status: waitlist.includes(playerId)
      ? "waitlist"
      : pending.includes(playerId)
        ? "pending"
        : "confirmed",
    seed: seeds[playerId],
    registeredAt: ago(registeredDaysAgo, 12),
  }));
}

export const tournaments: Tournament[] = [
  {
    id: "t01",
    slug: "pushkin-open-2026",
    title: "Pushkin Open 2026",
    description:
      "Главный открытый турнир клуба на крытых кортах. Два игровых дня, олимпийская система, утешительная сетка для всех участников. Матчи начинаются в 09:00, финалы — в воскресенье после 16:00.",
    type: "singles" as const,
    category: "challenger" as const,
    surface: "hard" as const,
    format: "olympic" as const,
    status: "live" as const,
    startsAt: at(-1, 9),
    endsAt: at(1, 19),
    registrationOpensAt: ago(30, 10),
    registrationClosesAt: ago(3, 20),
    venue: venues[0],
    entryFee: 3500,
    maxParticipants: 16,
    coverUrl: "/images/hero.jpg",
    regulations:
      "Матчи до двух побед в сетах, тай-брейк до 7 очков. При счёте 1:1 в сетах играется решающий тай-брейк до 10 очков. Формат олимпийский, матч за третье место проводится.",
    participants: regs(
      ["p01", "p03", "p05", "p08", "p11", "p17", "p07", "p18", "p04", "p06", "p10", "p09", "p12", "p02", "p15", "p16"],
      {
        seeds: { p01: 1, p05: 2, p02: 3, p03: 4, p08: 5, p17: 6, p11: 7, p04: 8 },
        pending: ["p15"],
        registeredDaysAgo: 21,
      },
    ),
    season: 2026,
  },
  {
    id: "t02",
    slug: "masters-final-2026",
    title: "Masters Final 2026",
    description:
      "Итоговый турнир категории Masters по итогам осенней серии. Восемь сильнейших игроков сезона, два состава групп, плей-офф в воскресенье. Участие только по приглашению организатора.",
    type: "final" as const,
    category: "masters" as const,
    surface: "hard" as const,
    format: "groups_playoff" as const,
    status: "registration_closed" as const,
    startsAt: at(3, 10),
    endsAt: at(4, 18),
    registrationOpensAt: ago(25, 10),
    registrationClosesAt: at(-1, 20),
    venue: venues[2],
    entryFee: 4500,
    maxParticipants: 8,
    coverUrl: "/images/club/trophy-presentation.webp",
    regulations:
      "Две группы по 4 игрока, матчи в группе до одного сета с тай-брейком. По два сильнейших выходят в полуфинал. Финал и матч за третье место — до двух побед.",
    participants: regs(["p01", "p05", "p02", "p08", "p03", "p17", "p04", "p11"], {
      seeds: { p01: 1, p05: 2, p02: 3, p08: 4, p03: 5, p17: 6, p04: 7, p11: 8 },
      registeredDaysAgo: 20,
    }),
    season: 2026,
  },
  {
    id: "t03",
    slug: "rooki-cup-9",
    title: "Rookies Cup #9",
    description:
      "Турнир для игроков категории Rookies. Мягкий формат: групповой этап, затем плей-офф за первые места. Отличная возможность получить первый соревновательный опыт в поддерживающей атмосфере.",
    type: "singles" as const,
    category: "rookies" as const,
    surface: "hard" as const,
    format: "groups_playoff" as const,
    status: "registration_open" as const,
    startsAt: at(5, 11),
    endsAt: at(5, 17),
    registrationOpensAt: ago(10, 10),
    registrationClosesAt: at(3, 20),
    venue: venues[0],
    entryFee: 2500,
    maxParticipants: 16,
    coverUrl: "/images/club/courts-aerial.webp",
    regulations:
      "Группы по 4 игрока, матчи до одного сета. В плей-офф выходят по два лучших игрока из группы. Все участники получают рейтинговые очки.",
    participants: regs(["p07", "p10", "p18", "p09", "p12", "p15", "p16", "p06"], {
      seeds: { p18: 1, p10: 2, p07: 3, p06: 4 },
      pending: ["p15", "p16"],
      registeredDaysAgo: 9,
    }),
    season: 2026,
  },
  {
    id: "t04",
    slug: "miks-vecher-noyabr",
    title: "Микст-вечер: ноябрь",
    description:
      "Регулярный пятничный микст для игроков категорий Beginners и Rookies. Пары формируются организатором по силе игры, чтобы каждый вечер был интересным. После турнира — чай в клубном кафе.",
    type: "mixed" as const,
    category: "beginners" as const,
    surface: "hard" as const,
    format: "round_robin" as const,
    status: "registration_open" as const,
    startsAt: at(8, 19),
    endsAt: at(8, 22),
    registrationOpensAt: ago(6, 10),
    registrationClosesAt: at(7, 18),
    venue: venues[0],
    entryFee: 1800,
    maxParticipants: 12,
    coverUrl: "/images/club/adult-tournament.webp",
    regulations:
      "Круговой формат, пары меняются после каждого круга. Матчи до 6 геймов с тай-брейком. Победа — 2 очка, ничья — 1 очко.",
    participants: regs(["p09", "p12", "p15", "p16", "p10", "p18", "p07", "p06", "p04", "p11"], {
      partners: {
        p09: "p12",
        p15: "p16",
        p10: "p07",
        p06: "p04",
        p11: "p18",
      },
      registeredDaysAgo: 5,
    }),
    season: 2026,
  },
  {
    id: "t05",
    slug: "novogodniy-parnyy-2026",
    title: "Новогодний парный турнир",
    description:
      "Праздничный парный турнир клуба с фуршетом и подарками от партнёров. Играем в двух категориях, после финалов — награждение и новогодний ужин в кафе с видом на корты.",
    type: "doubles" as const,
    category: "futures" as const,
    surface: "hard" as const,
    format: "olympic" as const,
    status: "registration_open" as const,
    startsAt: at(12, 14),
    endsAt: at(12, 21),
    registrationOpensAt: ago(4, 10),
    registrationClosesAt: at(10, 20),
    venue: venues[2],
    entryFee: 6000,
    maxParticipants: 16,
    coverUrl: "/images/club/fitness-training.webp",
    regulations:
      "Парный разряд, олимпийская система. Матчи до одного сета, финал — до двух. Заявка подаётся парой, замена партнёра возможна до закрытия регистрации.",
    participants: regs(["p01", "p03", "p05", "p17", "p08", "p02", "p04", "p11", "p18", "p10", "p07", "p06"], {
      partners: {
        p01: "p05",
        p03: "p17",
        p08: "p02",
        p04: "p11",
        p18: "p10",
        p07: "p06",
      },
      seeds: { p01: 1, p03: 2, p08: 3, p04: 4 },
      waitlist: ["p07", "p06"],
      registeredDaysAgo: 4,
    }),
    season: 2026,
  },
  {
    id: "t07",
    slug: "osenniy-kubok-2026",
    title: "Осенний Кубок 2026",
    description:
      "Кубок клуба на грунтовых кортах. Три недели отборочных матчей и финальный день на центральном корте. Сильнейший состав сезона в категории Masters.",
    type: "cup" as const,
    category: "masters" as const,
    surface: "clay" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(18, 10),
    endsAt: ago(7, 18),
    registrationOpensAt: ago(45, 10),
    registrationClosesAt: ago(22, 20),
    venue: venues[1],
    entryFee: 5000,
    maxParticipants: 16,
    coverUrl: "/images/club/trophy-presentation.webp",
    regulations:
      "Кубок проводится по олимпийской системе. Матчи до двух побед, финал — до трёх сетов. Победитель получает 500 рейтинговых очков.",
    participants: regs(["p01", "p05", "p02", "p08", "p03", "p17", "p04", "p11", "p18", "p10", "p09", "p12", "p06", "p07", "p15", "p16"], {
      seeds: { p01: 1, p05: 2, p02: 3, p08: 4 },
      registeredDaysAgo: 40,
    }),
    winners: [
      { place: 1 as const, playerIds: ["p01"] },
      { place: 2 as const, playerIds: ["p05"] },
      { place: 3 as const, playerIds: ["p02"] },
    ],
    season: 2026,
  },
  {
    id: "t08",
    slug: "hard-cup-oktyabr",
    title: "Hard Cup: октябрь",
    description:
      "Серия быстрых субботних турниров на харде. Восемь игроков, один день, много матчей. Победитель получает wild card на итоговый турнир сезона.",
    type: "singles" as const,
    category: "challenger" as const,
    surface: "hard" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(26, 10),
    endsAt: ago(26, 17),
    registrationOpensAt: ago(50, 10),
    registrationClosesAt: ago(29, 20),
    venue: venues[0],
    entryFee: 2800,
    maxParticipants: 8,
    coverUrl: "/images/club/courts-wide.webp",
    regulations:
      "Один игровой день. Матчи до одного сета, полуфиналы и финал — до двух. Победитель получает wild card на итоговый турнир.",
    participants: regs(["p03", "p08", "p17", "p11", "p02", "p04", "p18", "p10"], {
      seeds: { p03: 1, p08: 2, p17: 3, p02: 4 },
      registeredDaysAgo: 35,
    }),
    winners: [
      { place: 1 as const, playerIds: ["p03"] },
      { place: 2 as const, playerIds: ["p02"] },
      { place: 3 as const, playerIds: ["p08"] },
    ],
    season: 2026,
  },
  {
    id: "t09",
    slug: "clay-series-3",
    title: "Clay Series #3",
    description:
      "Парная серия на грунте. Формат круговой, пары играют между собой по три матча за вечер. Хорошая практика перед зимним сезоном.",
    type: "doubles" as const,
    category: "futures" as const,
    surface: "clay" as const,
    format: "round_robin" as const,
    status: "completed" as const,
    startsAt: ago(34, 18),
    endsAt: ago(34, 22),
    registrationOpensAt: ago(55, 10),
    registrationClosesAt: ago(36, 20),
    venue: venues[1],
    entryFee: 2200,
    maxParticipants: 10,
    coverUrl: "/images/club/courts-aerial.webp",
    regulations:
      "Круговой формат, 5 пар, каждый с каждым. Матчи до 6 геймов, тай-брейк до 7. Победа — 2 очка.",
    participants: regs(["p01", "p03", "p05", "p17", "p08", "p02", "p04", "p11", "p18", "p10"], {
      partners: {
        p01: "p05",
        p03: "p17",
        p08: "p02",
        p04: "p11",
        p18: "p10",
      },
      registeredDaysAgo: 40,
    }),
    winners: [
      { place: 1 as const, playerIds: ["p03", "p17"] },
      { place: 2 as const, playerIds: ["p01", "p05"] },
      { place: 3 as const, playerIds: ["p08", "p02"] },
    ],
    season: 2026,
  },
  {
    id: "t10",
    slug: "komandnaya-vstrecha-pushkin",
    title: "Матчевая встреча: Pushkin — Nevsky",
    description:
      "Товарищеская командная встреча клубов. Шесть пар, три сета у мужчин и женщин, микст в решающем матче. Болельщики и чай на трибунах приветствуются.",
    type: "teams" as const,
    category: "beginners" as const,
    surface: "hard" as const,
    format: "round_robin" as const,
    status: "scheduled" as const,
    startsAt: at(16, 12),
    endsAt: at(16, 18),
    registrationOpensAt: ago(12, 10),
    registrationClosesAt: at(14, 20),
    venue: venues[0],
    entryFee: 0,
    maxParticipants: 12,
    coverUrl: "/images/club/adult-tournament.webp",
    regulations:
      "Командный формат, шесть пар. Каждая встреча — один сет. Победитель определяется по общему количеству выигранных матчей.",
    participants: regs(["p09", "p12", "p15", "p16", "p10", "p07", "p18", "p06", "p04", "p11"], {
      partners: {
        p09: "p12",
        p15: "p16",
        p10: "p07",
        p18: "p06",
        p04: "p11",
      },
      registeredDaysAgo: 11,
    }),
    season: 2026,
  },
  {
    id: "t11",
    slug: "letniy-kubok-2026",
    title: "Летний Кубок 2026",
    description:
      "Большой летний кубок клуба. Игроки всех категорий, две недели матчей и финальный день на центральном корте. Главный социальный турнир сезона.",
    type: "cup" as const,
    category: "masters" as const,
    surface: "clay" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(96, 10),
    endsAt: ago(82, 18),
    registrationOpensAt: ago(130, 10),
    registrationClosesAt: ago(100, 20),
    venue: venues[1],
    entryFee: 4500,
    maxParticipants: 16,
    coverUrl: "/images/club/courts-wide.webp",
    regulations:
      "Олимпийская система, матчи до двух побед. Финал — до трёх сетов. Победитель получает 500 очков и кубок клуба.",
    participants: regs(["p01", "p05", "p02", "p08", "p03", "p17", "p04", "p11"], {
      seeds: { p01: 1, p05: 2, p02: 3, p08: 4 },
      registeredDaysAgo: 120,
    }),
    winners: [
      { place: 1 as const, playerIds: ["p02"] },
      { place: 2 as const, playerIds: ["p01"] },
      { place: 3 as const, playerIds: ["p05"] },
    ],
    season: 2026,
  },
  {
    id: "t12",
    slug: "itogovyy-turnir-2026",
    title: "Итоговый турнир сезона 2026",
    description:
      "Финал сезона для сильнейших игроков лиги. Восемь игроков по рейтингу, две группы, полуфиналы и финал. Победитель получает титул игрока года Mr. Pushkin.",
    type: "final" as const,
    category: "masters" as const,
    surface: "hard" as const,
    format: "groups_playoff" as const,
    status: "registration_soon" as const,
    startsAt: at(45, 11),
    endsAt: at(46, 18),
    registrationOpensAt: at(20, 10),
    registrationClosesAt: at(42, 20),
    venue: venues[2],
    entryFee: 0,
    maxParticipants: 8,
    coverUrl: "/images/club/trophy-presentation.webp",
    regulations:
      "Участвуют 8 лучших игроков сезона по рейтингу. Группы по 4, плей-офф. Финал — до трёх сетов.",
    participants: regs([], { registeredDaysAgo: 1 }),
    season: 2026,
  },
  {
    id: "t13",
    slug: "osenny-kubok-2025",
    title: "Осенний Кубок 2025",
    description:
      "Кубок клуба сезона 2025 на грунтовых кортах. Победителем стал Артём Соколов, обыгравший в финале Илью Тарасова.",
    type: "cup" as const,
    category: "masters" as const,
    surface: "clay" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(390, 10),
    endsAt: ago(380, 18),
    registrationOpensAt: ago(430, 10),
    registrationClosesAt: ago(400, 20),
    venue: venues[1],
    entryFee: 4000,
    maxParticipants: 16,
    coverUrl: "/images/club/trophy-presentation.webp",
    regulations: "Олимпийская система, матчи до двух побед. Финал — до трёх сетов.",
    participants: regs(["p01", "p05", "p02", "p03"], { registeredDaysAgo: 420 }),
    winners: [
      { place: 1 as const, playerIds: ["p01"] },
      { place: 2 as const, playerIds: ["p05"] },
      { place: 3 as const, playerIds: ["p03"] },
    ],
    season: 2025,
  },
  {
    id: "t14",
    slug: "novogodniy-2025",
    title: "Новогодний турнир 2025",
    description:
      "Праздничный парный турнир сезона 2025. Победили Дмитрий Ковалёв и Сергей Волков.",
    type: "doubles" as const,
    category: "challenger" as const,
    surface: "hard" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(330, 14),
    endsAt: ago(330, 21),
    registrationOpensAt: ago(360, 10),
    registrationClosesAt: ago(334, 20),
    venue: venues[0],
    entryFee: 5000,
    maxParticipants: 16,
    coverUrl: "/images/club/fitness-training.webp",
    regulations: "Парный разряд, олимпийская система, матчи до одного сета.",
    participants: regs(["p03", "p17", "p01", "p05"], {
      partners: { p03: "p17", p01: "p05" },
      registeredDaysAgo: 340,
    }),
    winners: [
      { place: 1 as const, playerIds: ["p03", "p17"] },
      { place: 2 as const, playerIds: ["p01", "p05"] },
    ],
    season: 2025,
  },
  {
    id: "t15",
    slug: "letniy-kubok-2025",
    title: "Летний Кубок 2025",
    description:
      "Летний кубок клуба сезона 2025. В финале Мария Шмелёва обыграла Екатерину Громову.",
    type: "cup" as const,
    category: "challenger" as const,
    surface: "clay" as const,
    format: "olympic" as const,
    status: "completed" as const,
    startsAt: ago(460, 10),
    endsAt: ago(447, 18),
    registrationOpensAt: ago(500, 10),
    registrationClosesAt: ago(464, 20),
    venue: venues[1],
    entryFee: 4000,
    maxParticipants: 16,
    coverUrl: "/images/club/courts-wide.webp",
    regulations: "Олимпийская система, матчи до двух побед.",
    participants: regs(["p02", "p08", "p04", "p18"], { registeredDaysAgo: 480 }),
    winners: [
      { place: 1 as const, playerIds: ["p02"] },
      { place: 2 as const, playerIds: ["p08"] },
      { place: 3 as const, playerIds: ["p04"] },
    ],
    season: 2025,
  },
  {
    id: "t16",
    slug: "rooki-cup-2025-final",
    title: "Rookies Cup 2025: финал",
    description:
      "Финальный турнир серии Rookies сезона 2025. Победитель — Никита Орлов.",
    type: "singles" as const,
    category: "rookies" as const,
    surface: "hard" as const,
    format: "groups_playoff" as const,
    status: "completed" as const,
    startsAt: ago(410, 11),
    endsAt: ago(410, 17),
    registrationOpensAt: ago(440, 10),
    registrationClosesAt: ago(414, 20),
    venue: venues[0],
    entryFee: 2000,
    maxParticipants: 12,
    coverUrl: "/images/club/courts-aerial.webp",
    regulations: "Группы по 4, плей-офф. Матчи до одного сета.",
    participants: regs(["p07", "p10", "p18", "p09"], { registeredDaysAgo: 430 }),
    winners: [
      { place: 1 as const, playerIds: ["p07"] },
      { place: 2 as const, playerIds: ["p10"] },
    ],
    season: 2025,
  },
];

export type MockTournament = (typeof tournaments)[number];

export const tournamentBySlug = new Map(tournaments.map((item) => [item.slug, item]));
export const tournamentById = new Map(tournaments.map((item) => [item.id, item]));

export function getTournament(slug: string) {
  return tournamentBySlug.get(slug);
}

export function getTournamentById(id: string) {
  return tournamentById.get(id);
}

export const upcomingTournaments = tournaments
  .filter((item) => ["registration_soon", "registration_open", "registration_closed", "scheduled", "live"].includes(item.status))
  .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

export const completedTournaments = tournaments
  .filter((item) => item.status === "completed")
  .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));

export const archiveTournaments = [...completedTournaments].sort(
  (a, b) => +new Date(b.startsAt) - +new Date(a.startsAt),
);
