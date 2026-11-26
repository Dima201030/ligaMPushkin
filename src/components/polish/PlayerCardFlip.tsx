"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge } from "@/components/ui/Badges";
import { cn, winRate } from "@/lib/utils";

/** Face / stats flip card for player grids. */
export function PlayerCardFlip({ player, className }: { player: Player; className?: string }) {
  const [flipped, setFlipped] = useState(false);
  const rate = winRate(player.wins, player.losses);

  return (
    <div className={cn("player-flip", flipped && "player-flip-on", className)}>
      <button
        type="button"
        className="player-flip-inner"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-label={flipped ? "Показать карточку" : "Показать статистику"}
      >
        <div className="player-flip-face">
          <Avatar firstName={player.firstName} lastName={player.lastName} src={player.avatarUrl} size="lg" />
          <p className="mt-3 text-sm font-medium leading-snug">
            {player.firstName} {player.lastName}
          </p>
          <div className="mt-2">
            <CategoryBadge category={player.category} />
          </div>
        </div>
        <div className="player-flip-back" aria-hidden={!flipped}>
          <p className="stat-label">Рейтинг</p>
          <p className="display mt-1 text-2xl tabular-nums">{player.rating}</p>
          <p className="mt-4 text-xs text-ink-muted">
            {player.wins}W · {player.losses}L · {rate}%
          </p>
          <p className="mt-1 text-xs text-ink-muted">{player.tournamentsCount} турниров</p>
          <Link
            href={`/players/${player.slug}`}
            className="btn btn-secondary btn-sm mt-5"
            onClick={(e) => e.stopPropagation()}
          >
            Профиль
          </Link>
        </div>
      </button>
    </div>
  );
}
