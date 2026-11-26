"use client";

import type { Match } from "@/lib/types";
import { useTournamentMatchesLive } from "@/lib/live/useTournamentMatchesLive";
import { MatchRow } from "./MatchRow";

export function TournamentMatchBoard({
  slug,
  initialMatches,
}: {
  slug: string;
  initialMatches: Match[];
}) {
  const { matches, mode, updatedAt } = useTournamentMatchesLive(
    { kind: "public", slug },
    { initialMatches, enabled: true },
  );

  const liveHint =
    mode === "sse"
      ? "Онлайн"
      : mode === "poll"
        ? "Автообновление"
        : null;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
        <div className="min-w-0">
          <h2 className="text-lg">Матчи турнира</h2>
          {liveHint ? (
            <p className="mt-1 flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted">
              <span
                className={
                  mode === "sse" || mode === "poll"
                    ? "size-1.5 animate-pulse bg-negative"
                    : "size-1.5 bg-ink-faint"
                }
                aria-hidden="true"
              />
              {liveHint}
              {updatedAt ? (
                <span className="normal-case tracking-normal text-ink-faint">
                  · обновлено {new Date(updatedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
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
  );
}
