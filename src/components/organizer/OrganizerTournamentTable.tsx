"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { CATEGORIES, FORMAT_LABEL, STATUS_BY_VALUE, TYPE_BY_VALUE } from "@/lib/domain";
import { cn, formatDateShort, formatMoney } from "@/lib/utils";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/Section";

type Filter = "all" | "live" | "registration" | "upcoming" | "completed" | "draft";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "live", label: "Идут" },
  { value: "registration", label: "Регистрация" },
  { value: "upcoming", label: "Скоро" },
  { value: "completed", label: "Завершены" },
  { value: "draft", label: "Черновики" },
];

function matchesFilter(tournament: Tournament, filter: Filter) {
  switch (filter) {
    case "live":
      return tournament.status === "live";
    case "registration":
      return tournament.status === "registration_open" || tournament.status === "registration_soon";
    case "upcoming":
      return tournament.status === "scheduled" || tournament.status === "registration_closed";
    case "completed":
      return tournament.status === "completed";
    case "draft":
      return tournament.status === "draft";
    default:
      return true;
  }
}

export function OrganizerTournamentTable({ tournaments }: { tournaments: Tournament[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tournaments.filter((tournament) => {
      return (
        matchesFilter(tournament, filter) &&
        (category === "all" || tournament.category === category) &&
        (needle
          ? `${tournament.title} ${tournament.slug} ${tournament.description}`.toLowerCase().includes(needle)
          : true)
      );
    });
  }, [tournaments, filter, category, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {FILTERS.map((item) => {
            const count = tournaments.filter((tournament) => matchesFilter(tournament, item.value)).length;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "inline-flex items-baseline gap-1.5 text-sm uppercase tracking-[0.12em] transition-colors",
                  filter === item.value
                    ? "text-ink underline decoration-1 underline-offset-[6px]"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
                <span className="text-[0.78rem] tabular-nums text-ink-faint">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
          <label className="relative block flex-1 sm:w-56">
            <span className="sr-only">Поиск турнира</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              className="field min-h-11 border-0 border-b border-line bg-transparent pl-6 text-sm focus:border-ink"
              placeholder="Название или slug"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="field min-h-11 w-auto border-0 border-b border-line bg-transparent text-sm focus:border-ink"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Категория"
          >
            <option value="all">Все категории</option>
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm uppercase tracking-[0.14em] text-ink-muted">
        {filtered.length} из {tournaments.length} турниров
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title={tournaments.length === 0 ? "Пока нет турниров" : "Турниров не найдено"}
          description={
            tournaments.length === 0
              ? "Создайте первый турнир сезона — он появится в публичном календаре после публикации."
              : "Измените фильтр или создайте новый турнир сезона."
          }
        />
      ) : (
        <div className="overflow-x-auto border-y border-line">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>Турнир</th>
                <th>Статус</th>
                <th>Даты</th>
                <th>Участники</th>
                <th>Формат</th>
                <th className="text-right">Взнос</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tournament) => {
                const confirmed = tournament.participants.filter((item) => item.status === "confirmed").length;
                const pending = tournament.participants.filter((item) => item.status === "pending").length;
                const fill = Math.min(
                  100,
                  Math.round((tournament.participants.length / tournament.maxParticipants) * 100),
                );
                return (
                  <tr key={tournament.id}>
                    <td className="min-w-[240px]">
                      <Link
                        href={`/organizer/tournaments/${tournament.id}`}
                        className="font-medium text-ink transition-opacity hover:opacity-60"
                      >
                        {tournament.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <CategoryBadge category={tournament.category} withName={false} />
                        <span className="text-sm text-ink-muted">{TYPE_BY_VALUE[tournament.type].label}</span>
                        <span className="text-sm text-ink-faint">· {tournament.slug}</span>
                      </div>
                    </td>
                    <td>
                      <StatusPill status={tournament.status} />
                    </td>
                    <td className="whitespace-nowrap text-sm text-ink-soft">
                      {formatDateShort(tournament.startsAt)}
                      {tournament.endsAt && (
                        <span className="block text-sm text-ink-faint">
                          до {formatDateShort(tournament.endsAt)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-px w-16 bg-line">
                          <div
                            className={cn("h-px", fill >= 100 ? "bg-warning" : "bg-ink")}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-ink-soft">
                          {confirmed}/{tournament.maxParticipants}
                        </span>
                        {pending > 0 && (
                          <span className="badge badge-warning text-[0.78rem]">+{pending}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-sm text-ink-soft">
                      {FORMAT_LABEL[tournament.format]}
                    </td>
                    <td className="whitespace-nowrap text-right text-sm tabular-nums text-ink-soft">
                      {tournament.entryFee ? formatMoney(tournament.entryFee) : "—"}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/organizer/tournaments/${tournament.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Управлять
                        </Link>
                        <Link
                          href={`/tournaments/${tournament.slug}`}
                          className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
                          title="Открыть публичную страницу"
                          aria-label={`Публичная страница ${tournament.title}`}
                        >
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-ink-faint">
        Статусы: {["draft", "registration_open", "registration_closed", "scheduled", "live", "completed"].map((status) => STATUS_BY_VALUE[status as keyof typeof STATUS_BY_VALUE].label).join(" · ")}
      </p>
    </div>
  );
}
