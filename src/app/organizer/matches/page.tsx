import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDot,
  Network,
  Trophy,
} from "lucide-react";
import { getMatchDeskSelection } from "@/lib/data";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { MatchScoreDesk } from "@/components/organizer/MatchScoreDesk";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { formatDateShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Матчи и счёт" };

const STATUS_ORDER: Record<string, number> = {
  live: 0,
  scheduled: 1,
  registration_closed: 2,
  registration_open: 3,
  registration_soon: 4,
  draft: 5,
  completed: 6,
  cancelled: 7,
};

export default async function OrganizerMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const { tournament: tournamentId } = await searchParams;
  const { tournaments, matches, selected, counts } = await getMatchDeskSelection(tournamentId);

  if (!selected) {
    const ordered = [...tournaments].sort(
      (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
    );
    return (
      <>
        <OrganizerHeader
          eyebrow="Матчи и результаты"
          title="Выберите турнир"
          description="Счёт и расписание ведутся отдельно для каждого турнира. Откройте нужный турнир, чтобы не искать матчи среди всех соревнований."
          actions={
            <Link href="/organizer/tournaments" className="btn btn-secondary btn-sm">
              <Trophy className="size-4" aria-hidden="true" />
              Все турниры
            </Link>
          }
        />

        <div className="px-4 py-7 md:px-8 lg:px-10">
          {ordered.length === 0 ? (
            <div className="border-y border-line px-6 py-16 text-center">
              <p className="font-medium">Турниров пока нет</p>
              <p className="mt-1 text-sm text-ink-muted">
                Создайте турнир, чтобы вести расписание и вносить счёт.
              </p>
              <Link href="/organizer/tournaments/new" className="btn btn-primary btn-sm mt-5">
                Создать турнир
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {ordered.map((item) => {
                const stat = counts.get(item.id) ?? { live: 0, scheduled: 0, completed: 0, total: 0 };
                return (
                  <li key={item.id}>
                    <Link
                      href={`/organizer/matches?tournament=${item.id}`}
                      className="group flex flex-wrap items-center gap-x-5 gap-y-3 py-4 transition-colors hover:bg-surface/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[0.92rem] font-medium text-ink transition-opacity group-hover:opacity-70">
                            {item.title}
                          </span>
                          <StatusPill status={item.status} />
                          {item.isHidden && (
                            <span className="badge badge-warning text-[0.55rem]">Скрыт</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.66rem] text-ink-muted">
                          <span>{formatDateShort(item.startsAt)}</span>
                          <span className="text-ink-faint">·</span>
                          <CategoryBadge category={item.category} withName={false} />
                          <span className="text-ink-faint">·</span>
                          <span>{item.venue.name}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.66rem] text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <CircleDot className={stat.live > 0 ? "size-3 text-negative" : "size-3 text-ink-faint"} aria-hidden="true" />
                          Идут: <span className="tabular-nums text-ink">{stat.live}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3 text-ink-faint" aria-hidden="true" />
                          В расписании: <span className="tabular-nums text-ink">{stat.scheduled}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy className="size-3 text-ink-faint" aria-hidden="true" />
                          Завершены: <span className="tabular-nums text-ink">{stat.completed}</span>
                        </span>
                        <span className="text-ink-faint">Всего: {stat.total}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted transition-colors group-hover:text-ink">
                        Открыть
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </>
    );
  }

  const live = matches.filter((match) => match.status === "live").length;

  return (
    <>
      <OrganizerHeader
        eyebrow="Матчи и результаты · турнир"
        title={selected.title}
        description="Расписание и счёт только этого турнира. Победитель сразу переносится в следующий матч сетки."
        meta={
          <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
            <span
              className={live > 0 ? "size-1.5 animate-pulse bg-negative" : "size-1.5 bg-ink-faint"}
              aria-hidden="true"
            />
            {live} live · {matches.length} матчей
          </span>
        }
        actions={
          <>
            <Link href="/organizer/matches" className="btn btn-secondary btn-sm">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Другой турнир
            </Link>
            <Link href={`/organizer/tournaments/${selected.id}`} className="btn btn-secondary btn-sm">
              Карточка турнира
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link href={`/organizer/bracket?tournament=${selected.id}`} className="btn btn-primary btn-sm">
              <Network className="size-3.5" aria-hidden="true" />
              Сетка
            </Link>
          </>
        }
      />

      <div className="px-4 py-7 md:px-8 lg:px-10">
        <MatchScoreDesk matches={matches} lockTournament />
      </div>
    </>
  );
}
