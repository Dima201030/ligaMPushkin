import type {
  Category,
  CategorySlug,
  MatchStatus,
  RegistrationStatus,
  Surface,
  TournamentFormat,
  TournamentStatus,
  TournamentType,
} from "@/lib/types";

export const CLUB = {
  name: "Mr. Pushkin",
  fullName: "Теннисный клуб Mr. Pushkin",
  leagueName: "Лига Mr. Pushkin",
  address: "Санкт-Петербург, Пушкинский район, Волхонское шоссе, 79А",
  phoneBookings: "+7 (911) 969-15-84",
  phoneSchool: "+7 (921) 966-20-20",
  hours: "Ежедневно с 08:00 до 23:00",
  email: "league@mrpushkin.com",
  vk: "https://vk.com/mrpushkintennis",
  courts: "7 крытых кортов и 2 открытых грунтовых",
  season: 2026,
} as const;

export const CATEGORIES: Category[] = [
  { slug: "masters", name: "Masters", shortName: "M", color: "#071b2b", note: "Высшая категория клуба" },
  { slug: "challenger", name: "Challenger", shortName: "CH", color: "#1b46f0", note: "Сильные игроки, турнирный опыт" },
  { slug: "futures", name: "Futures", shortName: "F", color: "#2f5acf", note: "Уверенная игра и стабильный результат" },
  { slug: "rookies", name: "Rookies", shortName: "R", color: "#4e6e8a", note: "Первый соревновательный опыт" },
  { slug: "beginners", name: "Beginners", shortName: "B", color: "#6d7c88", note: "Начинающие взрослые игроки" },
  { slug: "newcomers", name: "Newcomers", shortName: "N", color: "#8a959e", note: "Только знакомятся с турнирами" },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category]),
) as Record<CategorySlug, Category>;

export const TOURNAMENT_TYPES: { value: TournamentType; label: string; short: string }[] = [
  { value: "singles", label: "Одиночный", short: "1×1" },
  { value: "doubles", label: "Парный", short: "2×2" },
  { value: "mixed", label: "Микст", short: "Микст" },
  { value: "final", label: "Итоговый", short: "Финал" },
  { value: "cup", label: "Кубок", short: "Кубок" },
  { value: "teams", label: "Матчевая встреча", short: "Команды" },
];

export const TYPE_BY_VALUE = Object.fromEntries(
  TOURNAMENT_TYPES.map((type) => [type.value, type]),
) as Record<TournamentType, (typeof TOURNAMENT_TYPES)[number]>;

export const SURFACES: { value: Surface; label: string }[] = [
  { value: "hard", label: "Хард" },
  { value: "clay", label: "Грунт" },
  { value: "grass", label: "Трава" },
  { value: "carpet", label: "Ковёр" },
];

export const SURFACE_LABEL = Object.fromEntries(
  SURFACES.map((surface) => [surface.value, surface.label]),
) as Record<Surface, string>;

export const FORMATS: { value: TournamentFormat; label: string; description: string }[] = [
  {
    value: "olympic",
    label: "Олимпийская система",
    description: "Плей-офф на выбывание. Проигравший выбывает из турнира.",
  },
  {
    value: "round_robin",
    label: "Круговой",
    description: "Каждый играет с каждым. Победитель определяется по очкам.",
  },
  {
    value: "groups_playoff",
    label: "Группы + плей-офф",
    description: "Групповой этап, затем выход сильнейших в сетку.",
  },
  {
    value: "double_elimination",
    label: "Двойное выбывание",
    description: "После первого поражения игрок переходит в нижнюю сетку.",
  },
];

export const FORMAT_LABEL = Object.fromEntries(
  FORMATS.map((format) => [format.value, format.label]),
) as Record<TournamentFormat, string>;

export const TOURNAMENT_STATUSES: {
  value: TournamentStatus;
  label: string;
  tone: "neutral" | "blue" | "positive" | "negative" | "warning";
}[] = [
  { value: "draft", label: "Черновик", tone: "neutral" },
  { value: "registration_soon", label: "Скоро откроется регистрация", tone: "warning" },
  { value: "registration_open", label: "Регистрация открыта", tone: "positive" },
  { value: "registration_closed", label: "Регистрация закрыта", tone: "neutral" },
  { value: "scheduled", label: "Ожидает проведения", tone: "blue" },
  { value: "live", label: "Идёт соревнование", tone: "negative" },
  { value: "completed", label: "Завершён", tone: "neutral" },
  { value: "cancelled", label: "Отменён", tone: "negative" },
];

export const STATUS_BY_VALUE = Object.fromEntries(
  TOURNAMENT_STATUSES.map((status) => [status.value, status]),
) as Record<TournamentStatus, (typeof TOURNAMENT_STATUSES)[number]>;

export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: "На подтверждении",
  confirmed: "Подтверждена",
  waitlist: "Лист ожидания",
  cancelled: "Отменена",
  rejected: "Отклонена",
};

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Запланирован",
  live: "Идёт",
  completed: "Завершён",
  cancelled: "Отменён",
  walkover: "Техническая победа",
};

export const RATING_RULES = [
  "Очки начисляются за число побед в сетке, её размер, категорию и тип турнира.",
  "В зачёт входят лучшие 10 одиночных и 5 парных результатов за последние 52 недели.",
  "Рейтинг Elo используется для посева, очки — для позиции в таблице.",
  "Техническая победа даёт половину очков и не меняет рейтинг Elo.",
  "Ручная корректировка доступна только владельцу и superadmin с обязательной причиной.",
];

export const PLAYER_ROLE_LABEL = {
  player: "Игрок",
  organizer: "Организатор",
  owner: "Владелец",
  superadmin: "Суперадмин",
} as const;
