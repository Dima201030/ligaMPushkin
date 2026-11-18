"use client";

import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { CategorySlug } from "@/lib/types";
import { CATEGORY_BY_SLUG } from "@/lib/domain";
import { formatNumber } from "@/lib/utils";
import { DemoNote, MiniLabel } from "./OrganizerUI";

export function RecalculateRating({
  playersCount,
  matchesCount,
}: {
  playersCount: number;
  matchesCount: number;
}) {
  const [included, setIncluded] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div>
      <p className="text-[0.76rem] leading-relaxed text-ink-muted">
        Пересчёт очков за 52 недели по всем завершённым матчам. Операция создаёт запись в журнале изменений.
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[0.7rem]">
        <div>
          <dt className="stat-label">Игроков</dt>
          <dd className="mt-1 text-sm tabular-nums">{formatNumber(playersCount)}</dd>
        </div>
        <div>
          <dt className="stat-label">Матчей</dt>
          <dd className="mt-1 text-sm tabular-nums">{formatNumber(matchesCount)}</dd>
        </div>
      </dl>
      <label className="mt-4 flex cursor-pointer items-start gap-2 text-[0.68rem] text-ink-soft">
        <input
          type="checkbox"
          checked={included}
          onChange={(event) => setIncluded(event.target.checked)}
          className="mt-0.5 size-3.5 accent-[var(--color-accent)]"
        />
        Учитывать матчи прошлых сезонов
      </label>
      <button
        type="button"
        className="btn btn-primary mt-4 w-full"
        onClick={() => setDone(true)}
        disabled={done}
      >
        {done ? (
          <>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Рейтинг пересчитан
          </>
        ) : (
          <>
            <RefreshCw className="size-4" aria-hidden="true" />
            Пересчитать сезон
          </>
        )}
      </button>
      {done && (
        <DemoNote className="mt-3">
          Пересчёт выполнен: {formatNumber(matchesCount)} матчей, {formatNumber(playersCount)} игроков. Изменения
          зафиксированы бы в журнале. Демо-режим.
        </DemoNote>
      )}
    </div>
  );
}

export function ManualAdjustment({
  players,
}: {
  players: { id: string; name: string; rating: number; category: CategorySlug }[];
}) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [delta, setDelta] = useState("15");
  const [reason, setReason] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const player = players.find((item) => item.id === playerId);
  const numericDelta = Number(delta) || 0;
  const nextRating = (player?.rating ?? 0) + numericDelta;
  const valid = Boolean(player) && numericDelta !== 0 && reason.trim().length >= 5;

  const sorted = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [players],
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || !player) return;
    setSaved(
      `${player.name}: ${numericDelta > 0 ? "+" : ""}${numericDelta} очков, новый рейтинг ${nextRating}. Причина: ${reason.trim()}`,
    );
    setReason("");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="field-label">Игрок</span>
        <select className="field text-xs" value={playerId} onChange={(event) => setPlayerId(event.target.value)}>
          {sorted.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {CATEGORY_BY_SLUG[item.category].shortName}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-[110px_1fr] items-end gap-2">
        <label className="block">
          <span className="field-label">Изменение</span>
          <input
            type="number"
            className="field text-xs"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            step={1}
          />
        </label>
        <div className="border-b border-line pb-1.5">
          <MiniLabel>Станет</MiniLabel>
          <p className="mt-0.5 text-sm tabular-nums text-ink">
            {nextRating}
            <span className="ml-1 text-[0.6rem] text-ink-faint">очков рейтинга</span>
          </p>
        </div>
      </div>

      <label className="block">
        <span className="field-label">Причина корректировки</span>
        <textarea
          className="field min-h-[64px] resize-y text-xs"
          placeholder="Например: перенос очков за пропущенный матч"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-secondary w-full" disabled={!valid}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Применить корректировку
      </button>
      <p className="text-[0.62rem] leading-relaxed text-ink-faint">
        Ручные изменения доступны только администратору и всегда попадают в журнал аудита.
      </p>

      {saved && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{saved}. Демо-режим: рейтинг не изменён.</span>
          </span>
        </DemoNote>
      )}
    </form>
  );
}

export function RatingLegend({ counts }: { counts: { category: CategorySlug; count: number }[] }) {
  return (
    <ul className="grid gap-2">
      {counts.map((item) => (
        <li key={item.category} className="flex items-center justify-between gap-2 text-[0.7rem]">
          <span className="inline-flex items-center gap-2 text-ink-soft">
            <span className="size-1.5" style={{ backgroundColor: CATEGORY_BY_SLUG[item.category].color }} aria-hidden="true" />
            {CATEGORY_BY_SLUG[item.category].name}
          </span>
          <span className="tabular-nums text-ink">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}

export function RatingCalculatorHint() {
  return (
    <div className="flex items-start gap-2.5 border-t border-line pt-3 text-[0.66rem] leading-relaxed text-ink-muted">
      <Calculator className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
      Очки за победу = базовые очки стадии × коэффициент категории соперника. Поражение в первом круге очков не снимает.
    </div>
  );
}
