"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CategorySlug, Tournament, TournamentType } from "@/lib/types";
import { CATEGORIES } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { TournamentCard } from "./TournamentCard";

type TypeFilter = "all" | "singles" | "doubles" | "mixed" | "cups" | "teams";

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "singles", label: "Одиночные" },
  { value: "doubles", label: "Парные" },
  { value: "mixed", label: "Микст" },
  { value: "cups", label: "Кубки и финалы" },
  { value: "teams", label: "Команды" },
];

function matchesType(type: TournamentType, filter: TypeFilter) {
  if (filter === "all") return true;
  if (filter === "cups") return type === "cup" || type === "final";
  return type === filter;
}

export function TournamentsExplorer({ tournaments }: { tournaments: Tournament[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tournaments.filter((tournament) => {
      const matchesQuery = needle ? tournament.title.toLowerCase().includes(needle) : true;
      const matchesCategory = category === "all" || tournament.category === category;
      const matchesOpen = openOnly ? tournament.status === "registration_open" : true;
      return matchesType(tournament.type, type) && matchesCategory && matchesQuery && matchesOpen;
    });
  }, [tournaments, query, type, category, openOnly]);

  return (
    <div>
      <div className="border-y border-line py-4 md:py-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <label className="relative block">
            <span className="sr-only">Поиск турнира</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              className="field pl-9"
              placeholder="Название турнира"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="field md:min-w-[180px]"
            value={category}
            onChange={(event) => setCategory(event.target.value as CategorySlug | "all")}
            aria-label="Категория"
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 pb-3 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted md:pb-3.5">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(event) => setOpenOnly(event.target.checked)}
              className="size-3.5 accent-[var(--color-ink)]"
            />
            Только открытая регистрация
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {TYPE_TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setType(item.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] transition-colors",
                type === item.value
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-ink-muted hover:border-ink hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Найдено <span className="font-bold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "турнир" : "турниров"}
        </p>
        {(type !== "all" || category !== "all" || query || openOnly) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setType("all");
              setCategory("all");
              setOpenOnly(false);
            }}
            className="rounded-full border border-line px-3.5 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-flat mt-4 px-6 py-16 text-center">
          <p className="text-lg font-bold">Турниры не найдены</p>
          <p className="mt-2 text-sm text-ink-muted">Сбросьте фильтры или посмотрите архив прошедших соревнований.</p>
        </div>
      )}
    </div>
  );
}
