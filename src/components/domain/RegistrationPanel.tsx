"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, Users } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { cancelRegistration, createRegistration } from "@/lib/api/tournaments";
import { formatDateTime, relativeDeadline } from "@/lib/utils";

export function RegistrationPanel({
  tournament,
  initiallyRegistered,
  initialStatus,
  isAuthenticated,
  isApproved,
}: {
  tournament: Tournament;
  initiallyRegistered: boolean;
  initialStatus?: string;
  isAuthenticated: boolean;
  isApproved: boolean;
}) {
  const [registered, setRegistered] = useState(initiallyRegistered);
  const [status, setStatus] = useState(initialStatus);
  const isPairs = ["doubles", "mixed", "teams"].includes(tournament.type);
  const [lookingForPartner, setLookingForPartner] = useState(isPairs);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmed = tournament.participants.filter(
    (item) => item.status === "confirmed" || item.status === "pending",
  ).length;
  const free = Math.max(0, tournament.maxParticipants - confirmed);
  const isOpen = tournament.status === "registration_open";
  const isCompleted = tournament.status === "completed";

  async function register() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await createRegistration(tournament.slug, {
      lookingForPartner: isPairs ? lookingForPartner : false,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRegistered(true);
    setStatus(result.status);
    setNotice(
      result.status === "waitlist"
        ? "Мест нет — вы добавлены в лист ожидания."
        : "Заявка принята. Место закреплено за вами.",
    );
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await cancelRegistration(tournament.slug);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRegistered(false);
    setStatus(undefined);
    setNotice("Регистрация отменена. Место освобождено для другого игрока.");
  }

  return (
    <aside className="card p-5 md:p-6">
      <p className="eyebrow eyebrow-plain text-[0.65rem]">Участие</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-navy">
            {tournament.entryFee ? `${tournament.entryFee.toLocaleString("ru-RU")} ₽` : "Бесплатно"}
          </p>
          <p className="mt-1 text-xs text-ink-muted">взнос за участие</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold tracking-tight text-navy">{free}</p>
          <p className="mt-1 text-xs text-ink-muted">{isPairs ? "свободных пар" : "свободных мест"}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-divider pt-5 text-xs text-ink-muted">
        <p className="flex items-start gap-2">
          <Clock className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
          <span>
            Дедлайн регистрации:{" "}
            <span className="font-semibold text-ink">{formatDateTime(tournament.registrationClosesAt)}</span>
            {isOpen && (
              <span className="mt-1 block text-accent">({relativeDeadline(tournament.registrationClosesAt)})</span>
            )}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Users className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
          <span>
            Уже заявлено:{" "}
            <span className="font-semibold text-ink">
              {confirmed} из {tournament.maxParticipants}
            </span>{" "}
            {isPairs ? "пар" : "игроков"}
          </span>
        </p>
      </div>

      <div className="mt-5">
        {isCompleted ? (
          <div className="border-y border-line px-4 py-3.5 text-center text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
            Турнир завершён. Результаты доступны ниже.
          </div>
        ) : registered ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 border border-positive/50 px-4 py-3 text-sm font-medium text-positive">
              <Check className="size-4" aria-hidden="true" />
              {status === "waitlist" ? "Вы в листе ожидания" : "Вы записаны на турнир"}
            </div>
            <button type="button" className="btn btn-secondary w-full" onClick={cancel} disabled={busy}>
              Отменить регистрацию
            </button>
          </div>
        ) : !isAuthenticated ? (
          <div className="space-y-2">
            <Link href="/login" className="btn btn-primary w-full">
              Войти, чтобы записаться
            </Link>
            <p className="text-center text-[0.68rem] text-ink-muted">
              Нет аккаунта?{" "}
              <Link href="/register" className="font-semibold text-accent">
                Заявка в лигу
              </Link>
            </p>
          </div>
        ) : !isApproved ? (
          <div className="border border-warning/40 px-4 py-3 text-sm text-ink-soft">
            Запись откроется после подтверждения аккаунта организатором.
          </div>
        ) : (
          <div className="space-y-3">
            {isPairs && isOpen && (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={lookingForPartner}
                  onChange={(event) => setLookingForPartner(event.target.checked)}
                  className="size-3.5 accent-[var(--color-ink)]"
                />
                Ищу партнёра
              </label>
            )}
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={register}
              disabled={!isOpen || busy || (isPairs && !lookingForPartner)}
            >
              {isOpen ? (busy ? "Отправка…" : "Записаться на турнир") : "Регистрация закрыта"}
            </button>
            {isPairs && isOpen && !lookingForPartner && (
              <p className="text-center text-[0.68rem] text-ink-muted">
                Для парного турнира отметьте «ищу партнёра» или дождитесь выбора партнёра в кабинете.
              </p>
            )}
          </div>
        )}
        {!isOpen && !isCompleted && (
          <p className="mt-2 text-center text-[0.68rem] text-ink-muted">
            {tournament.status === "registration_soon"
              ? "Регистрация откроется позже"
              : "Следите за обновлениями"}
          </p>
        )}
      </div>

      {notice && (
        <p
          role="status"
          className="mt-3 rounded-md border border-accent-line bg-accent-soft px-3 py-2 text-[0.7rem] leading-relaxed text-accent-strong"
        >
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md border border-negative/40 px-3 py-2 text-[0.7rem] text-negative">
          {error}
        </p>
      )}
    </aside>
  );
}
