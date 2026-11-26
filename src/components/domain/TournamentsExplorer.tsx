"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CategorySlug, Tournament, TournamentType } from "@/lib/types";
import { CATEGORIES } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { TournamentCard } from "./TournamentCard";
import { TabUnderline } from "@/components/motion/TabUnderline";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { EmptyState } from "@/components/ui/Section";

type TypeFilter = "all" | "singles" | "doubles" | "mixed" | "cups" | "teams";
type View = "current" | "completed";

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

export function TournamentsExplorer({
  tournaments,
  completed = [],
  initialView,
}: {
  tournaments: Tournament[];
  completed?: Tournament[];
  /** Prefer completed when the live calendar is empty or when linked from archive. */
  initialView?: View;
}) {
  const [view, setView] = useState<View>(() => {
    if (initialView === "completed" || initialView === "current") return initialView;
    if (tournaments.length === 0 && completed.length > 0) return "completed";
    return "current";
  });
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 160);
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [openOnly, setOpenOnly] = useState(false);

  const source = view === "completed" ? completed : tournaments;

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return source.filter((tournament) => {
      const matchesQuery = needle ? tournament.title.toLowerCase().includes(needle) : true;
      const matchesCategory = category === "all" || tournament.category === category;
      const matchesOpen = openOnly && view === "current"
        ? tournament.status === "registration_open"
        : true;
      return matchesType(tournament.type, type) && matchesCategory && matchesQuery && matchesOpen;
    });
  }, [source, view, debouncedQuery, type, category, openOnly]);

  const hasActiveFilters = type !== "all" || category !== "all" || Boolean(query) || openOnly;

  return (
    <div>
      <TabUnderline
        className="border-b border-line"
        value={view}
        onChange={(next) => {
          setView(next);
          setOpenOnly(false);
        }}
        items={[
          { value: "current", label: "Актуальные", count: tournaments.length },
          { value: "completed", label: "Завершённые", count: completed.length },
        ]}
      />

      <div className="border-b border-line py-4 md:py-5">
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
          {view === "current" ? (
            <label className="flex cursor-pointer items-center gap-2 pb-3 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted md:pb-3.5">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(event) => setOpenOnly(event.target.checked)}
                className="size-3.5 accent-[var(--color-ink)]"
              />
              Только открытая регистрация
            </label>
          ) : (
            <span className="hidden pb-3 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted md:block md:pb-3.5">
              Результаты и призёры
            </span>
          )}
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
        {hasActiveFilters && (
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

      <div className="stagger-grid mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-reveal>
        {filtered.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title={
            source.length === 0
              ? view === "completed"
                ? "Завершённых турниров пока нет"
                : "Пока нет турниров"
              : "Турниры не найдены"
          }
          description={
            source.length === 0
              ? view === "completed"
                ? "Прошедшие турниры появятся здесь после завершения."
                : "Организатор ещё не опубликовал соревнования. Загляните позже."
              : "Сбросьте фильтры или переключитесь на другой список."
          }
        />
      )}
    </div>
  );
}
