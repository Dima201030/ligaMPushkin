"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Trophy, X } from "lucide-react";
import type { TournamentWinner } from "@/lib/types";
import { saveTournamentPlaces } from "@/lib/api/tournaments";
import { cn } from "@/lib/utils";
import { normalizeUuid, uuidsEqual } from "@/lib/uuid";

type Place = 1 | 2 | 3 | 4;

const PLACES: { place: Place; label: string; hint: string }[] = [
  { place: 1, label: "Первое место", hint: "Победитель турнира" },
  { place: 2, label: "Второе место", hint: "Финалист" },
  { place: 3, label: "Третье место", hint: "Бронзовый призёр" },
  { place: 4, label: "Четвёртое место", hint: "Проигравший матч за 3-е" },
];

type Slot = {
  enabled: boolean;
  playerId: string;
  partnerId: string;
};

function emptySlots(): Record<Place, Slot> {
  return {
    1: { enabled: false, playerId: "", partnerId: "" },
    2: { enabled: false, playerId: "", partnerId: "" },
    3: { enabled: false, playerId: "", partnerId: "" },
    4: { enabled: false, playerId: "", partnerId: "" },
  };
}

function initialSlots(winners: TournamentWinner[], suggested: TournamentWinner[]): Record<Place, Slot> {
  const slots = emptySlots();
  const source = winners.length > 0 ? winners : suggested;
  for (const winner of source) {
    if (winner.place < 1 || winner.place > 4) continue;
    const place = winner.place as Place;
    // Legacy singles shared-bronze: two players on place 3 → 3rd + 4th slots.
    if (
      place === 3 &&
      winner.playerIds.length === 2 &&
      !source.some((item) => item.place === 4)
    ) {
      slots[3] = {
        enabled: true,
        playerId: normalizeUuid(winner.playerIds[0]),
        partnerId: "",
      };
      slots[4] = {
        enabled: true,
        playerId: normalizeUuid(winner.playerIds[1]),
        partnerId: "",
      };
      continue;
    }
    slots[place] = {
      enabled: true,
      playerId: normalizeUuid(winner.playerIds[0]),
      partnerId: normalizeUuid(winner.playerIds[1]),
    };
  }
  return slots;
}

function slotPlayerIds(slot: Slot, isPairs: boolean): string[] {
  if (!slot.enabled || !slot.playerId) return [];
  const ids = [normalizeUuid(slot.playerId)];
  const partnerId = normalizeUuid(slot.partnerId);
  if (isPairs && partnerId && !uuidsEqual(partnerId, ids[0])) {
    ids.push(partnerId);
  }
  return ids;
}

function hasDuplicatePlayers(slots: Record<Place, Slot>, isPairs: boolean): boolean {
  const seen = new Set<string>();
  for (const item of PLACES) {
    for (const id of slotPlayerIds(slots[item.place], isPairs)) {
      if (seen.has(id)) return true;
      seen.add(id);
    }
  }
  return false;
}

function slotsMismatchSuggested(
  slots: Record<Place, Slot>,
  suggested: TournamentWinner[],
  isPairs: boolean,
): boolean {
  if (suggested.length === 0) return false;
  const enabled = PLACES.some((item) => slots[item.place].enabled && slots[item.place].playerId);
  if (!enabled) return false;
  for (const item of PLACES) {
    const current = slotPlayerIds(slots[item.place], isPairs).slice().sort().join(",");
    const want =
      (suggested.find((s) => s.place === item.place)?.playerIds ?? [])
        .map(normalizeUuid)
        .filter(Boolean)
        .sort()
        .join(",") ?? "";
    if (current !== want) return true;
  }
  return false;
}

export function TournamentPlaces({
  tournamentId,
  isPairs,
  participants,
  winners,
  suggestedPlaces = [],
}: {
  tournamentId: string;
  isPairs: boolean;
  participants: { id: string; name: string }[];
  winners: TournamentWinner[];
  suggestedPlaces?: TournamentWinner[];
}) {
  const [slots, setSlots] = useState(() => initialSlots(winners, suggestedPlaces));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const options = useMemo(
    () => [...participants].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [participants],
  );

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants) map.set(normalizeUuid(p.id), p.name);
    return map;
  }, [participants]);

  const mismatch = slotsMismatchSuggested(slots, suggestedPlaces, isPairs);

  function update(place: Place, patch: Partial<Slot>) {
    setSlots((current) => ({ ...current, [place]: { ...current[place], ...patch } }));
    setNotice(null);
    setError(null);
  }

  function enable(place: Place) {
    update(place, { enabled: true });
  }

  function disable(place: Place) {
    update(place, { enabled: false, playerId: "", partnerId: "" });
  }

  function applySuggested() {
    setSlots(initialSlots([], suggestedPlaces));
    setNotice(null);
    setError(null);
  }

  async function save() {
    if (busy) return;
    if (hasDuplicatePlayers(slots, isPairs)) {
      setError("Один игрок не может занимать несколько мест сразу");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const places: { place: Place; playerIds: string[] }[] = [];
    for (const item of PLACES) {
      const ids = slotPlayerIds(slots[item.place], isPairs);
      if (ids.length === 0) continue;
      places.push({ place: item.place, playerIds: ids });
    }
    const result = await saveTournamentPlaces(tournamentId, places);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(
      places.length === 0
        ? "Призёры скрыты с публичной страницы"
        : "Призёры опубликованы на странице турнира",
    );
  }

  const hasAnything = PLACES.some((item) => slots[item.place].enabled);

  return (
    <div>
      {mismatch && suggestedPlaces.length > 0 && (
        <div
          role="status"
          className="mb-4 border border-warning/40 bg-warning/5 px-3 py-3 text-[0.72rem] text-ink"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-medium">Места отличаются от результата сетки</p>
              <p className="text-ink-muted">
                Алгоритм предлагает:{" "}
                {suggestedPlaces
                  .map((slot) => {
                    const names = slot.playerIds
                      .map((id) => nameById.get(normalizeUuid(id)) ?? id.slice(0, 8))
                      .join(" / ");
                    return `${slot.place} — ${names || "—"}`;
                  })
                  .join("; ")}
                .
              </p>
              <button
                type="button"
                className="text-[0.64rem] uppercase tracking-[0.1em] text-ink underline-offset-2 hover:underline"
                onClick={applySuggested}
              >
                Подставить по сетке
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {PLACES.map((item) => {
          const slot = slots[item.place];
          const isFirst = item.place === 1;
          return (
            <div
              key={item.place}
              className={cn(
                "border p-4 transition-colors",
                slot.enabled ? "border-line bg-canvas-soft" : "border-dashed border-line",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center border text-sm tabular-nums",
                      isFirst
                        ? "border-warning/50 text-warning"
                        : "border-line-strong text-ink-muted",
                    )}
                  >
                    {isFirst ? <Trophy className="size-4" aria-hidden="true" /> : item.place}
                  </span>
                  <div>
                    <p className="text-[0.8rem] font-medium text-ink">{item.label}</p>
                    <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                      {slot.enabled ? item.hint : "Не показывается на публичной странице"}
                    </p>
                  </div>
                </div>

                {slot.enabled ? (
                  <button
                    type="button"
                    onClick={() => disable(item.place)}
                    className="inline-flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-negative"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    Убрать
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => enable(item.place)}
                    className="inline-flex items-center gap-1 text-[0.64rem] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Добавить
                  </button>
                )}
              </div>

              {slot.enabled && (
                <div className={cn("mt-4 grid gap-3", isPairs && "sm:grid-cols-2")}>
                  <label className="block">
                    <span className="field-label">Игрок</span>
                    <select
                      className="field min-h-[38px] text-sm"
                      value={slot.playerId}
                      onChange={(event) => update(item.place, { playerId: event.target.value })}
                    >
                      <option value="">Выберите участника</option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isPairs && (
                    <label className="block">
                      <span className="field-label">Партнёр</span>
                      <select
                        className="field min-h-[38px] text-sm"
                        value={slot.partnerId}
                        onChange={(event) => update(item.place, { partnerId: event.target.value })}
                      >
                        <option value="">Без второго</option>
                        {options
                          .filter((option) => !uuidsEqual(option.id, slot.playerId))
                          .map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {options.length === 0 && (
        <p className="mt-3 text-[0.66rem] text-ink-muted">
          В турнире пока нет подтверждённых участников — призёров можно будет выбрать после заявок.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void save()} disabled={busy}>
          {busy ? "Сохранение…" : "Сохранить призёров"}
        </button>
        <span className="text-[0.64rem] text-ink-muted">
          {hasAnything ? "Пустые места не публикуются." : "Все места скрыты."}
        </span>
      </div>

      {notice && (
        <p role="status" className="mt-3 inline-flex items-center gap-1.5 border border-positive/40 px-3 py-2 text-[0.68rem] text-positive">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 border border-negative/40 px-3 py-2 text-[0.68rem] text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
