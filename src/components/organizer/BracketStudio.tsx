"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  Info,
  Network,
  Printer,
  RefreshCw,
  Save,
  Shuffle,
  Users,
} from "lucide-react";
import type { TournamentFormat } from "@/lib/types";
import { FORMATS, FORMAT_LABEL, TYPE_BY_VALUE } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  generateDraw,
  type BracketEntry,
  type BracketMatch,
  type BracketRound,
  type BracketSlot,
  type GeneratedDraw,
} from "@/lib/bracket";
import { CategoryBadge } from "@/components/ui/Badges";
import { DemoNote, Panel } from "./OrganizerUI";

export interface BracketSource {
  id: string;
  title: string;
  format: TournamentFormat;
  type: keyof typeof TYPE_BY_VALUE;
  category: Parameters<typeof CategoryBadge>[0]["category"];
  maxParticipants: number;
  status: string;
  entries: { playerId: string; name: string; seed?: number; rating: number }[];
}

type Seeding = "seed" | "rating" | "random";

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number) {
  const random = seededRandom(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function SlotRow({ slot, winner }: { slot: BracketSlot; winner?: boolean }) {
  const label = slot.name ?? slot.placeholder ?? (slot.isBye ? "Пропуск" : "—");
  return (
    <div
      className={cn(
        "flex min-h-[30px] items-center gap-1.5 px-2 py-1 text-[0.7rem]",
        winner ? "bg-canvas-deep" : "",
      )}
    >
      {slot.seed && (
        <span className="grid size-4 shrink-0 place-items-center border border-line text-[0.52rem] tabular-nums text-ink-muted">
          {slot.seed}
        </span>
      )}
      <span
        className={cn(
          "truncate",
          slot.name ? "text-ink" : "italic text-ink-faint",
          winner && "font-medium text-ink",
        )}
        title={label}
      >
        {label}
      </span>
    </div>
  );
}

function MatchCard({ match, isFinal }: { match: BracketMatch; isFinal?: boolean }) {
  return (
    <div
      className={cn(
        "border",
        isFinal ? "border-ink" : "border-line",
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-2 py-0.5 text-[0.5rem] uppercase tracking-[0.08em] text-ink-faint">
        <span>{match.id}</span>
        {match.automaticWinner && <span className="text-positive">bye</span>}
      </div>
      <SlotRow slot={match.slot1} winner={match.automaticWinner === 1} />
      <div className="h-px bg-line" />
      <SlotRow slot={match.slot2} winner={match.automaticWinner === 2} />
    </div>
  );
}

function BracketTree({ rounds, compact = false }: { rounds: BracketRound[]; compact?: boolean }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {rounds.map((round) => (
        <div key={round.index} className={cn("flex shrink-0 flex-col", compact ? "w-[190px]" : "w-[212px]")}>
          <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-line pb-1">
            <span className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft">{round.label}</span>
            <span className="text-[0.55rem] tabular-nums text-ink-faint">{round.matches.length}</span>
          </div>
          <div className="flex flex-1 flex-col justify-around gap-2.5">
            {round.matches.map((match) => (
              <MatchCard key={match.id} match={match} isFinal={round.matches.length === 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupCard({ group }: { group: NonNullable<GeneratedDraw["groups"]>[number] }) {
  return (
    <div className="border-y border-line">
      <div className="flex items-center justify-between border-b border-line py-2">
        <p className="text-[0.6rem] uppercase tracking-[0.12em] text-ink">{group.name}</p>
        <span className="text-[0.6rem] text-ink-muted">{group.entries.length} игрока</span>
      </div>
      <ol className="divide-y divide-divider">
        {group.entries.map((entry, index) => (
          <li key={`${group.name}-${entry.playerId ?? entry.name}`} className="flex items-center gap-2 px-3 py-1.5 text-[0.7rem]">
            <span className="w-4 shrink-0 text-[0.58rem] tabular-nums text-ink-faint">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate text-ink">{entry.name}</span>
            {entry.seed && <span className="text-[0.55rem] text-ink-faint">#{entry.seed}</span>}
          </li>
        ))}
      </ol>
      <div className="border-t border-line py-1.5">
        <p className="text-[0.52rem] uppercase tracking-[0.12em] text-ink-faint">Матчи группы</p>
      </div>
      <ul className="divide-y divide-divider">
        {group.matches.map((match) => (
          <li key={match.id} className="flex items-center justify-between gap-2 px-3 py-1.5 text-[0.66rem] text-ink-soft">
            <span className="truncate">{match.slot1.name ?? "—"}</span>
            <span className="shrink-0 text-[0.55rem] text-ink-faint">vs</span>
            <span className="truncate text-right">{match.slot2.name ?? "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function toCsv(draw: GeneratedDraw) {
  const rows: string[][] = [["Секция", "Раунд", "Матч", "Сторона 1", "Сторона 2"]];
  const pushRounds = (rounds: BracketRound[], section: string) => {
    rounds.forEach((round) => {
      round.matches.forEach((match) => {
        rows.push([
          section,
          round.label,
          match.id,
          match.slot1.name ?? match.slot1.placeholder ?? "Пропуск",
          match.slot2.name ?? match.slot2.placeholder ?? "Пропуск",
        ]);
      });
    });
  };
  if (draw.groups) {
    draw.groups.forEach((group) => {
      group.matches.forEach((match) => {
        rows.push([group.name, "Группа", match.id, match.slot1.name ?? "—", match.slot2.name ?? "—"]);
      });
    });
  }
  if (draw.playoffRounds?.length) pushRounds(draw.playoffRounds, "Плей-офф");
  if (draw.rounds.length) pushRounds(draw.rounds, draw.format === "double_elimination" ? "Верхняя сетка" : "Основная сетка");
  if (draw.lowerRounds?.length) pushRounds(draw.lowerRounds, "Нижняя сетка");
  if (draw.thirdPlace) {
    rows.push([
      "Матч за 3-е место",
      "Матч за 3-е место",
      draw.thirdPlace.id,
      draw.thirdPlace.slot1.placeholder ?? "—",
      draw.thirdPlace.slot2.placeholder ?? "—",
    ]);
  }
  if (draw.grandFinal) {
    rows.push([
      "Гранд-финал",
      "Гранд-финал",
      draw.grandFinal.id,
      draw.grandFinal.slot1.placeholder ?? "—",
      draw.grandFinal.slot2.placeholder ?? "—",
    ]);
  }
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
}

export function BracketStudio({
  sources,
  initialTournamentId,
}: {
  sources: BracketSource[];
  initialTournamentId?: string;
}) {
  const initial = sources.find((item) => item.id === initialTournamentId) ?? sources[0];
  const [sourceId, setSourceId] = useState(initial?.id ?? "");
  const [format, setFormat] = useState<TournamentFormat>(initial?.format ?? "olympic");
  const [seeding, setSeeding] = useState<Seeding>("seed");
  const [thirdPlace, setThirdPlace] = useState(true);
  const [groupSize, setGroupSize] = useState(4);
  const [qualifiers, setQualifiers] = useState(2);
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const source = sources.find((item) => item.id === sourceId);

  const entries = useMemo<BracketEntry[]>(() => {
    if (!source) return [];
    const list = [...source.entries];
    if (seeding === "random") {
      return shuffle(list, version + 17).map((entry, index) => ({ ...entry, seed: index + 1 }));
    }
    if (seeding === "rating") {
      return list
        .sort((a, b) => b.rating - a.rating)
        .map((entry, index) => ({ ...entry, seed: index + 1 }));
    }
    return list
      .sort((a, b) => (a.seed ?? 9999) - (b.seed ?? 9999) || b.rating - a.rating)
      .map((entry, index) => ({ ...entry, seed: index + 1 }));
  }, [source, seeding, version]);

  const draw = useMemo(
    () =>
      entries.length >= 2
        ? generateDraw(format, entries, {
            thirdPlace,
            groupSize,
            qualifiersPerGroup: qualifiers,
          })
        : null,
    [entries, format, thirdPlace, groupSize, qualifiers],
  );

  function pickSource(id: string) {
    setSourceId(id);
    const next = sources.find((item) => item.id === id);
    if (next) setFormat(next.format);
    setNotice(null);
  }

  function regenerate() {
    setVersion((current) => current + 1);
    setNotice(
      `Сетка пересобрана: ${entries.length} участников, ${FORMAT_LABEL[format].toLowerCase()}.${
        seeding === "random" ? " Посев перемешан." : ""
      }`,
    );
  }

  function exportCsv() {
    if (!draw) return;
    const blob = new Blob([`\uFEFF${toCsv(draw)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `draw-${source?.id ?? "league"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("CSV-файл со всеми матчами сетки скачан.");
  }

  const canUseThirdPlace = format === "olympic";
  const isGroups = format === "groups_playoff";

  return (
    <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-8 no-print">
        <Panel title="Параметры жеребьёвки" description="Настройки применяются к предпросмотру сразу">
          <div className="space-y-3">
            <label className="block">
              <span className="field-label">Турнир</span>
              <select className="field text-xs" value={sourceId} onChange={(event) => pickSource(event.target.value)}>
                {sources.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </label>

            {source && (
              <div className="flex flex-wrap items-center gap-1.5">
                <CategoryBadge category={source.category} withName={false} />
                <span className="badge badge-neutral text-[0.55rem]">{TYPE_BY_VALUE[source.type].label}</span>
                <span className="badge badge-outline text-[0.55rem]">{source.entries.length} участников</span>
              </div>
            )}

            <label className="block">
              <span className="field-label">Формат</span>
              <select
                className="field text-xs"
                value={format}
                onChange={(event) => setFormat(event.target.value as TournamentFormat)}
              >
                {FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <span className="mt-1 block text-[0.62rem] leading-relaxed text-ink-faint">
                {FORMATS.find((item) => item.value === format)?.description}
              </span>
            </label>

            <label className="block">
              <span className="field-label">Посев</span>
              <select className="field text-xs" value={seeding} onChange={(event) => setSeeding(event.target.value as Seeding)}>
                <option value="seed">По заявленному посеву</option>
                <option value="rating">По рейтингу клуба</option>
                <option value="random">Случайная жеребьёвка</option>
              </select>
            </label>

            {isGroups && (
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="field-label">Размер группы</span>
                  <select className="field text-xs" value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value))}>
                    <option value={3}>3 игрока</option>
                    <option value={4}>4 игрока</option>
                    <option value={5}>5 игроков</option>
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Выходят</span>
                  <select className="field text-xs" value={qualifiers} onChange={(event) => setQualifiers(Number(event.target.value))}>
                    <option value={1}>по 1</option>
                    <option value={2}>по 2</option>
                  </select>
                </label>
              </div>
            )}

            {canUseThirdPlace && (
              <label className="flex cursor-pointer items-start gap-2 text-[0.7rem] text-ink-soft">
                <input
                  type="checkbox"
                  checked={thirdPlace}
                  onChange={(event) => setThirdPlace(event.target.checked)}
                  className="mt-0.5 size-3.5 accent-[var(--color-accent)]"
                />
                Матч за третье место
              </label>
            )}

            <div className="flex gap-2 border-t border-line pt-3">
              <button type="button" className="btn btn-primary btn-sm flex-1" onClick={regenerate}>
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Пересобрать
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                title="Случайная жеребьёвка"
                aria-label="Случайная жеребьёвка"
                onClick={() => {
                  setSeeding("random");
                  regenerate();
                }}
              >
                <Shuffle className="size-3.5" />
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Участники" description="Порядок посева в текущей сетке" flush>
          <ul className="max-h-[360px] divide-y divide-line overflow-y-auto">
            {entries.map((entry, index) => (
              <li key={entry.playerId ?? `${entry.name}-${index}`} className="flex items-center gap-2 py-2">
                <span className="grid size-5 shrink-0 place-items-center border border-line text-[0.52rem] tabular-nums text-ink-muted">
                  {entry.seed ?? index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.7rem] text-ink">{entry.name}</span>
                <span className="text-[0.6rem] tabular-nums text-ink-faint">{entry.rating}</span>
              </li>
            ))}
          </ul>
          {entries.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-ink-muted">У турнира пока нет подтверждённых участников.</p>
          )}
        </Panel>

        <DemoNote>
          Сетка строится в браузере и не сохраняется. В продакшене генерация выполняется server action и записывает
          матчи в базу данных.
        </DemoNote>
      </aside>

      <div className="min-w-0 space-y-6">
        {!draw ? (
          <div className="border-y border-line px-6 py-20 text-center">
            <Network className="mx-auto size-8 text-ink-faint" aria-hidden="true" />
            <p className="mt-3 text-lg font-medium">Недостаточно участников</p>
            <p className="mt-1 text-sm text-ink-muted">
              Для построения сетки нужно минимум два подтверждённых игрока. Добавьте участников в карточке турнира.
            </p>
            {source && (
              <Link href={`/organizer/tournaments/${source.id}`} className="btn btn-primary mt-5">
                Открыть турнир
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3 no-print">
              <div className="min-w-0">
                <p className="text-[0.56rem] uppercase tracking-[0.16em] text-ink-faint">Предпросмотр сетки</p>
                <p className="mt-1 truncate text-sm text-ink">
                  {source?.title ?? "Турнир"} · {FORMAT_LABEL[format]}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <Printer className="size-3.5" aria-hidden="true" />
                  Печать
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={exportCsv}>
                  <Download className="size-3.5" aria-hidden="true" />
                  CSV
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setNotice("Сетка сохранена бы как черновик турнира. Демо-режим: данные не сохраняются.")}
                >
                  <Save className="size-3.5" aria-hidden="true" />
                  Сохранить сетку
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-5">
              {[
                { label: "Участники", value: draw.entriesCount, icon: Users },
                { label: "Размер сетки", value: draw.bracketSize || "—", icon: Network },
                { label: "Пропуски (bye)", value: draw.byes, icon: Info },
                { label: "Матчей", value: draw.matchCount, icon: RefreshCw },
                {
                  label: "Раундов",
                  value:
                    (draw.rounds.length || 0) +
                    (draw.playoffRounds?.length ?? 0) +
                    (draw.lowerRounds?.length ?? 0) +
                    (draw.groups ? 1 : 0),
                  icon: Save,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="border-t border-line pt-3">
                    <div className="flex items-center justify-between gap-1.5 text-[0.56rem] uppercase tracking-[0.1em] text-ink-muted">
                      {stat.label}
                      <Icon className="size-3 text-ink-faint" aria-hidden="true" />
                    </div>
                    <p className="display mt-2 text-[1.5rem] leading-none tabular-nums">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {draw.groups && (
              <div className="border-t border-line pt-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-[0.95rem] font-medium text-ink">Групповой этап</h2>
                    <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                      Круговые матчи в группах, затем выход в плей-офф
                    </p>
                  </div>
                  <span className="badge badge-neutral text-[0.55rem]">
                    {draw.groups.length} {draw.groups.length === 1 ? "группа" : "группы"} · {draw.groups.reduce((sum, group) => sum + group.matches.length, 0)} матчей
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {draw.groups.map((group) => (
                    <GroupCard key={group.name} group={group} />
                  ))}
                </div>
              </div>
            )}

            {draw.playoffRounds && draw.playoffRounds.length > 0 && (
              <div className="border-t border-line pt-5">
                <div className="mb-3">
                  <h2 className="text-[0.95rem] font-medium text-ink">Плей-офф</h2>
                  <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                    Выходят {qualifiers} лучших из каждой группы. Участники подставятся после группового этапа.
                  </p>
                </div>
                <BracketTree rounds={draw.playoffRounds} />
              </div>
            )}

            {draw.rounds.length > 0 && (
              <div className="border-t border-line pt-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-[0.95rem] font-medium text-ink">
                      {draw.format === "double_elimination" ? "Верхняя сетка" : "Основная сетка"}
                    </h2>
                    <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                      {draw.bracketSize} слотов · {draw.byes > 0 ? `${draw.byes} пропуска у сеяных игроков` : "все пары заполнены"}
                    </p>
                  </div>
                  <span className="badge badge-blue text-[0.55rem]">{FORMAT_LABEL[format]}</span>
                </div>
                <BracketTree rounds={draw.rounds} />
              </div>
            )}

            {draw.lowerRounds && draw.lowerRounds.length > 0 && (
              <div className="border-t border-line pt-5">
                <div className="mb-3">
                  <h2 className="text-[0.95rem] font-medium text-ink">Нижняя сетка</h2>
                  <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                    Второй шанс: проигравшие в верхней сетке продолжают борьбу за финал.
                  </p>
                </div>
                <BracketTree rounds={draw.lowerRounds} compact />
              </div>
            )}

            {draw.thirdPlace && (
              <div className="border-t border-line pt-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_240px] sm:items-center">
                  <div>
                    <h2 className="text-[0.95rem] font-medium text-ink">Матч за третье место</h2>
                    <p className="mt-0.5 text-[0.66rem] text-ink-muted">Проигравшие в полуфиналах разыгрывают бронзу.</p>
                  </div>
                  <MatchCard match={draw.thirdPlace} />
                </div>
              </div>
            )}

            {draw.grandFinal && (
              <div className="border-t border-line pt-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_240px] sm:items-center">
                  <div>
                    <h2 className="text-[0.95rem] font-medium text-ink">Гранд-финал</h2>
                    <p className="mt-0.5 text-[0.66rem] text-ink-muted">
                      Победители верхней и нижней сетки. При поражении из верхней сетки назначается повторный финал.
                    </p>
                  </div>
                  <MatchCard match={draw.grandFinal} isFinal />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[0.62rem] text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="grid size-4 place-items-center border border-line text-[0.5rem] tabular-nums">1</span>
                посев игрока
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="italic text-ink-faint">Победитель R1M1</span>
                заполнится по ходу турнира
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="badge badge-blue text-[0.5rem]">bye</span>
                игрок проходит без матча
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-ink-faint">
                <ArrowUpRight className="size-3" aria-hidden="true" />
                Сетка обновляется после каждого результата
              </span>
            </div>
          </>
        )}

        {notice && <DemoNote className="no-print">{notice}</DemoNote>}
      </div>
    </div>
  );
}
