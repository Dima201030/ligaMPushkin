"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CategorySlug, Player } from "@/lib/types";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, formatNumber, winRate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryBadge } from "@/components/ui/Badges";

type Sort = "rank" | "rating" | "name" | "winrate" | "tournaments";

export function PlayersExplorer({ rows }: { rows: { player: Player; rank: number }[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [sort, setSort] = useState<Sort>("rank");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = rows.filter(({ player }) => {
      const matchesQuery = needle
        ? `${player.firstName} ${player.lastName}`.toLowerCase().includes(needle)
        : true;
      const matchesCategory = category === "all" || player.category === category;
      return matchesQuery && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "name") return a.player.lastName.localeCompare(b.player.lastName, "ru");
      if (sort === "winrate") {
        return winRate(b.player.wins, b.player.losses) - winRate(a.player.wins, a.player.losses);
      }
      if (sort === "tournaments") return b.player.tournamentsCount - a.player.tournamentsCount;
      if (sort === "rating") return b.player.rating - a.player.rating;
      return a.rank - b.rank;
    });
  }, [rows, query, category, sort]);

  return (
    <div>
      <div className="border-y border-line py-4 md:py-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="relative block">
            <span className="sr-only">Поиск игрока</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              className="field pl-9"
              placeholder="Найти игрока по имени или фамилии"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="sr-only">Сортировка</span>
            <SlidersHorizontal className="size-4 text-ink-faint" aria-hidden="true" />
            <select
              className="field min-w-[190px] appearance-none"
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
            >
              <option value="rank">По месту в рейтинге</option>
              <option value="rating">По рейтингу мастерства</option>
              <option value="winrate">По проценту побед</option>
              <option value="tournaments">По числу турниров</option>
              <option value="name">По фамилии</option>
            </select>
          </label>
          <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted lg:pb-3.5 lg:text-right">
            Найдено: <span className="text-ink">{filtered.length}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] transition-colors",
              category === "all"
                ? "border-ink bg-ink text-canvas"
                : "border-line text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            Все категории
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setCategory(item.slug)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] transition-colors",
                category === item.slug
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card-flat mt-4 hidden overflow-hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Игрок</th>
              <th>Категория</th>
              <th className="text-right">Рейтинг</th>
              <th className="text-right">Очки</th>
              <th className="text-right">Побед / пор.</th>
              <th className="w-36">Процент побед</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ player, rank }) => {
              const rate = winRate(player.wins, player.losses);
              return (
                <tr key={player.id} className="row-link group">
                  <td className="text-xs font-bold tabular-nums text-ink-faint">{rank}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar firstName={player.firstName} lastName={player.lastName} size="sm" />
                      <div className="min-w-0">
                        <Link href={`/players/${player.slug}`} className="font-semibold text-ink group-hover:text-accent">
                          {player.firstName} {player.lastName}
                        </Link>
                        <p className="text-[0.68rem] text-ink-muted">{player.city}</p>
                      </div>
                    </div>
                  </td>
                  <td><CategoryBadge category={player.category} /></td>
                  <td className="text-right font-bold tabular-nums text-navy">{player.rating}</td>
                  <td className="text-right tabular-nums text-ink-soft">{formatNumber(player.points)}</td>
                  <td className="text-right text-xs tabular-nums text-ink-muted">
                    {player.wins} / {player.losses}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-bold tabular-nums text-ink">{rate}%</span>
                    </div>
                  </td>
                  <td className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-bold">Игроки не найдены</p>
            <p className="mt-1 text-sm text-ink-muted">Попробуйте изменить запрос или категорию.</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:hidden">
        {filtered.map(({ player, rank }) => (
          <Link key={player.id} href={`/players/${player.slug}`} className="card-flat flex items-center gap-3 p-3.5">
            <span className="w-5 text-xs font-bold tabular-nums text-ink-faint">{rank}</span>
            <Avatar firstName={player.firstName} lastName={player.lastName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{player.firstName} {player.lastName}</p>
              <p className="mt-0.5 text-[0.68rem] text-ink-muted">
                {CATEGORY_BY_SLUG[player.category].name} · рейтинг {formatNumber(player.rating)}
              </p>
            </div>
            <span className="text-sm font-bold tabular-nums text-accent">{winRate(player.wins, player.losses)}%</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
