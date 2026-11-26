"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AutosaveIndicator } from "@/components/motion/AutosaveIndicator";
import type {
  CategorySlug,
  Surface,
  Tournament,
  TournamentFormat,
  TournamentStatus,
  TournamentType,
} from "@/lib/types";
import { updateOrganizerTournament } from "@/lib/api/tournaments";
import {
  CATEGORIES,
  FORMATS,
  SURFACES,
  TOURNAMENT_STATUSES,
  TOURNAMENT_TYPES,
} from "@/lib/domain";
import { TOURNAMENT_LIMITS, validateTournamentFields } from "@/lib/tournament-limits";
import { cn } from "@/lib/utils";
import { Panel } from "./OrganizerUI";

function toLocalInput(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function TournamentEditForm({ tournament }: { tournament: Tournament }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: tournament.title,
    description: tournament.description,
    type: tournament.type,
    category: tournament.category,
    surface: tournament.surface,
    format: tournament.format,
    status: tournament.status,
    startsAt: toLocalInput(tournament.startsAt),
    endsAt: toLocalInput(tournament.endsAt),
    registrationOpensAt: toLocalInput(tournament.registrationOpensAt),
    registrationClosesAt: toLocalInput(tournament.registrationClosesAt),
    venueName: tournament.venue.name,
    venueAddress: tournament.venue.address,
    venueCourts: String(tournament.venue.courts),
    venueSurface: tournament.venue.surface,
    entryFee: String(tournament.entryFee),
    maxParticipants: String(tournament.maxParticipants),
    regulations: tournament.regulations,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const fieldErrors = useMemo(
    () =>
      validateTournamentFields({
        title: form.title,
        description: form.description,
        regulations: form.regulations,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        registrationOpensAt: form.registrationOpensAt,
        registrationClosesAt: form.registrationClosesAt,
        maxParticipants: form.maxParticipants,
        entryFee: form.entryFee,
        venueName: form.venueName,
        venueAddress: form.venueAddress,
        requireRegulations: form.regulations.trim().length > 0,
      }),
    [form],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    const firstError = Object.values(fieldErrors)[0];
    if (firstError) {
      setError(firstError);
      return;
    }
    setBusy(true);
    setSaveState("saving");
    setError(null);
    const result = await updateOrganizerTournament(tournament.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type as TournamentType,
      category: form.category as CategorySlug,
      surface: form.surface as Surface,
      format: form.format as TournamentFormat,
      status: form.status as TournamentStatus,
      startsAt: fromLocalInput(form.startsAt) ?? tournament.startsAt,
      endsAt: fromLocalInput(form.endsAt),
      registrationOpensAt: fromLocalInput(form.registrationOpensAt),
      registrationClosesAt: fromLocalInput(form.registrationClosesAt) ?? tournament.registrationClosesAt,
      venueName: form.venueName.trim(),
      venueAddress: form.venueAddress.trim(),
      venueCourts: Number(form.venueCourts) || tournament.venue.courts,
      venueSurface: form.venueSurface as Surface,
      entryFee: Number(form.entryFee) || 0,
      maxParticipants: Number(form.maxParticipants) || tournament.maxParticipants,
      regulations: form.regulations.trim(),
      clubSlug: tournament.clubSlug,
    });
    setBusy(false);
    if (!result.ok) {
      setSaveState("error");
      setError(result.error);
      return;
    }
    setSaveState("saved");
    router.push(`/organizer/tournaments/${tournament.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-8">
        <Panel title="Основное" description="Клуб задаётся при создании и не переносится через «текущий клуб».">
          <div className="grid gap-4">
            <div className="block">
              <span className="field-label">Клуб</span>
              <p className="mt-1 border border-line bg-[var(--color-surface-muted,transparent)] px-3 py-2 text-sm text-ink">
                {tournament.clubName || tournament.clubSlug || "—"}
              </p>
              <span className="mt-1 block text-[0.62rem] text-ink-faint">
                Клуб на карточке только для чтения. Чтобы провести турнир под другим клубом, создайте новый.
              </span>
            </div>
            <label className="block">
              <span className="field-label">Название турнира</span>
              <input
                className={cn("field", attempted && fieldErrors.title && "border-negative")}
                value={form.title}
                maxLength={TOURNAMENT_LIMITS.titleMax}
                onChange={(event) => update("title", event.target.value)}
              />
              {attempted && fieldErrors.title && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.title}</span>
              )}
            </label>
            <label className="block">
              <span className="field-label">Описание</span>
              <textarea
                className={cn("field min-h-[92px] resize-y", attempted && fieldErrors.description && "border-negative")}
                value={form.description}
                maxLength={TOURNAMENT_LIMITS.descriptionMax}
                onChange={(event) => update("description", event.target.value)}
              />
              <span className="mt-1 block text-[0.62rem] tabular-nums text-ink-faint">
                {form.description.trim().length}/{TOURNAMENT_LIMITS.descriptionMax}
              </span>
              {attempted && fieldErrors.description && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.description}</span>
              )}
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="field-label">Тип</span>
                <select
                  className="field"
                  value={form.type}
                  onChange={(event) => update("type", event.target.value as TournamentType)}
                >
                  {TOURNAMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Категория</span>
                <select
                  className="field"
                  value={form.category}
                  onChange={(event) => update("category", event.target.value as CategorySlug)}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Покрытие</span>
                <select
                  className="field"
                  value={form.surface}
                  onChange={(event) => update("surface", event.target.value as Surface)}
                >
                  {SURFACES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="field-label">Формат</span>
              <select
                className="field"
                value={form.format}
                onChange={(event) => update("format", event.target.value as TournamentFormat)}
              >
                {FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
        </Panel>

        <Panel title="Даты и регистрация" description="Сроки видны игрокам в календаре и на странице турнира.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Старт турнира</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && fieldErrors.startsAt && "border-negative")}
                value={form.startsAt}
                onChange={(event) => update("startsAt", event.target.value)}
              />
              {attempted && fieldErrors.startsAt && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.startsAt}</span>
              )}
            </label>
            <label className="block">
              <span className="field-label">Окончание</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && fieldErrors.endsAt && "border-negative")}
                value={form.endsAt}
                onChange={(event) => update("endsAt", event.target.value)}
              />
              {attempted && fieldErrors.endsAt && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.endsAt}</span>
              )}
            </label>
            <label className="block">
              <span className="field-label">Открытие регистрации</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && fieldErrors.registrationOpensAt && "border-negative")}
                value={form.registrationOpensAt}
                onChange={(event) => update("registrationOpensAt", event.target.value)}
              />
              {attempted && fieldErrors.registrationOpensAt && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.registrationOpensAt}</span>
              )}
            </label>
            <label className="block">
              <span className="field-label">Закрытие регистрации</span>
              <input
                type="datetime-local"
                className={cn("field", attempted && fieldErrors.registrationClosesAt && "border-negative")}
                value={form.registrationClosesAt}
                onChange={(event) => update("registrationClosesAt", event.target.value)}
              />
              {attempted && fieldErrors.registrationClosesAt && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.registrationClosesAt}</span>
              )}
            </label>
          </div>
        </Panel>

        <Panel title="Площадка и условия" description="Адрес, корты, взнос и регламент.">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Название площадки</span>
                <input
                  className={cn("field", attempted && fieldErrors.venueName && "border-negative")}
                  value={form.venueName}
                  maxLength={TOURNAMENT_LIMITS.venueNameMax}
                  onChange={(event) => update("venueName", event.target.value)}
                />
                {attempted && fieldErrors.venueName && (
                  <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.venueName}</span>
                )}
              </label>
              <label className="block">
                <span className="field-label">Адрес</span>
                <input
                  className={cn("field", attempted && fieldErrors.venueAddress && "border-negative")}
                  value={form.venueAddress}
                  maxLength={TOURNAMENT_LIMITS.venueAddressMax}
                  onChange={(event) => update("venueAddress", event.target.value)}
                />
                {attempted && fieldErrors.venueAddress && (
                  <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.venueAddress}</span>
                )}
              </label>
              <label className="block">
                <span className="field-label">Кортов</span>
                <input
                  type="number"
                  min={1}
                  max={32}
                  className="field"
                  value={form.venueCourts}
                  onChange={(event) => update("venueCourts", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="field-label">Покрытие площадки</span>
                <select
                  className="field"
                  value={form.venueSurface}
                  onChange={(event) => update("venueSurface", event.target.value as Surface)}
                >
                  {SURFACES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Взнос, ₽</span>
                <input
                  type="number"
                  min={TOURNAMENT_LIMITS.entryFeeMin}
                  max={TOURNAMENT_LIMITS.entryFeeMax}
                  step={100}
                  className={cn("field", attempted && fieldErrors.entryFee && "border-negative")}
                  value={form.entryFee}
                  onChange={(event) => update("entryFee", event.target.value)}
                />
                {attempted && fieldErrors.entryFee && (
                  <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.entryFee}</span>
                )}
              </label>
              <label className="block">
                <span className="field-label">Максимум участников</span>
                <input
                  type="number"
                  min={TOURNAMENT_LIMITS.maxParticipantsMin}
                  max={TOURNAMENT_LIMITS.maxParticipantsMax}
                  className={cn("field", attempted && fieldErrors.maxParticipants && "border-negative")}
                  value={form.maxParticipants}
                  onChange={(event) => update("maxParticipants", event.target.value)}
                />
                {attempted && fieldErrors.maxParticipants && (
                  <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.maxParticipants}</span>
                )}
              </label>
            </div>
            <label className="block">
              <span className="field-label">Регламент</span>
              <textarea
                className={cn("field min-h-[132px] resize-y", attempted && fieldErrors.regulations && "border-negative")}
                value={form.regulations}
                maxLength={TOURNAMENT_LIMITS.regulationsMax}
                onChange={(event) => update("regulations", event.target.value)}
              />
              <span className="mt-1 block text-[0.62rem] tabular-nums text-ink-faint">
                {form.regulations.trim().length}/{TOURNAMENT_LIMITS.regulationsMax}
              </span>
              {attempted && fieldErrors.regulations && (
                <span className="mt-1 block text-[0.68rem] text-negative">{fieldErrors.regulations}</span>
              )}
            </label>
          </div>
        </Panel>
      </div>

      <aside className="space-y-6">
        <Panel title="Публикация" description="Статус управляет видимостью и приёмом заявок.">
          <label className="block">
            <span className="field-label">Статус</span>
            <select
              className="field"
              value={form.status}
              onChange={(event) => update("status", event.target.value as TournamentStatus)}
            >
              {TOURNAMENT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-muted">
            Черновик и скрытый турнир не видны на публичном сайте. Скрыть и удалить турнир можно в его карточке.
          </p>

          {error && (
            <p role="alert" className="mt-3 border border-negative/40 px-3 py-2 text-[0.7rem] text-negative">
              {error}
            </p>
          )}

          <div className="mt-4 space-y-2 border-t border-line pt-4">
            <AutosaveIndicator state={saveState} className="mb-2" />
            <button type="submit" className={cn("btn btn-primary w-full")} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {busy ? "Сохранение…" : "Сохранить изменения"}
            </button>
            <Link href={`/organizer/tournaments/${tournament.id}`} className="btn btn-secondary w-full">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Отмена
            </Link>
          </div>
        </Panel>
      </aside>
    </form>
  );
}
