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
  Pencil,
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
import { OrganizerHeader, OrgStat, Panel } from "@/components/organizer/OrganizerUI";
import { ParticipantsManager, TournamentStatusPanel } from "@/components/organizer/TournamentManage";
import { TournamentCover } from "@/components/organizer/TournamentCover";
import { TournamentGallery } from "@/components/organizer/TournamentGallery";
import { TournamentDangerZone } from "@/components/organizer/TournamentDangerZone";
import { TournamentPlaces } from "@/components/organizer/TournamentPlaces";

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

  const { tournament, participants, matches, confirmed, pending, waitlist, revenue } = data;
  const isPairs = ["doubles", "mixed", "teams"].includes(tournament.type);
  const placeOptions = (() => {
    const byId = new Map<string, { id: string; name: string }>();
    for (const entry of participants) {
      if (entry.status !== "confirmed") continue;
      if (entry.playerId) {
        const name = `${entry.player.firstName} ${entry.player.lastName}`.trim();
        byId.set(entry.playerId, { id: entry.playerId, name: name || entry.playerId });
      }
      if (entry.partnerId) {
        const name = entry.partner
          ? `${entry.partner.firstName} ${entry.partner.lastName}`.trim()
          : entry.partnerId;
        byId.set(entry.partnerId, { id: entry.partnerId, name: name || entry.partnerId });
      }
    }
    return [...byId.values()];
  })();

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
            <Link href={`/organizer/tournaments/${tournament.id}/edit`} className="btn btn-secondary btn-sm">
              <Pencil className="size-3.5" aria-hidden="true" />
              Редактировать
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
                <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                  {participants.length} заявок
                </span>
              }
              flush
            >
              <ParticipantsManager
                tournamentId={tournament.id}
                tournamentSlug={tournament.slug}
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
              title="Фото профиля"
              description="Обложка для списка турниров и шапки публичной страницы"
            >
              <TournamentCover
                tournamentId={tournament.id}
                coverUrl={tournament.coverUrl}
              />
            </Panel>

            <Panel
              title="Галерея"
              description="Фотографии турнира видны на публичной странице"
              action={
                <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                  до 12 изображений
                </span>
              }
            >
              <TournamentGallery
                tournamentId={tournament.id}
                images={tournament.images ?? []}
              />
            </Panel>

            <Panel
              title="Призёры и места"
              description="Первое–четвёртое место на публичной странице турнира"
              action={
                <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                  {tournament.winners?.length ?? 0} из 4
                </span>
              }
            >
              <TournamentPlaces
                tournamentId={tournament.id}
                isPairs={isPairs}
                participants={placeOptions}
                winners={tournament.winners ?? []}
                suggestedPlaces={tournament.suggestedPlaces ?? []}
              />
            </Panel>

            <Panel
              title="Матчи турнира"
              description={`${matches.length} матчей в расписании`}
              action={
                <Link href={`/organizer/matches?tournament=${tournament.id}`} className="link-arrow text-xs">
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
                      <Link href={`/organizer/bracket?tournament=${tournament.id}`} className="btn btn-primary btn-sm">
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
              <div className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[0.66rem] leading-relaxed text-ink-muted">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                {tournament.venue.courts} {tournament.venue.courts === 1 ? "корт" : "корта"} доступно для проведения
              </div>
              <Link href={`/organizer/bracket?tournament=${tournament.id}`} className="btn btn-secondary mt-3 w-full">
                <Network className="size-4" aria-hidden="true" />
                Открыть генератор сеток
              </Link>
            </Panel>

            <TournamentDangerZone
              id={tournament.id}
              slug={tournament.slug}
              title={tournament.title}
              hidden={Boolean(tournament.isHidden)}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
