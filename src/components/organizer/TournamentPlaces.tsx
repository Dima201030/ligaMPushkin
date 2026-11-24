"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus, Trophy, X } from "lucide-react";
import type { TournamentWinner } from "@/lib/types";
import { saveTournamentPlaces } from "@/lib/api/tournaments";
import { cn } from "@/lib/utils";
import { normalizeUuid, uuidsEqual } from "@/lib/uuid";

type Place = 1 | 2 | 3;

const PLACES: { place: Place; label: string; hint: string }[] = [
  { place: 1, label: "Первое место", hint: "Победитель турнира" },
  { place: 2, label: "Второе место", hint: "Финалист" },
  { place: 3, label: "Третье место", hint: "Бронзовый призёр" },
];

type Slot = {
  enabled: boolean;
  playerId: string;
  partnerId: string;
};

function initialSlots(winners: TournamentWinner[]): Record<Place, Slot> {
  const slots: Record<Place, Slot> = {
    1: { enabled: false, playerId: "", partnerId: "" },
    2: { enabled: false, playerId: "", partnerId: "" },
    3: { enabled: false, playerId: "", partnerId: "" },
  };
  for (const winner of winners) {
    slots[winner.place] = {
      enabled: true,
      playerId: normalizeUuid(winner.playerIds[0]),
      partnerId: normalizeUuid(winner.playerIds[1]),
    };
  }
  return slots;
}

export function TournamentPlaces({
  tournamentId,
  isPairs,
  participants,
  winners,
}: {
  tournamentId: string;
  isPairs: boolean;
  participants: { id: string; name: string }[];
  winners: TournamentWinner[];
}) {
  const [slots, setSlots] = useState(() => initialSlots(winners));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const options = useMemo(
    () => [...participants].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [participants],
  );

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

  async function save() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const places: { place: Place; playerIds: string[] }[] = [];
    for (const item of PLACES) {
      const slot = slots[item.place];
      if (!slot.enabled || !slot.playerId) continue;
      const playerId = normalizeUuid(slot.playerId);
      const ids = [playerId];
      const partnerId = normalizeUuid(slot.partnerId);
      if (isPairs && partnerId && !uuidsEqual(partnerId, playerId)) {
        ids.push(partnerId);
      }
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
                    <span className="field-label">{isPairs ? "Игрок" : "Игрок"}</span>
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
                        <option value="">Без партнёра</option>
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
