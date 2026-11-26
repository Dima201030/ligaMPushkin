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
} from "lucide-react";
import { getOrganizerDashboard } from "@/lib/data";
import { STATUS_BY_VALUE } from "@/lib/domain";
import { cn, formatDate, formatDateShort, formatTime, timeAgo } from "@/lib/utils";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { MatchRow } from "@/components/domain/MatchRow";
import { OrganizerHeader, Panel, MiniLabel } from "@/components/organizer/OrganizerUI";
import { OrgStatCount } from "@/components/organizer/OrgStatCount";
import { RegistrationsInbox } from "@/components/organizer/RegistrationsInbox";
import { hasFullOrganizerAccess } from "@/lib/api/auth";
import { requireOrganizerSession } from "@/lib/organizer-access";

export default async function OrganizerDashboardPage() {
  const session = await requireOrganizerSession();
  const fullAccess = hasFullOrganizerAccess(session);
  const data = await getOrganizerDashboard();
  const live = data.matches.filter((match) => match.status === "live");
  const nextTournament = data.tournaments
    .filter((item) => new Date(item.startsAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  return (
    <>
      <OrganizerHeader
        eyebrow={`Оперативный штаб · ${formatDate(new Date())}`}
        title="Обзор турниров"
        description={
          fullAccess
            ? "Всё, что требует внимания сегодня: новые заявки, матчи на корте и турниры, которые готовятся к старту."
            : "Ограниченный кабинет организатора турниров: сетки, матчи, заявки на турнир и состав."
        }
        meta={
          <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
            <CircleDot className="size-3.5 text-positive" aria-hidden="true" />
            Сезон {new Date().getFullYear()}
          </span>
        }
        actions={
          <>
            {fullAccess ? (
              <Link href="/organizer/applications" className="btn btn-secondary btn-sm">
                <UserCheck className="size-4" aria-hidden="true" />
                Заявки игроков
              </Link>
            ) : null}
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
          <OrgStatCount
            label="Игроки"
            value={data.stats.players}
            hint="в базе платформы"
            icon={<Users className="size-4" />}
          />
          <OrgStatCount
            label="Активные турниры"
            value={data.stats.activeTournaments}
            hint={live.length > 0 ? `${live.length} матчей идут сейчас` : "Матчи не начаты"}
            icon={<Trophy className="size-4" />}
            tone="warning"
          />
          <OrgStatCount
            label="В расписании"
            value={data.stats.upcoming}
            hint={nextTournament ? `Ближайший старт — ${formatDateShort(nextTournament.startsAt)}` : "Даты не назначены"}
            icon={<CalendarPlus className="size-4" />}
            tone="neutral"
          />
          <OrgStatCount
            label="Завершено матчей"
            value={data.stats.completedMatches}
            hint={data.stats.missingScores > 0 ? `${data.stats.missingScores} без счёта` : "Все результаты внесены"}
            icon={<UserPlus className="size-4" />}
            tone="positive"
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <Panel
              title="Заявки на подтверждение"
              description="Свежие регистрации по всем турнирам"
              action={
                <Link href="/organizer/tournaments" className="link-arrow text-xs">
                  Все турниры
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
              flush
            >
              {data.registrations.length > 0 ? (
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
              ) : (
                <p className="px-5 py-10 text-center text-sm text-ink-muted">
                  Новых заявок нет. Заявки на аккаунты проверяются в разделе «Заявки игроков».
                </p>
              )}
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
                    hint:
                      data.stats.missingScores > 0
                        ? `${data.stats.missingScores} матчей без счёта`
                        : "Все счёты внесены",
                  },
                  ...(fullAccess
                    ? [
                        {
                          href: "/organizer/content",
                          icon: Newspaper,
                          label: "Опубликовать новость",
                          hint: "Новости и страницы платформы",
                        },
                      ]
                    : []),
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

            {fullAccess ? (
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
            ) : null}

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
              <MiniLabel>Сезон {new Date().getFullYear()}</MiniLabel>
              <dl className="mt-3 space-y-2 text-[0.72rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Всего турниров</dt>
                  <dd className="tabular-nums text-ink">{data.stats.totalTournaments}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Идут сейчас</dt>
                  <dd className="tabular-nums text-ink">{data.stats.activeTournaments}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Черновики</dt>
                  <dd className="tabular-nums text-ink">{data.stats.drafts}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Скрыто с сайта</dt>
                  <dd className="tabular-nums text-ink">{data.stats.hiddenTournaments}</dd>
                </div>
              </dl>
            </Panel>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[0.66rem] text-ink-muted">
          <span>Данные обновлены {formatTime(new Date())}</span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-3.5 text-ink-faint" aria-hidden="true" />
            {data.stats.activeTournaments > 0
              ? `${STATUS_BY_VALUE.live.label}: ${data.stats.activeTournaments}`
              : "Активных турниров нет"}
          </span>
        </div>
      </div>
    </>
  );
}
