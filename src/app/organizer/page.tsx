import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  CircleDot,
  ClipboardList,
  Newspaper,
  Plus,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { getOrganizerDashboard } from "@/lib/data";
import { STATUS_BY_VALUE } from "@/lib/domain";
import { cn, formatDate, formatDateShort, formatTime, timeAgo } from "@/lib/utils";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { MatchRow } from "@/components/domain/MatchRow";
import { OrganizerHeader, OrgStat, Panel, MiniLabel } from "@/components/organizer/OrganizerUI";
import { RegistrationsInbox } from "@/components/organizer/RegistrationsInbox";

export default async function OrganizerDashboardPage() {
  const data = await getOrganizerDashboard();
  const live = data.matches.filter((match) => match.status === "live");

  return (
    <>
      <OrganizerHeader
        eyebrow={`Оперативный штаб · ${formatDate(new Date())}`}
        title="Обзор лиги"
        description="Всё, что требует внимания сегодня: новые заявки, матчи на корте и турниры, которые готовятся к старту."
        meta={
          <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
            <CircleDot className="size-3.5 text-positive" aria-hidden="true" />
            Сезон 2026
          </span>
        }
        actions={
          <>
            <Link href="/organizer/applications" className="btn btn-secondary btn-sm">
              <UserCheck className="size-4" aria-hidden="true" />
              Заявки игроков
            </Link>
            <Link href="/organizer/tournaments/new" className="btn btn-primary btn-sm">
              <Plus className="size-4" aria-hidden="true" />
              Создать турнир
            </Link>
            <Link href="/" className="btn btn-secondary btn-sm">
              На сайт
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="space-y-8 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat
            label="Игроки лиги"
            value={data.stats.players}
            hint="+12 за последний месяц"
            icon={<Users className="size-4" />}
            trend={{ value: "+4%", positive: true }}
          />
          <OrgStat
            label="Активные турниры"
            value={data.stats.activeTournaments}
            hint="1 идёт прямо сейчас"
            icon={<Trophy className="size-4" />}
            tone="warning"
          />
          <OrgStat
            label="В расписании"
            value={data.stats.upcoming}
            hint="Ближайший старт — через 3 дня"
            icon={<CalendarPlus className="size-4" />}
            tone="neutral"
          />
          <OrgStat
            label="Новые заявки"
            value={data.stats.newRegistrations}
            hint="за последние 7 дней"
            icon={<UserPlus className="size-4" />}
            tone="positive"
            trend={{ value: "+8", positive: true }}
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <Panel
              title="Заявки на подтверждение"
              description="Свежие регистрации по всем турнирам лиги"
              action={
                <Link href="/organizer/tournaments" className="link-arrow text-xs">
                  Все турниры
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
              flush
            >
              <RegistrationsInbox
                items={data.registrations.map((entry) => ({
                  id: entry.id,
                  playerName: `${entry.player.firstName} ${entry.player.lastName}`,
                  firstName: entry.player.firstName,
                  lastName: entry.player.lastName,
                  tournamentSlug: entry.tournamentSlug,
                  tournamentTitle: entry.tournamentTitle,
                  status: entry.status,
                  createdAt: entry.createdAt,
                }))}
              />
            </Panel>

            <div className="grid gap-8 lg:grid-cols-2">
              <Panel
                title="На корте"
                description={live.length > 0 ? `${live.length} матча идут сейчас` : "Сейчас игр нет"}
                action={
                  <Link href="/organizer/matches" className="link-arrow text-xs">
                    К матчам
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                }
                flush
              >
                <div className="divide-y divide-line">
                  {live.length > 0 ? (
                    live.map((match) => <MatchRow key={match.id} match={match} showTournament={false} />)
                  ) : (
                    <p className="px-5 py-10 text-center text-sm text-ink-muted">Сегодня матчей не запланировано.</p>
                  )}
                </div>
              </Panel>

              <Panel
                title="Ближайшие турниры"
                description="Готовность к старту и регистрация"
                action={
                  <Link href="/organizer/tournaments" className="link-arrow text-xs">
                    Все
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                }
                flush
              >
                <ul className="divide-y divide-line">
                  {data.tournaments.map((tournament) => {
                    const confirmed = tournament.participants.filter(
                      (item) => item.status === "confirmed",
                    ).length;
                    return (
                      <li key={tournament.id}>
                        <Link
                          href={`/organizer/tournaments/${tournament.id}`}
                          className="block py-3 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[0.8rem] font-bold text-ink">{tournament.title}</p>
                            <StatusPill status={tournament.status} className="shrink-0" />
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.64rem] text-ink-muted">
                            <span>{formatDateShort(tournament.startsAt)}</span>
                            <span className="text-ink-faint">·</span>
                            <CategoryBadge category={tournament.category} withName={false} />
                            <span className="text-ink-faint">·</span>
                            <span>
                              {confirmed}/{tournament.maxParticipants} участников
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </div>

            <Panel
              title="Последние результаты"
              description="Завершённые матчи и опубликованные счёты"
              action={
                <Link href="/organizer/matches" className="link-arrow text-xs">
                  Внести счёт
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
              flush
            >
              <div className="divide-y divide-line">
                {data.results.slice(0, 4).map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            </Panel>
          </div>

          <aside className="space-y-8">
            <Panel title="Быстрые действия">
              <div className="grid gap-2">
                {[
                  {
                    href: "/organizer/tournaments/new",
                    icon: CalendarPlus,
                    label: "Создать турнир",
                    hint: "Черновик за 2 минуты",
                  },
                  {
                    href: "/organizer/bracket",
                    icon: Trophy,
                    label: "Сгенерировать сетку",
                    hint: "Олимпийская, группы, круги",
                  },
                  {
                    href: "/organizer/matches",
                    icon: ClipboardList,
                    label: "Внести результаты",
                    hint: "3 матча без счёта",
                  },
                  {
                    href: "/organizer/content",
                    icon: Newspaper,
                    label: "Опубликовать новость",
                    hint: "2 черновика",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group flex items-center gap-3 border-b border-line py-3 transition-colors last:border-b-0"
                    >
                      <span className="shrink-0 text-ink-muted">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.8rem] font-medium text-ink transition-opacity group-hover:opacity-60">{action.label}</span>
                        <span className="block text-[0.64rem] text-ink-muted">{action.hint}</span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Движение рейтинга" description="Изменения после последних турниров" flush>
              <ul className="divide-y divide-line">
                {data.ratingHistory.slice(0, 4).map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.78rem] font-medium text-ink">{entry.match}</p>
                        <p className="mt-0.5 text-[0.64rem] text-ink-muted">{entry.reason}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[0.68rem] font-medium tabular-nums",
                          entry.delta >= 0 ? "text-positive" : "text-negative",
                        )}
                      >
                        {entry.delta > 0 ? "+" : ""}
                        {entry.delta}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line py-3">
                <Link href="/organizer/ratings" className="link-arrow text-xs">
                  Управление рейтингом
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Panel>

            <Panel title="Журнал изменений" description="Действия организаторов" flush>
              <ul className="divide-y divide-line">
                {data.audit.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center border border-line text-[0.55rem] tabular-nums text-ink-muted">
                        {entry.actor.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.72rem] leading-snug text-ink-soft">
                          <span className="font-bold text-ink">{entry.actor}</span> {entry.action.toLowerCase()}
                        </p>
                        <p className="mt-0.5 truncate text-[0.62rem] text-ink-muted">{entry.entity}</p>
                      </div>
                      <span className="shrink-0 text-[0.58rem] text-ink-faint">{timeAgo(entry.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="pt-4">
              <MiniLabel>Финансы сезона</MiniLabel>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="display text-[1.9rem] leading-none tabular-nums">412 500 ₽</p>
                  <p className="mt-2 text-[0.64rem] text-ink-muted">собрано взносов в 2026</p>
                </div>
                <Wallet className="size-4 text-ink-muted" aria-hidden="true" />
              </div>
              <div className="mt-4 h-px bg-line">
                <div className="h-px w-[72%] bg-ink" />
              </div>
              <p className="mt-2 text-[0.62rem] text-ink-faint">72% от плана сезона</p>
            </Panel>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[0.66rem] text-ink-muted">
          <span>
            Данные обновлены {formatTime(new Date())} · демо-режим на мок-данных
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-3.5 text-ink-faint" aria-hidden="true" />
            {STATUS_BY_VALUE.live.label}: Pushkin Open 2026
          </span>
        </div>
      </div>
    </>
  );
}
