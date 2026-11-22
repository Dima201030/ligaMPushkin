import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  MapPin,
  Network,
  Trophy,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { getOrganizerTournament } from "@/lib/data";
import { FORMAT_LABEL, SURFACE_LABEL, TYPE_BY_VALUE } from "@/lib/domain";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { CategoryBadge, StatusPill, SurfaceBadge, TypeBadge } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/Section";
import { MatchRow } from "@/components/domain/MatchRow";
import { OrganizerHeader, OrgStat, Panel, MiniLabel } from "@/components/organizer/OrganizerUI";
import { ParticipantsManager, TournamentStatusPanel } from "@/components/organizer/TournamentManage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getOrganizerTournament(id);
  return { title: data ? data.tournament.title : "Турнир не найден" };
}

export default async function OrganizerTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrganizerTournament(id);
  if (!data) notFound();

  const { tournament, participants, matches, confirmed, pending, waitlist, revenue, winners } = data;

  return (
    <>
      <OrganizerHeader
        eyebrow="Турниры · управление"
        title={tournament.title}
        description={tournament.description}
        meta={
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusPill status={tournament.status} />
            <CategoryBadge category={tournament.category} />
            <TypeBadge type={tournament.type} />
          </div>
        }
        actions={
          <>
            <Link href="/organizer/tournaments" className="btn btn-secondary btn-sm">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Все турниры
            </Link>
            <Link href={`/tournaments/${tournament.slug}`} className="btn btn-primary btn-sm">
              Публичная страница
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat
            label="Основной состав"
            value={`${confirmed}/${tournament.maxParticipants}`}
            hint={`${Math.max(0, tournament.maxParticipants - confirmed)} свободных мест`}
            icon={<Users className="size-4" />}
          />
          <OrgStat label="На подтверждении" value={pending} hint="требуют решения" icon={<UserCheck className="size-4" />} tone="warning" />
          <OrgStat label="Лист ожидания" value={waitlist} hint="при отказе — в основной состав" icon={<CalendarClock className="size-4" />} tone="neutral" />
          <OrgStat
            label="Собрано взносов"
            value={formatMoney(revenue)}
            hint={`${formatMoney(tournament.entryFee)} × ${confirmed}`}
            icon={<Wallet className="size-4" />}
            tone="positive"
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <Panel
              title="Участники"
              description="Подтверждайте заявки, управляйте листом ожидания и посевом"
              action={
                <span className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted">
                  {participants.length} заявок
                </span>
              }
              flush
            >
              <ParticipantsManager
                tournamentId={tournament.id}
                tournamentTitle={tournament.title}
                maxParticipants={tournament.maxParticipants}
                entryFee={tournament.entryFee}
                participants={participants.map((entry) => ({
                  registrationId: entry.registrationId,
                  playerId: entry.playerId,
                  firstName: entry.player.firstName,
                  lastName: entry.player.lastName,
                  slug: entry.player.slug,
                  category: entry.player.category,
                  rating: entry.player.rating,
                  status: entry.status,
                  seed: entry.seed,
                  partnerName: entry.partner
                    ? `${entry.partner.firstName} ${entry.partner.lastName}`
                    : undefined,
                  registeredAt: entry.registeredAt,
                }))}
              />
            </Panel>

            <Panel
              title="Матчи турнира"
              description={`${matches.length} матчей в расписании`}
              action={
                <Link href="/organizer/matches" className="link-arrow text-xs">
                  Внести счёт
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
              flush
            >
              {matches.length > 0 ? (
                <div className="divide-y divide-line">
                  {matches.map((match) => (
                    <MatchRow key={match.id} match={match} showTournament={false} />
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    title="Матчи ещё не созданы"
                    description="Сгенерируйте сетку после закрытия регистрации — матчи появятся в расписании автоматически."
                    action={
                      <Link href="/organizer/bracket" className="btn btn-primary btn-sm">
                        <Network className="size-3.5" aria-hidden="true" />
                        Сгенерировать сетку
                      </Link>
                    }
                  />
                </div>
              )}
            </Panel>

            <Panel title="Регламент и условия" description="Информация, которую видят игроки">
              <p className="text-[0.82rem] leading-relaxed text-ink-soft">{tournament.regulations}</p>
              <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                <div>
                  <dt className="stat-label">Взнос</dt>
                  <dd className="mt-1 text-sm">{tournament.entryFee ? formatMoney(tournament.entryFee) : "Бесплатно"}</dd>
                </div>
                <div>
                  <dt className="stat-label">Максимум участников</dt>
                  <dd className="mt-1 text-sm">{tournament.maxParticipants}</dd>
                </div>
                <div>
                  <dt className="stat-label">Регистрация открыта</dt>
                  <dd className="mt-1 text-sm">{formatDateTime(tournament.registrationOpensAt)}</dd>
                </div>
                <div>
                  <dt className="stat-label">Регистрация закрывается</dt>
                  <dd className="mt-1 text-sm">{formatDateTime(tournament.registrationClosesAt)}</dd>
                </div>
              </dl>
            </Panel>
          </div>

          <aside className="space-y-8">
            <TournamentStatusPanel
              status={tournament.status}
              participantCount={participants.length}
              matchCount={matches.length}
              tournament={{
                id: tournament.id,
                slug: tournament.slug,
                title: tournament.title,
                format: tournament.format,
                startsAt: tournament.startsAt,
                registrationClosesAt: tournament.registrationClosesAt,
              }}
            />

            <Panel title="Сетка и формат">
              <div className="flex flex-wrap gap-1.5">
                <SurfaceBadge surface={tournament.surface} />
                <span className="badge badge-neutral">{TYPE_BY_VALUE[tournament.type].label}</span>
              </div>
              <dl className="mt-4 space-y-2.5 text-[0.72rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Формат</dt>
                  <dd className="text-right text-ink">{FORMAT_LABEL[tournament.format]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Покрытие</dt>
                  <dd className="text-right text-ink">{SURFACE_LABEL[tournament.surface]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Корт</dt>
                  <dd className="text-right text-ink">{tournament.venue.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Адрес</dt>
                  <dd className="text-right text-ink">{tournament.venue.address}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[0.72rem] leading-relaxed text-ink-muted">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                {tournament.venue.courts} {tournament.venue.courts === 1 ? "корт" : "корта"} доступно для проведения
              </div>
              <Link href={`/organizer/bracket?tournament=${tournament.id}`} className="btn btn-secondary mt-3 w-full">
                <Network className="size-4" aria-hidden="true" />
                Открыть генератор сеток
              </Link>
            </Panel>

            {winners.length > 0 && (
              <Panel title="Победители" description="Опубликованные результаты">
                <ul className="space-y-3">
                  {winners.map((winner) => (
                    <li key={winner.place} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center border border-warning/40 text-[0.7rem] tabular-nums text-warning">
                        {winner.place}
                      </span>
                      <div>
                        <p className="text-[0.76rem] font-medium text-ink">
                          {winner.players.map((player) => `${player!.firstName} ${player!.lastName}`).join(" / ")}
                        </p>
                        <p className="text-[0.72rem] text-ink-muted">{winner.place === 1 ? "Победитель" : "Призовое место"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <Panel title="Служебное">
              <MiniLabel>Идентификатор</MiniLabel>
              <p className="mt-1 font-mono text-xs text-ink-soft">{tournament.id} · {tournament.slug}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <Link href={`/tournaments/${tournament.slug}`} className="btn btn-secondary btn-sm">
                  <Trophy className="size-3.5" aria-hidden="true" />
                  Страница турнира
                </Link>
                <button type="button" className="btn btn-ghost btn-sm" disabled title="Доступно после подключения базы данных">
                  В архив
                </button>
              </div>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-faint">
                Перенос в архив и удаление доступны после подключения базы данных и проверки прав.
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
