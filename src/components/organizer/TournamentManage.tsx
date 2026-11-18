"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import type { CategorySlug, RegistrationStatus, TournamentStatus } from "@/lib/types";
import { updateOrganizerTournament } from "@/lib/api/tournaments";
import { REGISTRATION_STATUS_LABEL, FORMAT_LABEL, STATUS_BY_VALUE } from "@/lib/domain";
import { cn, formatDateTime, formatMoney } from "@/lib/utils";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";
import { Avatar } from "@/components/ui/Avatar";
import { DemoNote, MiniLabel, Panel } from "./OrganizerUI";

/* ───────────────────────────── status panel ──────────────────────────────── */

const NEXT_ACTION: Partial<
  Record<TournamentStatus, { next: TournamentStatus; label: string; hint: string }>
> = {
  draft: { next: "registration_soon", label: "Опубликовать анонс", hint: "Турнир появится на сайте" },
  registration_soon: { next: "registration_open", label: "Открыть регистрацию", hint: "Игроки смогут подавать заявки" },
  registration_open: { next: "registration_closed", label: "Закрыть регистрацию", hint: "Заявки больше не принимаются" },
  registration_closed: { next: "live", label: "Начать турнир", hint: "Матчи станут активными" },
  live: { next: "completed", label: "Завершить турнир", hint: "Результаты уйдут в рейтинг" },
};

export function TournamentStatusPanel({
  status: initialStatus,
  tournament,
  participantCount,
  matchCount,
}: {
  status: TournamentStatus;
  tournament: { id: string; slug: string; title: string; format: string; startsAt: string; registrationClosesAt: string };
  participantCount: number;
  matchCount: number;
}) {
  const [status, setStatus] = useState<TournamentStatus>(initialStatus);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const action = NEXT_ACTION[status];

  async function advance() {
    if (!action) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await updateOrganizerTournament(tournament.id, { status: action.next });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus(result.tournament.status);
    setNotice(`${action.label}. Новый статус: «${STATUS_BY_VALUE[result.tournament.status].label}».`);
  }

  const checklist = [
    { label: "Карточка и регламент заполнены", done: true },
    { label: "Участники добавлены", done: participantCount > 0 },
    { label: "Матчи в расписании", done: matchCount > 0 },
    { label: "Регистрация закрыта", done: ["registration_closed", "scheduled", "live", "completed"].includes(status) },
  ];

  return (
    <Panel title="Статус турнира" description="Управляйте жизненным циклом соревнования">
      <StatusPill status={status} />
      <div className="mt-4 space-y-2 border-t border-line pt-4 text-[0.7rem] text-ink-muted">
        <p className="flex justify-between gap-2">
          <span>Старт</span>
          <span className="text-ink">{formatDateTime(tournament.startsAt)}</span>
        </p>
        <p className="flex justify-between gap-2">
          <span>Дедлайн</span>
          <span className="text-ink">{formatDateTime(tournament.registrationClosesAt)}</span>
        </p>
        <p className="flex justify-between gap-2">
          <span>Формат</span>
          <span className="text-ink">{FORMAT_LABEL[tournament.format as keyof typeof FORMAT_LABEL]}</span>
        </p>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <MiniLabel>Готовность</MiniLabel>
        <ul className="mt-2 space-y-1.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-[0.68rem]">
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center border",
                  item.done ? "border-positive text-positive" : "border-line text-ink-faint",
                )}
              >
                <Check className="size-2.5" aria-hidden="true" />
              </span>
              <span className={item.done ? "text-ink-soft" : "text-ink-muted"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        {action && (
          <button type="button" className="btn btn-primary w-full" onClick={advance} disabled={busy}>
            {busy ? "Сохранение…" : action.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
        {status === "completed" && (
          <p className="border-y border-line py-2 text-center text-[0.68rem] text-positive">
            Турнир завершён, результаты опубликованы
          </p>
        )}
        <Link href={`/tournaments/${tournament.slug}`} className="btn btn-secondary w-full">
          Публичная страница
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-3 border border-accent-line bg-accent-soft px-3 py-2 text-[0.7rem] text-accent-strong">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 border border-negative/40 px-3 py-2 text-[0.7rem] text-negative">
          {error}
        </p>
      )}
    </Panel>
  );
}

/* ─────────────────────────── participants manager ───────────────────────── */

export interface ManageParticipant {
  playerId: string;
  firstName: string;
  lastName: string;
  slug: string;
  category: CategorySlug;
  rating: number;
  status: RegistrationStatus;
  seed?: number;
  partnerName?: string;
  registeredAt: string;
}

const TONE: Record<RegistrationStatus, string> = {
  confirmed: "badge-positive",
  pending: "badge-warning",
  waitlist: "badge-neutral",
  cancelled: "badge-negative",
  rejected: "badge-negative",
};

const TABS: { value: "all" | RegistrationStatus; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "confirmed", label: "Подтверждены" },
  { value: "pending", label: "На подтверждении" },
  { value: "waitlist", label: "Лист ожидания" },
  { value: "cancelled", label: "Отменены" },
  { value: "rejected", label: "Отклонены" },
];

export function ParticipantsManager({
  tournamentId,
  tournamentTitle,
  participants,
  maxParticipants,
  entryFee,
}: {
  tournamentId: string;
  tournamentTitle: string;
  participants: ManageParticipant[];
  maxParticipants: number;
  entryFee: number;
}) {
  const [statuses, setStatuses] = useState<Record<string, RegistrationStatus>>({});
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      participants.map((participant) => ({
        ...participant,
        status: statuses[participant.playerId] ?? participant.status,
      })),
    [participants, statuses],
  );

  const filtered = rows.filter((row) => {
    const needle = query.trim().toLowerCase();
    return (
      (tab === "all" || row.status === tab) &&
      (needle ? `${row.firstName} ${row.lastName}`.toLowerCase().includes(needle) : true)
    );
  });

  const confirmed = rows.filter((row) => row.status === "confirmed").length;
  const pending = rows.filter((row) => row.status === "pending").length;
  const waitlist = rows.filter((row) => row.status === "waitlist").length;
  const full = confirmed >= maxParticipants;

  function setStatus(row: ManageParticipant, status: RegistrationStatus) {
    setStatuses((current) => ({ ...current, [row.playerId]: status }));
    const messages: Record<RegistrationStatus, string> = {
      confirmed: `${row.firstName} ${row.lastName} переведён в основной состав.`,
      pending: `${row.firstName} ${row.lastName} возвращён на подтверждение.`,
      waitlist: `${row.firstName} ${row.lastName} переведён в лист ожидания.`,
      rejected: `${row.firstName} ${row.lastName} — заявка отклонена, место освобождено.`,
      cancelled: `Заявка ${row.firstName} ${row.lastName} отменена.`,
    };
    setNotice(messages[status]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-b border-line py-3">
        <div className="no-scrollbar flex flex-1 flex-wrap gap-x-5 gap-y-2 overflow-x-auto">
          {TABS.map((item) => {
            const count = item.value === "all" ? rows.length : rows.filter((row) => row.status === item.value).length;
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
                <span className="text-[0.55rem] tabular-nums text-ink-faint">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full sm:w-52">
          <span className="sr-only">Поиск игрока</span>
          <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <input
            className="field min-h-[32px] border-0 border-b border-line bg-transparent pl-5 text-xs focus:border-ink"
            placeholder="Найти игрока"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setNotice("Добавление игрока вручную появится после подключения базы данных.")}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Добавить
        </button>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 border-b border-line py-2.5 text-[0.64rem] text-ink-muted">
        <span>
          Основной состав: <span className="tabular-nums text-ink">{confirmed}/{maxParticipants}</span>
          {full && <span className="ml-1 text-warning">· мест нет</span>}
        </span>
        <span>Ожидают: <span className="tabular-nums text-ink">{pending}</span></span>
        <span>Лист ожидания: <span className="tabular-nums text-ink">{waitlist}</span></span>
        <span className="ml-auto">Собрано взносов: <span className="tabular-nums text-ink">{formatMoney(confirmed * entryFee)}</span></span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-[820px]">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Игрок</th>
              <th>Категория</th>
              <th className="text-right">Рейтинг</th>
              <th>Партнёр</th>
              <th>Подана</th>
              <th>Статус</th>
              <th className="text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr key={row.playerId}>
                <td className="text-[0.66rem] tabular-nums text-ink-faint">
                  {row.seed ?? index + 1}
                </td>
                <td>
                  <Link href={`/players/${row.slug}`} className="group flex items-center gap-2.5">
                    <Avatar firstName={row.firstName} lastName={row.lastName} size="sm" />
                    <span>
                      <span className="block text-[0.78rem] font-medium text-ink transition-opacity group-hover:opacity-60">{row.firstName} {row.lastName}</span>
                      <span className="block text-[0.6rem] text-ink-faint">{row.playerId}</span>
                    </span>
                  </Link>
                </td>
                <td><CategoryBadge category={row.category} withName={false} /></td>
                <td className="text-right text-[0.72rem] tabular-nums">{row.rating}</td>
                <td className="text-[0.7rem] text-ink-soft">{row.partnerName ?? "—"}</td>
                <td className="whitespace-nowrap text-[0.66rem] text-ink-muted">
                  {new Date(row.registeredAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                </td>
                <td>
                  <span className={cn("badge", TONE[row.status])}>{REGISTRATION_STATUS_LABEL[row.status]}</span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    {row.status !== "confirmed" && (
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-line text-positive transition-colors hover:border-positive"
                        title="Подтвердить"
                        aria-label={`Подтвердить ${row.firstName} ${row.lastName}`}
                        onClick={() => setStatus(row, "confirmed")}
                      >
                        <UserCheck className="size-3.5" />
                      </button>
                    )}
                    {row.status === "confirmed" && (
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                        title="Перевести в лист ожидания"
                        aria-label={`Перевести ${row.firstName} ${row.lastName} в лист ожидания`}
                        onClick={() => setStatus(row, "waitlist")}
                      >
                        <Clock className="size-3.5" />
                      </button>
                    )}
                    {row.status !== "rejected" && row.status !== "cancelled" ? (
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-line text-negative transition-colors hover:border-negative"
                        title="Отклонить заявку"
                        aria-label={`Отклонить заявку ${row.firstName} ${row.lastName}`}
                        onClick={() => setStatus(row, "rejected")}
                      >
                        <UserX className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="grid size-7 place-items-center border border-line text-ink-muted transition-colors hover:border-ink hover:text-ink"
                        title="Вернуть заявку"
                        aria-label={`Вернуть заявку ${row.firstName} ${row.lastName}`}
                        onClick={() => setStatus(row, "pending")}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium">Игроки не найдены</p>
          <p className="mt-1 text-xs text-ink-muted">Сбросьте поиск или выберите другой статус.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3">
        <p className="text-[0.64rem] text-ink-faint">
          Турнир «{tournamentTitle}» · {rows.length} заявок
        </p>
        <Link href={`/organizer/tournaments/${tournamentId}`} className="link-arrow text-[0.7rem]">
          Карточка турнира
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {notice && (
        <div className="pb-2 pt-2">
          <DemoNote>
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{notice} Демо-режим: данные не сохраняются.</span>
            </span>
          </DemoNote>
        </div>
      )}
    </div>
  );
}
