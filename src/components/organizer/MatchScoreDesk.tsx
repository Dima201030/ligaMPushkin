"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardEdit,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import type { Match } from "@/lib/types";
import { cn, formatDateShort, formatTime } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import {
  disqualifyMatch,
  parseScoreDraft,
  retireMatch,
  submitScore,
  updateSchedule,
  walkover,
  withFreshMatchVersion,
} from "@/lib/api/matches";
import { MatchRow } from "@/components/domain/MatchRow";
import { DemoNote } from "./OrganizerUI";

type Tab = "all" | "live" | "scheduled" | "completed";
type SetRow = { a: string; b: string };
type BestOf = 1 | 3;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "Все матчи" },
  { value: "live", label: "На корте" },
  { value: "scheduled", label: "Запланированы" },
  { value: "completed", label: "С завершённым счётом" },
];

const EMPTY_SET: SetRow = { a: "", b: "" };

function sideName(side: Match["side1"], fallback: string) {
  if (side.label) return side.label;
  if (side.playerIds[0]) return side.playerIds[0].slice(0, 8);
  return fallback;
}

function scoreTextToRows(score: string | undefined, bestOf: BestOf): SetRow[] {
  if (!score?.trim()) {
    return bestOf === 1 ? [{ ...EMPTY_SET }] : [{ ...EMPTY_SET }, { ...EMPTY_SET }];
  }
  const parsed = parseScoreDraft(score);
  if (!parsed?.length) {
    return bestOf === 1 ? [{ ...EMPTY_SET }] : [{ ...EMPTY_SET }, { ...EMPTY_SET }];
  }
  return parsed.map(([a, b]) => ({ a: String(a), b: String(b) }));
}

function rowsToSets(rows: SetRow[]): number[][] | null {
  const filled = rows.filter((row) => row.a.trim() !== "" || row.b.trim() !== "");
  if (!filled.length) return null;
  const sets: number[][] = [];
  for (const row of filled) {
    if (!/^\d+$/.test(row.a.trim()) || !/^\d+$/.test(row.b.trim())) return null;
    sets.push([Number(row.a), Number(row.b)]);
  }
  return sets;
}

function setsToDraft(sets: number[][]): string {
  return sets.map(([a, b]) => `${a}:${b}`).join(", ");
}

function inferWinnerFromSets(sets: number[][]): "1" | "2" | null {
  let s1 = 0;
  let s2 = 0;
  for (const [a, b] of sets) {
    if (a === b) continue;
    if (a > b) s1 += 1;
    else s2 += 1;
  }
  if (s1 === s2) return null;
  return s1 > s2 ? "1" : "2";
}

function detectBestOf(score?: string): BestOf {
  const parsed = score ? parseScoreDraft(score) : null;
  if (parsed?.length === 1) return 1;
  return 3;
}

export function MatchScoreDesk({ matches }: { matches: Match[] }) {
  const [items, setItems] = useState(matches);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [tournament, setTournament] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [bestOf, setBestOf] = useState<BestOf>(3);
  const [setRows, setSetRows] = useState<SetRow[]>([{ ...EMPTY_SET }, { ...EMPTY_SET }]);
  const [winner, setWinner] = useState<"1" | "2">("1");
  const [winnerManual, setWinnerManual] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setItems(matches);
  }, [matches]);

  const tournamentOptions = useMemo(() => {
    const unique = new Map<string, string>();
    items.forEach((match) => unique.set(match.tournamentId, match.tournamentTitle));
    return Array.from(unique.entries());
  }, [items]);

  const filtered = items.filter((match) => {
    const needle = query.trim().toLowerCase();
    const names = [match.side1.label, match.side2.label, ...match.side1.playerIds, ...match.side2.playerIds]
      .filter(Boolean)
      .join(" ");
    const isCompleted = match.status === "completed" || match.status === "walkover";
    return (
      (tab === "all" ||
        (tab === "completed" ? isCompleted : match.status === tab)) &&
      (tournament === "all" || match.tournamentId === tournament) &&
      (needle ? `${match.tournamentTitle} ${match.stage} ${names}`.toLowerCase().includes(needle) : true)
    );
  });

  const liveCount = items.filter((match) => match.status === "live").length;
  const scheduledCount = items.filter((match) => match.status === "scheduled").length;
  const missing = items.filter((match) => match.status === "completed" && !match.score).length;

  const previewSets = rowsToSets(setRows);
  const previewScore = previewSets ? setsToDraft(previewSets) : null;

  function replaceMatch(next: Match) {
    setItems((current) => current.map((item) => (item.id === next.id ? next : item)));
  }

  function openEditor(match: Match) {
    const mode = detectBestOf(match.score);
    const rows = scoreTextToRows(match.score, mode);
    const sets = rowsToSets(rows);
    const inferred = sets ? inferWinnerFromSets(sets) : null;
    setEditing(match.id);
    setBestOf(mode);
    setSetRows(rows);
    setWinner(inferred ?? (match.winner === 2 ? "2" : "1"));
    setWinnerManual(false);
    setSpecialOpen(false);
    setNotice(null);
    setError(null);
  }

  function changeBestOf(mode: BestOf) {
    setBestOf(mode);
    setSetRows((current) => {
      if (mode === 1) {
        return current.length ? [current[0]] : [{ ...EMPTY_SET }];
      }
      if (current.length >= 2) return current;
      return [...current, { ...EMPTY_SET }];
    });
  }

  function updateSetCell(index: number, side: "a" | "b", value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    const next = setRows.map((row, i) => (i === index ? { ...row, [side]: digits } : row));
    setSetRows(next);
    if (!winnerManual) {
      const sets = rowsToSets(next);
      const inferred = sets ? inferWinnerFromSets(sets) : null;
      if (inferred) setWinner(inferred);
    }
  }

  function chooseWinner(side: "1" | "2") {
    setWinner(side);
    setWinnerManual(true);
  }

  async function save(match: Match) {
    const sets = rowsToSets(setRows);
    if (!sets) {
      setError(
        bestOf === 1
          ? "Введите геймы одного сета: два числа (например 6 и 4)."
          : "Заполните геймы по сетам: в каждой строке два числа (например 6 и 4).",
      );
      setNotice(null);
      return;
    }
    if (bestOf === 1 && sets.length !== 1) {
      setError("Для формата «один сет» нужен ровно один сет.");
      return;
    }
    if (bestOf === 3 && sets.length === 1) {
      setError("В формате «до двух побед» одного сета мало — переключите на «один сет» или добавьте сеты.");
      return;
    }
    setBusyId(match.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await withFreshMatchVersion(match.id, match.version, (fresh) => {
        if (fresh.version === undefined) {
          throw new ApiError(409, "conflict", "Не удалось определить версию матча. Обновите страницу.");
        }
        replaceMatch(fresh);
        return submitScore(fresh.id, { sets, version: fresh.version });
      });
      replaceMatch(updated);
      setEditing(null);
      setNotice(
        `Счёт «${updated.score ?? setsToDraft(sets)}» сохранён. Победа: ${sideName(
          updated.winner === 2 ? updated.side2 : updated.side1,
          updated.winner === 2 ? "сторона 2" : "сторона 1",
        )}.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить счёт");
    } finally {
      setBusyId(null);
    }
  }

  async function awardWalkover(match: Match) {
    setBusyId(match.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await withFreshMatchVersion(match.id, match.version, (fresh) => {
        if (fresh.version === undefined) {
          throw new ApiError(409, "conflict", "Не удалось определить версию матча. Обновите страницу.");
        }
        replaceMatch(fresh);
        return walkover(fresh.id, {
          winnerSide: Number(winner) as 1 | 2,
          version: fresh.version,
        });
      });
      replaceMatch(updated);
      setEditing(null);
      setNotice(
        `Техническая победа присуждена: ${sideName(
          winner === "1" ? match.side1 : match.side2,
          winner === "1" ? "сторона 1" : "сторона 2",
        )}.`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зафиксировать тех. победу");
    } finally {
      setBusyId(null);
    }
  }

  async function awardRetire(match: Match) {
    const sets = rowsToSets(setRows) ?? undefined;
    const hasPartial = setRows.some((row) => row.a.trim() !== "" || row.b.trim() !== "");
    if (hasPartial && !sets) {
      setError("Некорректный частичный счёт для отказа. Заполните оба числа в каждом начатом сете.");
      return;
    }
    setBusyId(match.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await withFreshMatchVersion(match.id, match.version, (fresh) => {
        if (fresh.version === undefined) {
          throw new ApiError(409, "conflict", "Не удалось определить версию матча. Обновите страницу.");
        }
        replaceMatch(fresh);
        return retireMatch(fresh.id, {
          winnerSide: Number(winner) as 1 | 2,
          sets,
          version: fresh.version,
        });
      });
      replaceMatch(updated);
      setEditing(null);
      setNotice("Отказ зафиксирован. Победа присуждена выбранной стороне.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зафиксировать отказ");
    } finally {
      setBusyId(null);
    }
  }

  async function awardDq(match: Match) {
    setBusyId(match.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await withFreshMatchVersion(match.id, match.version, (fresh) => {
        if (fresh.version === undefined) {
          throw new ApiError(409, "conflict", "Не удалось определить версию матча. Обновите страницу.");
        }
        replaceMatch(fresh);
        return disqualifyMatch(fresh.id, {
          winnerSide: Number(winner) as 1 | 2,
          version: fresh.version,
        });
      });
      replaceMatch(updated);
      setEditing(null);
      setNotice("Дисквалификация зафиксирована.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось дисквалифицировать");
    } finally {
      setBusyId(null);
    }
  }

  async function markLive(match: Match) {
    setBusyId(match.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateSchedule(match.id, { markLive: true });
      replaceMatch(updated);
      setNotice(`Матч ${match.stage} переведён в статус «Идёт».`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось начать матч");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-7">
      <div className="border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <div className="no-scrollbar flex flex-1 flex-wrap gap-x-5 gap-y-2 overflow-x-auto">
            {TABS.map((item) => {
              const count =
                item.value === "all"
                  ? items.length
                  : item.value === "completed"
                    ? items.filter((match) => match.status === "completed" || match.status === "walkover").length
                    : items.filter((match) => match.status === item.value).length;
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
          {filtered.map((match) => {
            const left = sideName(match.side1, "Сторона 1");
            const right = sideName(match.side2, "Сторона 2");
            const isEditing = editing === match.id;
            const busy = busyId === match.id;

            return (
              <div key={match.id} className="border-y border-line">
                <div className="flex items-center justify-between gap-3 border-b border-line py-2">
                  <div className="flex min-w-0 items-center gap-2 text-[0.64rem] text-ink-muted">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink-soft">{match.id.slice(0, 8).toUpperCase()}</span>
                    <span className="truncate">{match.tournamentTitle}</span>
                    <span className="text-ink-faint">·</span>
                    <span>{formatDateShort(match.scheduledAt)}, {formatTime(match.scheduledAt)}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {match.status === "scheduled" && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-[0.66rem]"
                        disabled={busy}
                        onClick={() => markLive(match)}
                      >
                        <Zap className="size-3" aria-hidden="true" />
                        Начать
                      </button>
                    )}
                    {match.status !== "bye" && match.status !== "cancelled" && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm text-[0.66rem]"
                        onClick={() => (isEditing ? setEditing(null) : openEditor(match))}
                      >
                        <ClipboardEdit className="size-3.5" aria-hidden="true" />
                        {isEditing ? "Свернуть" : match.score ? "Исправить счёт" : "Внести счёт"}
                      </button>
                    )}
                  </div>
                </div>

                <MatchRow match={match} showTournament={false} />

                {isEditing && (
                  <div className="border-t border-line bg-canvas-deep/60 px-4 py-5">
                    <div className="space-y-5">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                          Матч · {match.stage}
                        </p>
                        <p className="mt-1.5 text-lg font-medium leading-snug text-ink">
                          <span className={cn(winner === "1" && "underline decoration-2 underline-offset-4")}>
                            {left}
                          </span>
                          <span className="mx-2 text-ink-faint">против</span>
                          <span className={cn(winner === "2" && "underline decoration-2 underline-offset-4")}>
                            {right}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          Выберите формат, введите геймы по сетам и сохраните. Победитель подставится по счёту.
                        </p>
                      </div>

                      <fieldset>
                        <legend className="field-label">Формат матча</legend>
                        <div className="mt-1 grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => changeBestOf(1)}
                            className={cn(
                              "min-h-[48px] border px-3 py-2.5 text-left text-sm transition-colors",
                              bestOf === 1
                                ? "border-ink bg-ink text-canvas"
                                : "border-line bg-transparent text-ink hover:border-ink-soft",
                            )}
                          >
                            <span className="block font-medium">Один сет</span>
                            <span className="mt-0.5 block text-[0.7rem] opacity-80">Best of 1 — достаточно 6:4</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => changeBestOf(3)}
                            className={cn(
                              "min-h-[48px] border px-3 py-2.5 text-left text-sm transition-colors",
                              bestOf === 3
                                ? "border-ink bg-ink text-canvas"
                                : "border-line bg-transparent text-ink hover:border-ink-soft",
                            )}
                          >
                            <span className="block font-medium">До двух побед</span>
                            <span className="mt-0.5 block text-[0.7rem] opacity-80">Best of 3 — 2:0 или 2:1</span>
                          </button>
                        </div>
                      </fieldset>

                      <div>
                        <div className="mb-2 flex items-end justify-between gap-3">
                          <p className="field-label mb-0">
                            {bestOf === 1 ? "Геймы в сете" : "Геймы по сетам"}
                          </p>
                          {previewScore && (
                            <p className="text-[0.7rem] tabular-nums text-ink-muted">
                              Итог: {previewScore}
                            </p>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[280px] border-collapse text-sm">
                            <thead>
                              <tr className="text-left text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
                                <th className="pb-2 pr-3 font-medium">Сет</th>
                                <th className="pb-2 pr-2 font-medium">{left}</th>
                                <th className="w-6 pb-2 text-center font-medium text-ink-faint" aria-hidden="true">
                                  :
                                </th>
                                <th className="pb-2 pr-2 font-medium">{right}</th>
                                <th className="w-10 pb-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {setRows.map((row, index) => (
                                <tr key={index} className="align-middle">
                                  <td className="py-1.5 pr-3 text-ink-muted">
                                    {bestOf === 1 ? "Счёт" : `Сет ${index + 1}`}
                                  </td>
                                  <td className="py-1.5 pr-2">
                                    <label className="sr-only">
                                      {bestOf === 1 ? "Сет" : `Сет ${index + 1}`}, геймы — {left}
                                    </label>
                                    <input
                                      inputMode="numeric"
                                      className="field min-h-[44px] w-16 text-center text-base tabular-nums"
                                      placeholder="0"
                                      value={row.a}
                                      disabled={busy}
                                      onChange={(event) => updateSetCell(index, "a", event.target.value)}
                                    />
                                  </td>
                                  <td className="py-1.5 text-center text-ink-faint" aria-hidden="true">
                                    :
                                  </td>
                                  <td className="py-1.5 pr-2">
                                    <label className="sr-only">
                                      {bestOf === 1 ? "Сет" : `Сет ${index + 1}`}, геймы — {right}
                                    </label>
                                    <input
                                      inputMode="numeric"
                                      className="field min-h-[44px] w-16 text-center text-base tabular-nums"
                                      placeholder="0"
                                      value={row.b}
                                      disabled={busy}
                                      onChange={(event) => updateSetCell(index, "b", event.target.value)}
                                    />
                                  </td>
                                  <td className="py-1.5 text-right">
                                    {bestOf === 3 && setRows.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-sm px-2"
                                        disabled={busy}
                                        aria-label={`Удалить сет ${index + 1}`}
                                        onClick={() =>
                                          setSetRows((current) => current.filter((_, i) => i !== index))
                                        }
                                      >
                                        <Trash2 className="size-3.5" aria-hidden="true" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {bestOf === 3 && setRows.length < 5 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm mt-2"
                            disabled={busy}
                            onClick={() => setSetRows((current) => [...current, { ...EMPTY_SET }])}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                            Добавить сет
                          </button>
                        )}
                        <p className="mt-2 text-[0.7rem] text-ink-muted">
                          {bestOf === 1
                            ? "Пример одного сета: 6:4. Тай-брейк матча: 10:7."
                            : "Пример: сет 1 — 6:4, сет 2 — 3:6, сет 3 — 10:7 (тай-брейк)."}
                        </p>
                      </div>

                      <fieldset className="min-w-0">
                        <legend className="field-label">Кто победил</legend>
                        <div className="mt-1 grid gap-2 sm:grid-cols-2">
                          {(
                            [
                              ["1", left],
                              ["2", right],
                            ] as const
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              disabled={busy}
                              onClick={() => chooseWinner(value)}
                              className={cn(
                                "min-h-[48px] border px-3 py-2.5 text-left text-sm transition-colors",
                                winner === value
                                  ? "border-ink bg-ink text-canvas"
                                  : "border-line bg-transparent text-ink hover:border-ink-soft",
                              )}
                            >
                              <span className="block text-[0.58rem] uppercase tracking-[0.12em] opacity-70">
                                Сторона {value}
                              </span>
                              <span className="mt-0.5 block font-medium leading-snug">{label}</span>
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-[0.7rem] text-ink-muted">
                          {winnerManual
                            ? "Победитель выбран вручную (нужно для тех. победы / отказа / DQ)."
                            : "Победитель определяется по счёту автоматически."}
                        </p>
                      </fieldset>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-primary min-h-[48px] px-5"
                          disabled={busy}
                          onClick={() => save(match)}
                        >
                          {busy ? "Сохраняем…" : "Сохранить счёт"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary min-h-[48px]"
                          disabled={busy}
                          onClick={() => setEditing(null)}
                        >
                          Отмена
                        </button>
                      </div>

                      <div className="border-t border-line pt-4">
                        <button
                          type="button"
                          className="text-[0.7rem] uppercase tracking-[0.12em] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                          onClick={() => setSpecialOpen((open) => !open)}
                        >
                          {specialOpen ? "Скрыть особые исходы" : "Особый исход: тех. победа, отказ, DQ"}
                        </button>
                        {specialOpen && (
                          <div className="mt-3 space-y-3">
                            <p className="text-sm text-ink-muted">
                              Сначала отметьте победителя выше. Тех. победа — без сетов. Отказ — можно
                              указать частичный счёт. DQ — дисквалификация проигравшей стороны.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={busy}
                                onClick={() => awardWalkover(match)}
                              >
                                Тех. победа
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={busy}
                                onClick={() => awardRetire(match)}
                              >
                                Отказ
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={busy}
                                onClick={() => awardDq(match)}
                              >
                                Дисквалификация
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5 text-negative">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </span>
        </DemoNote>
      )}
      {notice && !error && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </span>
        </DemoNote>
      )}
    </div>
  );
}
