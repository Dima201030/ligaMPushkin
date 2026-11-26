"use client";

import { useEffect, useRef, useState } from "react";
import type { Match } from "@/lib/types";
import { useTournamentMatchesLive } from "@/lib/live/useTournamentMatchesLive";
import { MatchRow } from "./MatchRow";
import { EmptyState } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function TournamentMatchBoard({
  slug,
  clubSlug,
  initialMatches,
}: {
  slug: string;
  clubSlug?: string;
  initialMatches: Match[];
}) {
  const { matches, mode, updatedAt } = useTournamentMatchesLive(
    { kind: "public", slug, clubSlug },
    { initialMatches, enabled: true },
  );
  const [pulse, setPulse] = useState(false);
  const prevUpdated = useRef<number | null>(null);

  useEffect(() => {
    if (!updatedAt) return;
    if (prevUpdated.current && prevUpdated.current !== updatedAt) {
      setPulse(true);
      const id = window.setTimeout(() => setPulse(false), 900);
      return () => window.clearTimeout(id);
    }
    prevUpdated.current = updatedAt;
  }, [updatedAt]);

  const liveHint =
    mode === "sse"
      ? "Онлайн"
      : mode === "poll"
        ? "Автообновление"
        : null;

  return (
    <section className={cn("card overflow-hidden", pulse && "live-board-pulse")}>
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
        <EmptyState
          title="Сетка ещё не опубликована"
          description="Матчи появятся после жеребьёвки и публикации расписания организатором."
        />
      )}
    </section>
  );
}
