"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Bell, Check } from "lucide-react";
import { cn, formatDate, formatDateShort, formatDayMonth } from "@/lib/utils";
import { CATEGORIES, REGISTRATION_STATUS_LABEL } from "@/lib/domain";
import type { CategorySlug, RegistrationStatus } from "@/lib/types";
import { cancelRegistration } from "@/lib/api/tournaments";
import {
  type NotificationPrefs,
  updateMyNotifications,
  updateMyProfile,
} from "@/lib/api/auth";

export interface CabinetRegistration {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  status: RegistrationStatus;
  partner?: string;
  fee: number;
}

const STATUS_TONE: Record<string, string> = {
  confirmed: "badge-positive",
  pending: "badge-warning",
  waitlist: "badge-neutral",
  cancelled: "badge-negative",
  rejected: "badge-negative",
};

export function MyRegistrations({ items }: { items: CabinetRegistration[] }) {
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function cancel(item: CabinetRegistration) {
    setBusyId(item.id);
    setError(null);
    setNotice(null);
    const result = await cancelRegistration(item.slug);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCancelled((current) => [...current, item.id]);
    setNotice(`Заявка на «${item.title}» отменена.`);
  }

  return (
    <div>
      <div className="divide-y divide-divider">
        {items.map((item) => {
          const isCancelled = cancelled.includes(item.id);
          const date = new Date(item.startsAt);
          return (
            <div key={item.id} className="grid grid-cols-[3rem_1fr] items-start gap-x-4 gap-y-3 px-4 py-4 sm:flex sm:flex-wrap sm:items-center sm:gap-4 md:px-5">
              <div className="row-span-2 grid size-12 shrink-0 place-items-center border border-line text-center sm:row-span-1">
                <span className="display text-base leading-none">{date.getDate()}</span>
                <span className="mt-1 text-[0.52rem] uppercase tracking-[0.12em] text-ink-muted">
                  {formatDayMonth(date).split(" ")[1].slice(0, 3)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/tournaments/${item.slug}`}
                  className="text-sm font-bold text-ink transition-colors hover:text-accent"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-[0.68rem] text-ink-muted">
                  {formatDate(date)} · {item.fee ? `${item.fee.toLocaleString("ru-RU")} ₽` : "бесплатно"}
                  {item.partner && <> · пара: {item.partner}</>}
                </p>
              </div>

              <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto sm:ml-auto">
                <span className={cn("badge", isCancelled ? "badge-negative" : STATUS_TONE[item.status])}>
                  {isCancelled ? "Отменена" : REGISTRATION_STATUS_LABEL[item.status]}
                </span>

                {!isCancelled && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-negative hover:bg-negative-soft hover:text-negative"
                    disabled={busyId === item.id}
                    onClick={() => cancel(item)}
                  >
                    {busyId === item.id ? "Отмена…" : "Отменить"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mx-4 mb-4 text-[0.7rem] text-negative md:mx-5">
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mx-4 mb-4 flex items-start gap-2 rounded-md border border-accent-line bg-accent-soft px-3 py-2 text-[0.7rem] leading-relaxed text-accent-strong md:mx-5"
        >
          <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </p>
      )}
    </div>
  );
}

const NOTIFICATIONS: { id: keyof NotificationPrefs; label: string; hint: string }[] = [
  { id: "tournaments", label: "Новые турниры", hint: "Когда открывается регистрация" },
  { id: "reminders", label: "Напоминания о матчах", hint: "За 24 часа до игры" },
  { id: "results", label: "Результаты и рейтинг", hint: "После публикации результатов" },
  { id: "news", label: "Дайджест платформы", hint: "Раз в две недели" },
];

export function ProfileSettingsForm({
  email,
  firstName,
  lastName,
  phone,
  city,
  bio,
  category,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  bio: string;
  category: CategorySlug;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setNotice(null);
    const result = await updateMyProfile({
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      city: String(form.get("city") ?? ""),
      bio: String(form.get("bio") ?? ""),
      level: String(form.get("category") ?? category) as CategorySlug,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Профиль сохранён.");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl">Профиль</h2>
      <p className="text-sm text-ink-muted">
        Имя, телефон, город и категория. Email меняется через организатора.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Имя</span>
          <input className="field" name="firstName" defaultValue={firstName} required autoComplete="given-name" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Фамилия</span>
          <input className="field" name="lastName" defaultValue={lastName} required autoComplete="family-name" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Email</span>
        <input className="field" value={email} disabled readOnly />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Телефон</span>
          <input className="field" name="phone" defaultValue={phone} autoComplete="tel" placeholder="+7…" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Город</span>
          <input className="field" name="city" defaultValue={city} autoComplete="address-level2" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">Категория</span>
        <select className="field" name="category" defaultValue={category}>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">О себе</span>
        <textarea className="field min-h-24" name="bio" defaultValue={bio} maxLength={500} />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Сохраняем…" : "Сохранить профиль"}
        </button>
        {notice ? (
          <p role="status" className="flex items-center gap-1.5 text-[0.72rem] text-positive">
            <Check className="size-3.5" aria-hidden="true" />
            {notice}
          </p>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-[0.72rem] text-negative">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-ink-muted">
        Документы:{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          политика ПДн
        </Link>
        ,{" "}
        <Link href="/consent" className="text-accent hover:underline">
          согласия
        </Link>
        .
      </p>
    </form>
  );
}

export function NotificationSettings({ initial }: { initial: NotificationPrefs }) {
  const [enabled, setEnabled] = useState<NotificationPrefs>(initial);
  const [busyKey, setBusyKey] = useState<keyof NotificationPrefs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function toggle(id: keyof NotificationPrefs) {
    const next = !enabled[id];
    setBusyKey(id);
    setError(null);
    setNotice(null);
    const result = await updateMyNotifications({ [id]: next });
    setBusyKey(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEnabled(result.notifications);
    setNotice("Настройки уведомлений сохранены.");
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-ink-muted" aria-hidden="true" />
        <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Уведомления</p>
      </div>
      <ul className="mt-3">
        {NOTIFICATIONS.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 border-b border-divider py-2.5 last:border-b-0">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink">{item.label}</p>
              <p className="text-[0.64rem] text-ink-faint">{item.hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled[item.id]}
              aria-label={item.label}
              disabled={busyKey === item.id}
              onClick={() => void toggle(item.id)}
              className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60",
                enabled[item.id] ? "bg-accent" : "bg-line-strong",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
                  enabled[item.id] ? "left-0.5 translate-x-4" : "left-0.5",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p role="alert" className="mt-2 text-[0.62rem] text-negative">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mt-2 flex items-start gap-2 text-[0.62rem] leading-relaxed text-positive">
          <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </p>
      ) : (
        <p className="mt-2 text-[0.62rem] leading-relaxed text-ink-faint">
          Предпочтения сохраняются в профиле на сервере и действуют на всех устройствах.
        </p>
      )}
    </div>
  );
}

export function RatingHistoryTable({
  rows,
}: {
  rows: { id: string; match: string; date: string; delta: number; after: number; reason: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Матч</th>
            <th>Дата</th>
            <th className="text-right">Изменение</th>
            <th className="text-right">Рейтинг</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <p className="font-semibold text-ink">{row.match}</p>
                <p className="mt-0.5 text-[0.66rem] text-ink-muted">{row.reason}</p>
              </td>
              <td className="whitespace-nowrap text-ink-muted">{formatDateShort(row.date)}</td>
              <td className={cn("whitespace-nowrap text-right font-bold tabular-nums", row.delta >= 0 ? "text-positive" : "text-negative")}>
                {row.delta > 0 ? "+" : ""}
                {row.delta}
              </td>
              <td className="whitespace-nowrap text-right font-bold tabular-nums">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
