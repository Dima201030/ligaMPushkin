"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardEdit, Filter, RefreshCw, Search, Zap } from "lucide-react";
import type { Match } from "@/lib/types";
import { playerById } from "@/lib/mock/players";
import { cn, formatDateShort, formatTime } from "@/lib/utils";
import { MatchRow } from "@/components/domain/MatchRow";
import { DemoNote } from "./OrganizerUI";

type Tab = "all" | "live" | "scheduled" | "completed";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "Все матчи" },
  { value: "live", label: "На корте" },
  { value: "scheduled", label: "Запланированы" },
  { value: "completed", label: "С завершённым счётом" },
];

function fullName(playerId: string) {
  const player = playerById.get(playerId);
  return player ? `${player.firstName} ${player.lastName}` : "Соперник";
}

export function MatchScoreDesk({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [tournament, setTournament] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState("");
  const [winner, setWinner] = useState<"1" | "2">("1");
  const [overrides, setOverrides] = useState<Record<string, Partial<Match>>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const tournamentOptions = useMemo(() => {
    const unique = new Map<string, string>();
    matches.forEach((match) => unique.set(match.tournamentId, match.tournamentTitle));
    return Array.from(unique.entries());
  }, [matches]);

  const merged = matches.map((match) => ({ ...match, ...overrides[match.id] }));

  const filtered = merged.filter((match) => {
    const needle = query.trim().toLowerCase();
    const names = [...match.side1.playerIds, ...match.side2.playerIds].map(fullName).join(" ");
    return (
      (tab === "all" || match.status === tab) &&
      (tournament === "all" || match.tournamentId === tournament) &&
      (needle ? `${match.tournamentTitle} ${match.stage} ${names}`.toLowerCase().includes(needle) : true)
    );
  });

  const liveCount = merged.filter((match) => match.status === "live").length;
  const scheduledCount = merged.filter((match) => match.status === "scheduled").length;
  const missing = merged.filter((match) => match.status === "completed" && !match.score).length;

  function openEditor(match: Match) {
    setEditing(match.id);
    setScoreDraft(match.score ?? "");
    setWinner(match.winner === 2 ? "2" : "1");
    setNotice(null);
  }

  function save(match: Match) {
    const score = scoreDraft.trim();
    if (!score) {
      setNotice("Введите счёт матча, например 6:4, 3:6, 10:7.");
      return;
    }
    setOverrides((current) => ({
      ...current,
      [match.id]: { score, winner: Number(winner) as 1 | 2, status: "completed" },
    }));
    setEditing(null);
    setNotice(
      `Счёт «${score}» сохранён для матча ${match.stage}. Победа присуждена ${fullName(
        winner === "1" ? match.side1.playerIds[0] : match.side2.playerIds[0],
      )}.`,
    );
  }

  function markLive(match: Match) {
    setOverrides((current) => ({ ...current, [match.id]: { status: "live" } }));
    setNotice(`Матч ${match.stage} переведён в статус «Идёт». Обновляйте счёт по ходу игры.`);
  }

  return (
    <div className="space-y-7">
      <div className="border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <div className="no-scrollbar flex flex-1 flex-wrap gap-x-5 gap-y-2 overflow-x-auto">
            {TABS.map((item) => {
              const count =
                item.value === "all" ? merged.length : merged.filter((match) => match.status === item.value).length;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={cn(
                    "inline-flex shrink-0 items-baseline gap-1.5 text-[0.64rem] uppercase tracking-[0.12em] transition-colors",
                    tab === item.value
                      ? "text-ink underline decoration-1 underline-offset-[6px]"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {item.label}
                  <span className="text-[0.55rem] tabular-nums text-ink-faint">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative block w-full sm:w-56">
            <span className="sr-only">Поиск матча</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <input
              className="field min-h-[32px] border-0 border-b border-line bg-transparent pl-5 text-xs focus:border-ink"
              placeholder="Турнир, стадия или игрок"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="relative block w-full sm:w-auto">
            <span className="sr-only">Турнир</span>
            <Filter className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
            <select
              className="field min-h-[32px] w-full border-0 border-b border-line bg-transparent pl-5 text-xs focus:border-ink sm:w-48"
              value={tournament}
              onChange={(event) => setTournament(event.target.value)}
            >
              <option value="all">Все турниры</option>
              {tournamentOptions.map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Идут прямо сейчас</p>
            <Zap className="size-3.5 text-negative" aria-hidden="true" />
          </div>
          <p className="display mt-3 text-[2rem] leading-none tabular-nums">{liveCount}</p>
        </div>
        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Запланированы</p>
            <RefreshCw className="size-3.5 text-ink-faint" aria-hidden="true" />
          </div>
          <p className="display mt-3 text-[2rem] leading-none tabular-nums">{scheduledCount}</p>
        </div>
        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Без счёта</p>
            <AlertCircle className="size-3.5 text-warning" aria-hidden="true" />
          </div>
          <p className="display mt-3 text-[2rem] leading-none tabular-nums">{missing}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-y border-line px-6 py-16 text-center">
          <p className="font-medium">Матчи не найдены</p>
          <p className="mt-1 text-sm text-ink-muted">Сбросьте фильтры или сгенерируйте сетку для нового турнира.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((match) => (
            <div key={match.id} className="border-y border-line">
              <div className="flex items-center justify-between gap-3 border-b border-line py-2">
                <div className="flex min-w-0 items-center gap-2 text-[0.64rem] text-ink-muted">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-soft">{match.id.toUpperCase()}</span>
                  <span className="truncate">{match.tournamentTitle}</span>
                  <span className="text-ink-faint">·</span>
                  <span>{formatDateShort(match.scheduledAt)}, {formatTime(match.scheduledAt)}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {match.status === "scheduled" && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-[0.66rem]"
                      onClick={() => markLive(match)}
                    >
                      <Zap className="size-3" aria-hidden="true" />
                      Начать
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-[0.66rem]"
                    onClick={() => (editing === match.id ? setEditing(null) : openEditor(match))}
                  >
                    <ClipboardEdit className="size-3.5" aria-hidden="true" />
                    {editing === match.id ? "Свернуть" : match.score ? "Исправить счёт" : "Внести счёт"}
                  </button>
                </div>
              </div>

              <MatchRow match={match} showTournament={false} />

              {editing === match.id && (
                <div className="border-t border-line bg-canvas-deep/60 px-4 py-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <label className="block">
                      <span className="field-label">Счёт по сетам</span>
                      <input
                        className="field"
                        placeholder="6:4, 3:6, 10:7"
                        value={scoreDraft}
                        onChange={(event) => setScoreDraft(event.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Победитель</span>
                      <select
                        className="field"
                        value={winner}
                        onChange={(event) => setWinner(event.target.value as "1" | "2")}
                      >
                        <option value="1">{match.side1.playerIds.length ? fullName(match.side1.playerIds[0]) : "Сторона 1"}</option>
                        <option value="2">{match.side2.playerIds.length ? fullName(match.side2.playerIds[0]) : "Сторона 2"}</option>
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-primary" onClick={() => save(match)}>
                        Сохранить
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                        Отмена
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[0.64rem] text-ink-muted">
                    Формат счёта: сеты через запятую. Для тай-брейка укажите очки, например 10:7. После сохранения
                    результат попадёт в рейтинг.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {notice && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{notice} Демо-режим: данные не сохраняются.</span>
          </span>
        </DemoNote>
      )}
    </div>
  );
}
