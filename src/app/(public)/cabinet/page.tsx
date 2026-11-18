import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Trophy,
} from "lucide-react";
import { getCabinetData } from "@/lib/data";
import { CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, formatDate, formatNumber, winRate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge } from "@/components/ui/Badges";
import { RatingChart, FormDots } from "@/components/charts";
import { MatchRow } from "@/components/domain/MatchRow";
import {
  EditProfileButton,
  MyRegistrations,
  NotificationSettings,
  RatingHistoryTable,
} from "@/components/domain/CabinetPanels";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Заявки на турниры, матчи, рейтинг и настройки игрока лиги Mr. Pushkin.",
};

const NAV = [
  { href: "#overview", label: "Обзор" },
  { href: "#registrations", label: "Мои заявки" },
  { href: "#matches", label: "Матчи" },
  { href: "#rating", label: "Рейтинг" },
  { href: "#settings", label: "Настройки" },
];

export default async function CabinetPage() {
  const { player, registrations, matches, upcoming, ranking, titles, history } = await getCabinetData();
  const category = CATEGORY_BY_SLUG[player.category];
  const rate = winRate(player.wins, player.losses);
  const results = matches.filter((match) => match.status === "completed").slice(0, 4);
  const form = player.trend.slice(-5).map((value, index, array) =>
    index === 0 ? 0 : value - array[index - 1],
  );

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60 court-pattern" aria-hidden="true" />
        <div className="page-shell relative py-10 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow eyebrow-plain text-sky">Личный кабинет · сезон 2026</p>
            <div className="flex items-center gap-3 text-[0.7rem] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-positive" aria-hidden="true" />
                Профиль подтверждён
              </span>
              <span className="hidden sm:inline">Игрок лиги</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar firstName={player.firstName} lastName={player.lastName} size="hero" tone="navy" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[1.04] text-white">
                {player.firstName} {player.lastName}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="badge border-white/35 text-white/85">
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {category.name}
                </span>
                <span className="badge border border-white/20 text-white/70">
                  #{ranking.position} в общем рейтинге
                </span>
              </div>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {player.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  в лиге с {new Date(player.memberSince).getFullYear()}
                </span>
                <span>{category.note}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditProfileButton />
              <Link href="/tournaments" className="btn btn-light">
                Найти турнир
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <nav
            className="mt-8 grid grid-cols-3 gap-x-6 gap-y-3 border-t border-white/15 pt-5 sm:flex sm:flex-wrap"
            aria-label="Разделы кабинета"
          >
            {NAV.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={index === 0 ? "true" : undefined}
                className={cn(
                  "inline-block justify-self-start text-[0.6rem] uppercase tracking-[0.14em] transition-colors",
                  index === 0 ? "text-white" : "text-white/55 hover:text-white",
                )}
              >
                <span className="relative">
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-px w-full bg-white transition-opacity",
                      index === 0 ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div id="overview" className="page-shell section">
        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <div className="min-w-0 space-y-6">
            <section className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-line py-7 sm:grid-cols-4">
              {[
                { value: player.wins, label: "побед", tone: "text-positive" },
                { value: player.losses, label: "поражений", tone: "text-negative" },
                { value: `${rate}%`, label: "процент побед", tone: "" },
                { value: player.titlesCount, label: "титулов", tone: "" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className={cn("display text-[1.9rem] leading-none tabular-nums", stat.tone)}>
                    {stat.value}
                  </p>
                  <p className="stat-label mt-2">{stat.label}</p>
                </div>
              ))}
            </section>

            <section id="registrations" className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl">Мои заявки</h2>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Турниры, на которые вы записаны в этом сезоне</p>
                </div>
                <Link href="/tournaments" className="link-arrow">
                  Все турниры
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="border-y border-line">
                <MyRegistrations
                  items={registrations.map((item) => ({
                    id: item.tournament.id,
                    slug: item.tournament.slug,
                    title: item.tournament.title,
                    startsAt: item.tournament.startsAt,
                    status: item.status,
                    partner: item.partner
                      ? `${item.partner.firstName} ${item.partner.lastName}`
                      : undefined,
                    fee: item.tournament.entryFee,
                  }))}
                />
              </div>
            </section>

            <section id="matches" className="scroll-mt-24">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl">Ближайшие матчи</h2>
                  <p className="mt-1 text-xs text-ink-muted">Расписание игр и текущие встречи</p>
                </div>
              </div>
              <div className="card-flat overflow-hidden">
                {upcoming.length > 0 ? (
                  <div className="divide-y divide-divider">
                    {upcoming.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="font-bold">Ближайших матчей нет</p>
                    <p className="mt-1 text-sm text-ink-muted">Запишитесь на турнир — расписание появится после жеребьёвки.</p>
                  </div>
                )}
              </div>
            </section>

            <section id="rating" className="scroll-mt-24 space-y-4">
              <div>
                <h2 className="text-xl">Рейтинг и результаты</h2>
                <p className="mt-1 text-xs text-ink-muted">Как менялся ваш рейтинг и что происходит в последних матчах</p>
              </div>

              <div className="border-t border-line pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg">Динамика рейтинга</h3>
                    <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Последние 8 турниров сезона</p>
                  </div>
                  <FormDots form={form} />
                </div>
                <RatingChart values={player.trend} className="mt-4" />
                <div className="mt-5 overflow-hidden border-t border-line">
                  <RatingHistoryTable rows={history} />
                </div>
              </div>

              <div className="border-t border-line pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                  Последние результаты
                </p>
                <div className="mt-3">
                  {results.length > 0 ? (
                    results.map((match) => <MatchRow key={match.id} match={match} />)
                  ) : (
                    <p className="py-8 text-center text-sm text-ink-muted">Пока нет завершённых матчей.</p>
                  )}
                </div>
              </div>
            </section>

            <section id="settings" className="scroll-mt-24 border-t border-line pt-6">
              <h2 className="text-xl">Мои данные</h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Эти данные видны другим игрокам в каталоге и турнирных таблицах.
              </p>
              <dl className="mt-5 grid gap-5 border-t border-divider pt-5 sm:grid-cols-2">
                <div>
                  <dt className="stat-label">Дата рождения</dt>
                  <dd className="mt-1 text-sm font-semibold">{player.birthYear} год</dd>
                </div>
                <div>
                  <dt className="stat-label">Город</dt>
                  <dd className="mt-1 text-sm font-semibold">{player.city}</dd>
                </div>
                <div>
                  <dt className="stat-label">Телефон</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Phone className="size-3.5 text-ink-faint" aria-hidden="true" />
                    +7 (911) 000-00-00
                  </dd>
                </div>
                <div>
                  <dt className="stat-label">E-mail</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                    <Mail className="size-3.5 text-ink-faint" aria-hidden="true" />
                    player@example.com
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[0.68rem] leading-relaxed text-ink-faint">
                Контакты видны только организатору турниров. В публичном профиле отображаются имя, категория и игровая статистика.
              </p>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="border-t border-line pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Позиция</p>
                  <p className="display mt-3 text-[2.6rem] leading-none tabular-nums">#{ranking.position}</p>
                  <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">в общем рейтинге лиги</p>
                </div>
                <CategoryBadge category={player.category} withName={false} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-divider pt-5">
                <div>
                  <p className="display text-[1.5rem] leading-none tabular-nums">{player.rating}</p>
                  <p className="stat-label mt-2">рейтинг</p>
                </div>
                <div>
                  <p className="display text-[1.5rem] leading-none tabular-nums">{formatNumber(player.points)}</p>
                  <p className="stat-label mt-2">очков</p>
                </div>
              </div>
              <Link href="/rating" className="btn btn-secondary mt-5 w-full">
                Полный рейтинг
              </Link>
            </div>

            <div className="border-t border-line pt-6">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-ink-muted" aria-hidden="true" />
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Мои титулы</p>
              </div>
              {titles.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {titles.slice(0, 4).map((title, index) => (
                    <li key={`${title.tournamentTitle}-${index}`} className="flex gap-3 border-b border-divider pb-3 last:border-b-0">
                      <span
                        className={cn(
                          "display w-5 shrink-0 text-[1.2rem] leading-none tabular-nums",
                          title.place === 1 ? "text-ink" : "text-ink-faint",
                        )}
                      >
                        {title.place}
                      </span>
                      <div>
                        <p className="text-xs font-medium leading-snug">{title.tournamentTitle}</p>
                        <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-ink-muted">
                          {title.year} · {title.place === 1 ? "победа" : "призовое место"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">Пока без титулов — всё впереди.</p>
              )}
            </div>

            <div id="notifications" className="border-t border-line pt-6">
              <NotificationSettings />
            </div>

            <div className="bg-navy p-6 text-white">
              <Award className="size-6 text-sky" aria-hidden="true" />
              <p className="display mt-4 text-[1.3rem] leading-snug">Следующий шаг — турнир</p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Открыта регистрация на зимнюю серию. Ваша категория — {category.name}.
              </p>
              <Link href="/tournaments" className="btn btn-light mt-5 w-full">
                Смотреть расписание
              </Link>
            </div>

            <div className="border-t border-line pt-6">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Нужна помощь?</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Напишите организатору лиги — поможем с заявкой, партнёром или переносом матча.
              </p>
              <Link href="/contacts" className="link-arrow mt-3 text-xs">
                Контакты клуба
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-ink-muted">
          <span>Профиль игрока обновлён {formatDate(player.memberSince)}</span>
          <Link href={`/players/${player.slug}`} className="link-arrow">
            Публичный профиль
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
