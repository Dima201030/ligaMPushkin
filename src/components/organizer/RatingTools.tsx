"use client";

import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { CategorySlug } from "@/lib/types";
import { CATEGORY_BY_SLUG } from "@/lib/domain";
import { formatNumber } from "@/lib/utils";
import { applyManualRating, snapshotRatings } from "@/lib/api/organizer-ratings";
import { DemoNote, MiniLabel } from "./OrganizerUI";

export function RecalculateRating({
  playersCount,
}: {
  playersCount: number;
  matchesCount?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setDone(null);
    const result = await snapshotRatings();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(`Снимок рейтинга обновлён: ${result.players} игроков.`);
  }

  return (
    <div>
      <p className="text-[0.76rem] leading-relaxed text-ink-muted">
        Пересчёт таблицы рейтинга по текущим очкам профилей. Создаёт snapshot для публичной таблицы.
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4 text-[0.7rem]">
        <div>
          <dt className="stat-label">Игроков на платформе</dt>
          <dd className="mt-1 text-sm tabular-nums">{formatNumber(playersCount)}</dd>
        </div>
      </dl>
      <button type="button" className="btn btn-primary mt-4 w-full" onClick={run} disabled={busy || Boolean(done)}>
        {done ? (
          <>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Готово
          </>
        ) : (
          <>
            <RefreshCw className="size-4" aria-hidden="true" />
            {busy ? "Пересчитываем…" : "Пересчитать сезон"}
          </>
        )}
      </button>
      {error && <DemoNote className="mt-3">{error}</DemoNote>}
      {done && <DemoNote className="mt-3">{done}</DemoNote>}
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const player = players.find((item) => item.id === playerId);
  const numericDelta = Number(delta) || 0;
  const nextRating = (player?.rating ?? 0) + numericDelta;
  const valid = Boolean(player) && numericDelta !== 0 && reason.trim().length >= 5;

  const sorted = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [players],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid || !player) return;
    setBusy(true);
    setError(null);
    setSaved(null);
    const result = await applyManualRating({
      playerId: player.id,
      pointsDelta: numericDelta,
      ratingDelta: numericDelta,
      reason: reason.trim(),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(
      `${player.name}: ${numericDelta > 0 ? "+" : ""}${numericDelta}, ориентир рейтинга ${nextRating}.`,
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
              {item.name} · {CATEGORY_BY_SLUG[item.category]?.shortName ?? item.category}
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

      <button type="submit" className="btn btn-secondary w-full" disabled={!valid || busy}>
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {busy ? "Сохраняем…" : "Применить корректировку"}
      </button>
      {error && <p className="text-[0.68rem] text-negative">{error}</p>}
      {saved && <DemoNote>{saved}</DemoNote>}
    </form>
  );
}

export function RatingCalculatorHint() {
  return (
    <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[0.68rem] leading-relaxed text-ink-muted">
      <Calculator className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      Формула сезона живёт на сервере: очки турниров + Elo-корректировки матчей.
    </p>
  );
}

export function RatingLegend({
  counts,
}: {
  counts: { category: CategorySlug; count: number }[];
}) {
  return (
    <ul className="divide-y divide-line">
      {counts.map((item) => (
        <li key={item.category} className="flex items-center justify-between gap-3 py-2.5 text-[0.72rem]">
          <span>{CATEGORY_BY_SLUG[item.category]?.name ?? item.category}</span>
          <span className="tabular-nums text-ink-muted">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
