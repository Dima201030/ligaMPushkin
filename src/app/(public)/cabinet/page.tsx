import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Trophy,
} from "lucide-react";
import { getCabinetData } from "@/lib/data";
import { isOrganizerRole } from "@/lib/api/auth";
import { CATEGORY_BY_SLUG } from "@/lib/domain";
import { formatDate, formatNumber, winRate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge } from "@/components/ui/Badges";
import { MatchRow } from "@/components/domain/MatchRow";
import {
  MyRegistrations,
  NotificationSettings,
  RatingHistoryTable,
} from "@/components/domain/CabinetPanels";
import { PageHeader } from "@/components/ui/Section";

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
  const data = await getCabinetData();
  if (!data.session) {
    redirect("/login?next=/cabinet");
  }
  if (isOrganizerRole(data.session.user.role)) {
    // Organizers can still open cabinet, but also get a shortcut.
  }

  const { player, registrations, matches, upcoming, ranking, history, session } = data;
  if (!player) {
    return (
      <>
        <PageHeader
          eyebrow="Кабинет"
          title={`${session.user.firstName} ${session.user.lastName}`}
          description="Профиль игрока ещё не создан. Обратитесь к организатору."
          compact
        />
      </>
    );
  }

  const category = CATEGORY_BY_SLUG[player.category];
  const rate = winRate(player.wins, player.losses);
  const results = matches.filter((match) => match.status === "completed" || match.status === "walkover").slice(0, 4);
  const cabinetRegs = registrations.map((item) => ({
    id: item.id,
    slug: item.tournamentSlug,
    title: item.tournamentTitle,
    startsAt: item.tournamentStartsAt,
    status: item.status,
    partner: item.partnerName,
    fee: item.tournamentEntryFee,
  }));

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
                {session.user.status === "approved" ? "Профиль подтверждён" : session.user.status}
              </span>
              {isOrganizerRole(session.user.role) ? (
                <Link href="/organizer" className="text-sky hover:text-white">
                  Кабинет организатора
                </Link>
              ) : (
                <span className="hidden sm:inline">Игрок лиги</span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar firstName={player.firstName} lastName={player.lastName} size="hero" tone="navy" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(2.4rem,4.4vw,4.2rem)] leading-[1.04] text-white">
                {player.firstName} {player.lastName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CategoryBadge category={player.category} />
                {player.city ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {player.city}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 max-w-[48ch] text-sm text-white/60">
                {player.bio || category?.note || "Профиль игрока лиги Mr. Pushkin."}
              </p>
            </div>
            <div className="flex gap-8 border-t border-white/15 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <div>
                <p className="display text-[2rem] leading-none text-white">{player.rating}</p>
                <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-white/45">рейтинг</p>
              </div>
              <div>
                <p className="display text-[2rem] leading-none text-white">{formatNumber(player.points)}</p>
                <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-white/45">очков</p>
              </div>
              <div>
                <p className="display text-[2rem] leading-none text-white">
                  {ranking?.position ? String(ranking.position).padStart(2, "0") : "—"}
                </p>
                <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-white/45">место</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5" aria-label="Разделы кабинета">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.62rem] uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="page-shell section space-y-12">
        <section id="overview" className="scroll-mt-24 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl">Ближайшие матчи</h2>
            {upcoming.length === 0 ? (
              <p className="mt-4 border-y border-line py-8 text-sm text-ink-muted">Запланированных матчей нет.</p>
            ) : (
              <div className="mt-4 divide-y divide-line border-y border-line">
                {upcoming.slice(0, 4).map((match) => (
                  <MatchRow key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 self-start">
            <div className="border-t border-line pt-4">
              <p className="display text-[1.8rem] leading-none">{player.wins}</p>
              <p className="stat-label mt-2">побед</p>
            </div>
            <div className="border-t border-line pt-4">
              <p className="display text-[1.8rem] leading-none">{player.losses}</p>
              <p className="stat-label mt-2">поражений</p>
            </div>
            <div className="border-t border-line pt-4">
              <p className="display text-[1.8rem] leading-none">{rate}%</p>
              <p className="stat-label mt-2">винрейт</p>
            </div>
            <div className="border-t border-line pt-4">
              <p className="display text-[1.8rem] leading-none">{cabinetRegs.length}</p>
              <p className="stat-label mt-2">заявок</p>
            </div>
          </div>
        </section>

        <section id="registrations" className="scroll-mt-24">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl">Мои заявки</h2>
              <p className="mt-1 text-sm text-ink-muted">Активные регистрации на турниры лиги.</p>
            </div>
            <Link href="/tournaments" className="link-arrow text-xs">К турнирам</Link>
          </div>
          {cabinetRegs.length === 0 ? (
            <p className="border-y border-line py-10 text-sm text-ink-muted">Заявок пока нет.</p>
          ) : (
            <div className="border-y border-line">
              <MyRegistrations items={cabinetRegs} />
            </div>
          )}
        </section>

        <section id="matches" className="scroll-mt-24">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="size-4 text-ink-muted" aria-hidden="true" />
            <h2 className="text-xl">Недавние результаты</h2>
          </div>
          {results.length === 0 ? (
            <p className="border-y border-line py-10 text-sm text-ink-muted">Сыгранных матчей пока нет.</p>
          ) : (
            <div className="divide-y divide-line border-y border-line">
              {results.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        <section id="rating" className="scroll-mt-24 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="size-4 text-ink-muted" aria-hidden="true" />
              <h2 className="text-xl">История рейтинга</h2>
            </div>
            {history.length === 0 ? (
              <p className="border-y border-line py-10 text-sm text-ink-muted">История начислений пуста.</p>
            ) : (
              <div className="border-y border-line">
                <RatingHistoryTable rows={history} />
              </div>
            )}
          </div>
          <div className="bg-navy p-6 text-white md:p-8">
            <Award className="size-5 text-sky" aria-hidden="true" />
            <p className="mt-4 text-[0.6rem] uppercase tracking-[0.16em] text-sky">Сезон 2026</p>
            <p className="display mt-3 text-[1.5rem] leading-snug">
              {ranking?.position
                ? `Сейчас ${ranking.position}-е место в общем зачёте`
                : "Место в рейтинге появится после первого турнира"}
            </p>
            <p className="mt-3 text-sm text-white/60">
              Обновлено {history[0] ? formatDate(history[0].date) : "после последнего матча"}.
            </p>
            <Link href="/rating" className="btn btn-on-dark mt-6">
              Открыть рейтинг
            </Link>
          </div>
        </section>

        <section id="settings" className="scroll-mt-24 grid gap-8 border-t border-line pt-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl">Контакты аккаунта</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-ink-muted">Email</dt>
                <dd>{session.user.email}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-ink-muted">Телефон</dt>
                <dd>{session.user.phone || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-ink-muted">Категория</dt>
                <dd>{category?.name ?? player.category}</dd>
              </div>
            </dl>
          </div>
          <NotificationSettings />
        </section>
      </div>
    </>
  );
}
