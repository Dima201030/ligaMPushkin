"use client";

import { useMemo, useState } from "react";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MatchRow } from "./MatchRow";

const TABS = [
  { value: "all", label: "Все матчи" },
  { value: "singles", label: "Одиночные" },
  { value: "doubles", label: "Парные" },
] as const;

export function PlayerMatches({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return matches;
    if (tab === "singles") return matches.filter((match) => !match.isDoubles);
    return matches.filter((match) => match.isDoubles);
  }, [matches, tab]);

  return (
    <div className="card-flat overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === item.value
                  ? "bg-accent text-white"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-[0.68rem] font-medium text-ink-muted">{filtered.length} матчей</span>
      </div>

      <div className="divide-y divide-divider">
        {filtered.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="px-6 py-14 text-center">
          <p className="font-bold">Матчей пока нет</p>
          <p className="mt-1 text-sm text-ink-muted">Здесь появится история игрока после первых турниров.</p>
        </div>
      )}
    </div>
  );
}
