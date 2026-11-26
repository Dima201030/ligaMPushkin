"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { formatTournamentCreatorLabel } from "@/lib/api/tournaments";
import { CATEGORIES, FORMAT_LABEL, STATUS_BY_VALUE, TYPE_BY_VALUE } from "@/lib/domain";
import { cn, formatDateShort, formatMoney } from "@/lib/utils";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/Section";
import { TournamentRowActions } from "./TournamentRowActions";

type Filter = "all" | "live" | "registration" | "upcoming" | "completed" | "draft" | "hidden";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "live", label: "Идут" },
  { value: "registration", label: "Регистрация" },
  { value: "upcoming", label: "Скоро" },
  { value: "completed", label: "Завершены" },
  { value: "draft", label: "Черновики" },
  { value: "hidden", label: "Скрытые" },
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
    case "hidden":
      return Boolean(tournament.isHidden);
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
          ? `${tournament.title} ${tournament.slug} ${tournament.description.slice(0, 240)} ${formatTournamentCreatorLabel(tournament.createdBy)}`
              .toLowerCase()
              .includes(needle)
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
                  "inline-flex items-baseline gap-1.5 text-[0.68rem] uppercase tracking-[0.12em] transition-colors",
                  filter === item.value
                    ? "text-ink underline decoration-1 underline-offset-[6px]"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
                <span className="text-[0.58rem] tabular-nums text-ink-faint">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
          <label className="relative block flex-1 sm:w-56">
            <span className="sr-only">Поиск турнира</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              className="field min-h-[34px] border-0 border-b border-line bg-transparent pl-6 text-xs focus:border-ink"
              placeholder="Название или slug"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="field min-h-[34px] w-auto border-0 border-b border-line bg-transparent text-xs focus:border-ink"
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

      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
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
          <table className="data-table min-w-[1040px]">
            <thead>
              <tr>
                <th>Турнир</th>
                <th>Создатель</th>
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
                const creatorLabel = formatTournamentCreatorLabel(tournament.createdBy);
                return (
                  <tr key={tournament.id} className="row-link group">
                    <td className="min-w-[240px]">
                      <Link
                        href={`/organizer/tournaments/${tournament.id}`}
                        className="row-link-primary font-medium text-ink transition-opacity hover:opacity-60"
                      >
                        {tournament.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <CategoryBadge category={tournament.category} withName={false} />
                        <span className="text-[0.64rem] text-ink-muted">{TYPE_BY_VALUE[tournament.type].label}</span>
                        {tournament.clubName || tournament.clubSlug ? (
                          <span className="text-[0.64rem] text-ink-soft">
                            · {tournament.clubName || tournament.clubSlug}
                          </span>
                        ) : null}
                        <span className="text-[0.64rem] text-ink-faint">· {tournament.slug}</span>
                      </div>
                    </td>
                    <td className="min-w-[160px] text-[0.7rem] text-ink-soft">
                      {creatorLabel || "—"}
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusPill status={tournament.status} />
                        {tournament.isHidden && (
                          <span className="badge badge-warning text-[0.55rem]">Скрыт</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[0.72rem] text-ink-soft">
                      {formatDateShort(tournament.startsAt)}
                      {tournament.endsAt && (
                        <span className="block text-[0.64rem] text-ink-faint">
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
                        <span className="text-[0.68rem] tabular-nums text-ink-soft">
                          {confirmed}/{tournament.maxParticipants}
                        </span>
                        {pending > 0 && (
                          <span className="badge badge-warning text-[0.55rem]">+{pending}</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[0.7rem] text-ink-soft">
                      {FORMAT_LABEL[tournament.format]}
                    </td>
                    <td className="whitespace-nowrap text-right text-[0.72rem] tabular-nums text-ink-soft">
                      {tournament.entryFee ? formatMoney(tournament.entryFee) : "—"}
                    </td>
                    <td className="row-link-actions">
                      <TournamentRowActions
                        id={tournament.id}
                        slug={tournament.slug}
                        title={tournament.title}
                        hidden={Boolean(tournament.isHidden)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[0.64rem] text-ink-faint">
        Статусы: {["draft", "registration_open", "registration_closed", "scheduled", "live", "completed"].map((status) => STATUS_BY_VALUE[status as keyof typeof STATUS_BY_VALUE].label).join(" · ")}
      </p>
    </div>
  );
}
