import Link from "next/link";
import type { Match } from "@/lib/types";
import { playerById } from "@/lib/mock/players";
import { tournamentById } from "@/lib/mock/tournaments";
import { cn, formatDateShort, formatTime } from "@/lib/utils";
import { MatchStatusPill } from "@/components/ui/Badges";

function sideLabel(side: Match["side1"]) {
  if (!side.playerIds.length) return "Победитель пары матчей";
  const names = side.playerIds.map((id) => {
    const player = playerById.get(id);
    return player ? `${player.lastName} ${player.firstName.charAt(0)}.` : "—";
  });
  return names.join(" / ");
}

function sideFullLabel(side: Match["side1"]) {
  if (!side.playerIds.length) return "Победитель пары матчей";
  return side.playerIds
    .map((id) => {
      const player = playerById.get(id);
      return player ? `${player.firstName} ${player.lastName}` : "—";
    })
    .join(" / ");
}

function Side({
  side,
  winner,
  align = "left",
  full = false,
}: {
  side: Match["side1"];
  winner: boolean;
  align?: "left" | "right";
  full?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", align === "right" && "justify-end text-right")}>
      {align === "right" && side.seed && <Seed seed={side.seed} />}
      <span
        className={cn(
          "truncate text-sm",
          winner ? "font-bold text-ink" : "font-medium text-ink-soft",
          !side.playerIds.length && "italic text-ink-faint",
        )}
      >
        {full ? sideFullLabel(side) : sideLabel(side)}
      </span>
      {align === "left" && side.seed && <Seed seed={side.seed} />}
    </div>
  );
}

function Seed({ seed }: { seed: number }) {
  return (
    <span
      className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-[0.56rem] font-medium tabular-nums text-ink-faint"
      title={`Посев ${seed}`}
    >
      {seed}
    </span>
  );
}

export function MatchRow({ match, showTournament = true }: { match: Match; showTournament?: boolean }) {
  const date = new Date(match.scheduledAt);

  return (
    <div className="px-4 py-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.7rem] font-medium text-ink-muted">
          {showTournament ? (
            <>
              <Link
                href={`/tournaments/${tournamentById.get(match.tournamentId)?.slug ?? match.tournamentId}`}
                className="font-semibold text-ink-soft transition-colors hover:text-accent"
              >
                {match.tournamentTitle}
              </Link>
              <span className="text-ink-faint">·</span>
            </>
          ) : null}
          <span>{match.stage}</span>
          <span className="text-ink-faint">·</span>
          <span>
            {formatDateShort(date)}, {formatTime(date)}
          </span>
          {match.court && (
            <>
              <span className="text-ink-faint">·</span>
              <span>{match.court}</span>
            </>
          )}
        </div>
        <MatchStatusPill status={match.status} className="shrink-0" />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Side side={match.side1} winner={match.winner === 1} />
        <div className="min-w-[78px] text-center">
          {match.score ? (
            <span
              className={cn(
                "inline-block text-[0.82rem] font-medium tabular-nums tracking-tight",
                match.status === "live" ? "text-negative" : "text-ink",
              )}
            >
              {match.score}
            </span>
          ) : (
            <span className="text-[0.72rem] font-medium text-ink-faint">
              {match.status === "cancelled" ? "—" : formatTime(date)}
            </span>
          )}
        </div>
        <Side side={match.side2} winner={match.winner === 2} align="right" />
      </div>
    </div>
  );
}

export function MatchCompact({ match }: { match: Match }) {
  return (
    <div className="border-b border-divider px-4 py-3.5 last:border-b-0">
      <div className="flex items-center justify-between gap-3 text-[0.68rem] font-medium text-ink-muted">
        <span className="truncate">{match.tournamentTitle}</span>
        <span className="shrink-0">{formatDateShort(match.scheduledAt)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-1.5">
          <div className={cn("truncate text-[0.82rem]", match.winner === 1 ? "font-bold" : "text-ink-soft")}>
            {sideLabel(match.side1)}
          </div>
          <div className={cn("truncate text-[0.82rem]", match.winner === 2 ? "font-bold" : "text-ink-soft")}>
            {sideLabel(match.side2)}
          </div>
        </div>
        <div className="shrink-0 text-right text-[0.78rem] font-medium tabular-nums leading-relaxed text-ink-soft">
          {match.score ? (
            match.score.split(", ").map((set, index) => <div key={index}>{set}</div>)
          ) : (
            <span className="text-ink-faint">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
