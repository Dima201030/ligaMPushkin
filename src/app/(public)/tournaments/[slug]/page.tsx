import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { getTournamentPage } from "@/lib/data";
import { CATEGORY_BY_SLUG, FORMAT_LABEL, STATUS_BY_VALUE, SURFACE_LABEL, TYPE_BY_VALUE } from "@/lib/domain";
import { currentPlayer } from "@/lib/mock/players";
import { cn, formatDateTime, formatMoney, winRate } from "@/lib/utils";
import { CategoryBadge } from "@/components/ui/Badges";
import { MatchRow } from "@/components/domain/MatchRow";
import { RegistrationPanel } from "@/components/domain/RegistrationPanel";
import { Breadcrumbs } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getTournamentPage(slug);
  if (!page) return { title: "Турнир не найден" };
  return {
    title: page.tournament.title,
    description: page.tournament.description.slice(0, 160),
  };
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getTournamentPage(slug);
  if (!page) notFound();

  const { tournament, matches, participants, similar } = page;
  const isPairs = ["doubles", "mixed", "teams"].includes(tournament.type);
  const registered = tournament.participants.some(
    (item) => item.playerId === currentPlayer.id && item.status !== "cancelled",
  );
  const winners = tournament.winners ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-45 cover-image">
          {tournament.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tournament.coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full court-pattern" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50" aria-hidden="true" />
        <div className="page-shell relative py-10 md:py-14">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/45">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span>/</span>
            <Link href="/tournaments" className="hover:text-white">Турниры</Link>
            <span>/</span>
            <span className="text-white/75">{tournament.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge border-white/35 text-white/85">{TYPE_BY_VALUE[tournament.type].label}</span>
            <span className="badge border-white/35 text-white/85">{CATEGORY_BY_SLUG[tournament.category].name}</span>
            <span className="badge border-white/35 text-white/85">{SURFACE_LABEL[tournament.surface]}</span>
            <span className="badge border-white/60 text-white">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {STATUS_BY_VALUE[tournament.status].label}
            </span>
          </div>

          <h1 className="mt-4 max-w-[24ch] text-white">{tournament.title}</h1>

          <div className="mt-6 grid max-w-4xl gap-4 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40">Дата</p>
                <p className="mt-1 font-semibold text-white">{formatDateTime(tournament.startsAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40">Место</p>
                <p className="mt-1 font-semibold text-white">{tournament.venue.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40">Участники</p>
                <p className="mt-1 font-semibold text-white">
                  {participants.filter((item) => item.status !== "cancelled").length} / {tournament.maxParticipants}{" "}
                  {isPairs ? "пар" : "игроков"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden="true" />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40">Формат</p>
                <p className="mt-1 font-semibold text-white">{FORMAT_LABEL[tournament.format]}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell section">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            <section className="card p-5 md:p-7">
              <h2 className="text-xl">О турнире</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{tournament.description}</p>

              <div className="mt-6 grid gap-4 border-t border-divider pt-5 sm:grid-cols-2">
                <div>
                  <p className="stat-label">Категория</p>
                  <p className="mt-1.5 text-sm font-semibold">{CATEGORY_BY_SLUG[tournament.category].name}</p>
                  <p className="mt-1 text-xs text-ink-muted">{CATEGORY_BY_SLUG[tournament.category].note}</p>
                </div>
                <div>
                  <p className="stat-label">Покрытие</p>
                  <p className="mt-1.5 text-sm font-semibold">{SURFACE_LABEL[tournament.surface]}</p>
                  <p className="mt-1 text-xs text-ink-muted">{tournament.venue.courts} кортов на площадке</p>
                </div>
                <div>
                  <p className="stat-label">Взнос</p>
                  <p className="mt-1.5 text-sm font-semibold">{tournament.entryFee ? formatMoney(tournament.entryFee) : "Бесплатно"}</p>
                </div>
                <div>
                  <p className="stat-label">Дедлайн регистрации</p>
                  <p className="mt-1.5 text-sm font-semibold">{formatDateTime(tournament.registrationClosesAt)}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Регламент</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tournament.regulations}</p>
              </div>
            </section>

            {winners.length > 0 && (
              <section className="border-t border-line pt-6">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-ink-muted" aria-hidden="true" />
                  <h2 className="text-lg">Призёры турнира</h2>
                </div>
                <div className="mt-2">
                  {winners.map((winner) => {
                    const placeLabel = winner.place === 1 ? "1 место" : winner.place === 2 ? "2 место" : "3 место";
                    return (
                      <div key={winner.place} className="flex items-center gap-3 border-b border-divider py-3.5 last:border-b-0">
                        <span
                          className={cn(
                            "display w-6 shrink-0 text-[1.4rem] leading-none tabular-nums",
                            winner.place === 1 ? "text-ink" : "text-ink-faint",
                          )}
                        >
                          {winner.place}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{placeLabel}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {winner.playerIds
                              .map((id) => participants.find((item) => item.playerId === id)?.player)
                              .filter(Boolean)
                              .map((player) => `${player!.firstName} ${player!.lastName}`)
                              .join(" / ")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
                <h2 className="text-lg">Матчи турнира</h2>
                <span className="text-xs font-medium text-ink-muted">{matches.length} матчей</span>
              </div>
              {matches.length > 0 ? (
                <div className="divide-y divide-divider">
                  {matches.map((match) => (
                    <MatchRow key={match.id} match={match} showTournament={false} />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="font-bold">Сетка ещё не опубликована</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Матчи появятся после жеребьёвки и публикации расписания организатором.
                  </p>
                </div>
              )}
            </section>

            <section className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
                <h2 className="text-lg">Участники</h2>
                <span className="text-xs font-medium text-ink-muted">
                  {participants.length} {isPairs ? "заявок" : "игроков"}
                </span>
              </div>
              <div className="divide-y divide-divider">
                {participants.map((registration) => {
                  const player = registration.player;
                  if (!player) return null;
                  const partner = registration.partner;
                  return (
                    <div key={`${registration.playerId}-${registration.partnerId ?? ""}`} className="flex items-center gap-3 px-5 py-3 md:px-6">
                      <span className="w-6 text-xs font-bold tabular-nums text-ink-faint">{registration.seed ?? "—"}</span>
                      <Avatar firstName={player.firstName} lastName={player.lastName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/players/${player.slug}`} className="text-sm font-semibold hover:text-accent">
                          {player.firstName} {player.lastName}
                          {partner && <span className="font-normal text-ink-muted"> / {partner.firstName} {partner.lastName}</span>}
                        </Link>
                        <p className="mt-0.5 text-[0.66rem] text-ink-muted">{player.category} · {player.rating}</p>
                      </div>
                      <span
                        className={cn(
                          "badge",
                          registration.status === "confirmed" && "badge-positive",
                          registration.status === "pending" && "badge-warning",
                          registration.status === "waitlist" && "badge-neutral",
                        )}
                      >
                        {registration.status === "confirmed"
                          ? "Подтверждён"
                          : registration.status === "pending"
                            ? "На проверке"
                            : "Лист ожидания"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {participants.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-ink-muted">
                  Заявки появятся после открытия регистрации.
                </div>
              )}
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <RegistrationPanel tournament={tournament} initiallyRegistered={registered} />

            <div className="card p-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Площадка</p>
              <p className="mt-2 text-sm font-semibold">{tournament.venue.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{tournament.venue.address}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-divider pt-4 text-xs">
                <div>
                  <p className="text-ink-faint">Кортов</p>
                  <p className="mt-0.5 font-bold text-ink">{tournament.venue.courts}</p>
                </div>
                <div>
                  <p className="text-ink-faint">Покрытие</p>
                  <p className="mt-0.5 font-bold text-ink">{SURFACE_LABEL[tournament.venue.surface]}</p>
                </div>
              </div>
              <Link href="/contacts" className="link-arrow mt-4">
                Как добраться
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="card p-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Полезно знать</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-soft">
                <li>• Приходите за 20 минут до начала матча.</li>
                <li>• Форма и обувь — по покрытию корта.</li>
                <li>• Мячи предоставляет организатор.</li>
                <li>• Отмена регистрации — до дедлайна.</li>
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-divider pt-4 text-xs text-ink-muted">
                <span>Вопросы</span>
                <a className="font-semibold text-accent" href="tel:+79119691584">+7 (911) 969-15-84</a>
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-xl">Похожие турниры</h2>
              <Link href="/tournaments" className="link-arrow">Все турниры</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {similar.map((item) => (
                <Link key={item.id} href={`/tournaments/${item.slug}`} className="card-flat group p-4">
                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={item.category} />
                    <span className="text-[0.66rem] text-ink-muted">{new Date(item.startsAt).getFullYear()}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold group-hover:text-accent">{item.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{TYPE_BY_VALUE[item.type].label} · {FORMAT_LABEL[item.format]}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
