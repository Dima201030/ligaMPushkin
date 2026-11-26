"use client";

import { useState } from "react";
import type { Match } from "@/lib/types";
import { MatchRow } from "@/components/domain/MatchRow";
import { cn } from "@/lib/utils";

/** Expandable match history timeline. */
export function MatchTimeline({
  matches,
  initialVisible = 5,
  className,
}: {
  matches: Match[];
  initialVisible?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? matches : matches.slice(0, initialVisible);
  const canExpand = matches.length > initialVisible;

  return (
    <div className={cn("match-timeline", className)}>
      <div className="divide-y divide-divider border-y border-line">
        {visible.map((match, index) => (
          <div
            key={match.id}
            className="match-timeline-item"
            style={{ ["--i" as string]: index }}
          >
            <MatchRow match={match} />
          </div>
        ))}
      </div>
      {canExpand ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm mt-3"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Свернуть историю" : `Показать ещё ${matches.length - initialVisible}`}
        </button>
      ) : null}
    </div>
  );
}
