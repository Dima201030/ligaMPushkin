import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { tournamentPath } from "@/lib/club/tenant";
import { CATEGORY_BY_SLUG, STATUS_BY_VALUE, TYPE_BY_VALUE } from "@/lib/domain";
import { cn, formatMoney, weekday } from "@/lib/utils";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function isPairs(type: Tournament["type"]) {
  return ["doubles", "mixed", "teams"].includes(type);
}

export function TournamentCard({
  tournament,
  className,
}: {
  tournament: Tournament;
  className?: string;
  compact?: boolean;
}) {
  const startsAt = new Date(tournament.startsAt);
  const filled = tournament.participants.filter((item) => item.status !== "cancelled").length;
  const category = CATEGORY_BY_SLUG[tournament.category];
  const isCompleted = tournament.status === "completed";
  const winners = tournament.winners?.filter((item) => item.place === 1);

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link href={tournamentPath(tournament.clubSlug, tournament.slug)} className="flex h-full flex-col">
        <div className="cover-image relative aspect-[4/3] shrink-0">
          {tournament.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tournament.coverUrl} alt="" loading="lazy" />
          ) : (
            <div className="size-full court-pattern-static" aria-hidden="true" />
          )}
          <span className="absolute left-0 top-0 bg-canvas px-2.5 py-1.5 text-[0.54rem] uppercase tracking-[0.14em] text-ink">
            {STATUS_BY_VALUE[tournament.status].label}
          </span>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <div className="flex items-baseline justify-between gap-3 text-[0.56rem] uppercase tracking-[0.14em] text-ink-muted">
            <span>
              {String(startsAt.getDate()).padStart(2, "0")} {MONTHS_GENITIVE[startsAt.getMonth()]} ·{" "}
              {weekday(startsAt)}
            </span>
            <span>{tournament.clubName ?? category.name}</span>
          </div>

          <h3 className="mt-2.5 text-[1.02rem] font-medium leading-snug transition-opacity group-hover:opacity-60">
            {tournament.title}
          </h3>

          {isCompleted && winners?.length ? (
            <p className="mt-2 text-xs leading-relaxed text-positive">
              Победитель: {winners[0].playerIds.length > 1 ? "пара" : "игрок"} турнира
            </p>
          ) : null}

          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between gap-3 border-t border-line pt-3 text-[0.66rem] text-ink-muted">
              <span>
                {TYPE_BY_VALUE[tournament.type].label} · {filled} / {tournament.maxParticipants}{" "}
                {isPairs(tournament.type) ? "пар" : "игроков"}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink">
                {isCompleted
                  ? "Результаты"
                  : tournament.entryFee
                    ? formatMoney(tournament.entryFee)
                    : "Бесплатно"}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function TournamentRow({ tournament }: { tournament: Tournament }) {
  const startsAt = new Date(tournament.startsAt);
  return (
    <Link
      href={tournamentPath(tournament.clubSlug, tournament.slug)}
      className="group flex items-center gap-4 border-b border-line px-1 py-4 transition-colors last:border-b-0 hover:bg-white/40"
    >
      <div className="w-12 shrink-0 py-1 text-center">
        <div className="display text-[1.35rem] leading-none">
          {String(startsAt.getDate()).padStart(2, "0")}
        </div>
        <div className="mt-1.5 text-[0.54rem] uppercase tracking-[0.14em] text-ink-muted">
          {MONTHS_GENITIVE[startsAt.getMonth()].slice(0, 3)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink transition-opacity group-hover:opacity-60">
          {tournament.title}
        </p>
        <p className="mt-0.5 truncate text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
          {tournament.clubName ? `${tournament.clubName} · ` : ""}
          {TYPE_BY_VALUE[tournament.type].label} · {CATEGORY_BY_SLUG[tournament.category].name}
        </p>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-ink" aria-hidden="true" />
    </Link>
  );
}
