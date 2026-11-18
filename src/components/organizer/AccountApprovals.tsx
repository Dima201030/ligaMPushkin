"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, Mail, UserCheck, X } from "lucide-react";
import {
  approveOrganizerApplication,
  listOrganizerApplications,
  rejectOrganizerApplication,
  type LeagueApplication,
} from "@/lib/api/auth";
import type { CategorySlug } from "@/lib/types";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { DemoNote } from "./OrganizerUI";

interface Draft {
  firstName: string;
  lastName: string;
  level: CategorySlug;
}

const STATUS_BADGE: Record<LeagueApplication["status"], string> = {
  pending: "badge-warning",
  approved: "badge-positive",
  rejected: "badge-negative",
};

const STATUS_LABEL: Record<LeagueApplication["status"], string> = {
  pending: "На проверке",
  approved: "Подтверждён",
  rejected: "Отклонён",
};

export function AccountApprovals() {
  const [accounts, setAccounts] = useState<LeagueApplication[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const list = await listOrganizerApplications();
      setAccounts(list);
      setLoadState("ready");
    } catch {
      setLoadState("error");
      setLoadError("Не удалось загрузить заявки. Проверьте, что API лиги запущен и вы вошли как организатор.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function draftFor(account: LeagueApplication): Draft {
    return (
      drafts[account.id] ?? {
        firstName: account.firstName,
        lastName: account.lastName,
        level: account.level,
      }
    );
  }

  function updateDraft(account: LeagueApplication, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [account.id]: { ...draftFor(account), ...patch },
    }));
  }

  async function approve(account: LeagueApplication) {
    const draft = draftFor(account);
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      setNotice("Имя и фамилия не могут быть пустыми — проверьте данные перед подтверждением.");
      return;
    }

    setBusyId(account.id);
    setNotice(null);
    try {
      await approveOrganizerApplication(account.id, draft);
      setDrafts((current) => {
        const next = { ...current };
        delete next[account.id];
        return next;
      });
      await refresh();
      setNotice(
        `Аккаунт ${draft.firstName} ${draft.lastName} подтверждён. Игрок может войти в кабинет с указанным при регистрации паролем.`,
      );
    } catch {
      setNotice("Не удалось подтвердить заявку. Повторите попытку или проверьте сессию организатора.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(account: LeagueApplication) {
    const name = `${account.firstName} ${account.lastName}`;
    if (!window.confirm(`Отклонить заявку ${name}? Игрок не сможет войти в лигу.`)) return;

    setBusyId(account.id);
    setNotice(null);
    try {
      await rejectOrganizerApplication(account.id);
      await refresh();
      setNotice(`Заявка ${name} отклонена. Игрок увидит статус при попытке входа.`);
    } catch {
      setNotice("Не удалось отклонить заявку. Повторите попытку или проверьте сессию организатора.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = accounts.filter((account) => account.status === "pending");
  const processed = accounts
    .filter((account) => account.status !== "pending")
    .sort((a, b) => +new Date(b.reviewedAt ?? b.submittedAt) - +new Date(a.reviewedAt ?? a.submittedAt))
    .slice(0, 8);

  if (loadState === "loading") {
    return <p className="py-6 text-sm text-ink-muted">Загружаем заявки…</p>;
  }

  if (loadState === "error") {
    return (
      <div className="space-y-4 py-6">
        <p role="alert" className="text-sm text-negative">
          {loadError}
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refresh()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 className="text-[0.95rem] font-medium text-ink">
            Ожидают проверки
            <span className="ml-2 text-ink-faint">{pending.length}</span>
          </h2>
          <p className="text-[0.68rem] text-ink-muted">
            Сверьте имя, фамилию и уровень — эти данные увидит лига.
          </p>
        </div>

        {pending.length === 0 ? (
          <div className="flex items-center gap-3 py-8 text-sm text-ink-muted">
            <UserCheck className="size-5 text-positive" aria-hidden="true" />
            Новых заявок нет. Все аккаунты проверены.
          </div>
        ) : (
          <ul className="divide-y divide-divider">
            {pending.map((account) => {
              const draft = draftFor(account);
              const disabled = busyId === account.id;
              return (
                <li key={account.id} className="py-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <Avatar firstName={draft.firstName} lastName={draft.lastName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-[0.8rem] font-medium text-ink">
                          {draft.firstName || "Без имени"} {draft.lastName}
                        </p>
                        <span className={cn("badge", STATUS_BADGE[account.status])}>
                          {STATUS_LABEL[account.status]}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[0.65rem] text-ink-faint">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {timeAgo(account.submittedAt)}
                        </span>
                      </div>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[0.68rem] text-ink-muted">
                        <Mail className="size-3" aria-hidden="true" />
                        {account.email}
                        {account.phone && <span className="text-ink-faint">· {account.phone}</span>}
                      </p>
                      <p className="mt-1 text-[0.66rem] text-ink-faint">
                        Уровень при регистрации: {CATEGORY_BY_SLUG[account.level]?.name ?? account.level}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={disabled}
                        onClick={() => void approve(account)}
                      >
                        <Check className="size-3.5" aria-hidden="true" />
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm text-negative"
                        disabled={disabled}
                        onClick={() => void reject(account)}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        Отклонить
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <label>
                      <span className="field-label">Имя</span>
                      <input
                        className="field"
                        value={draft.firstName}
                        onChange={(event) => updateDraft(account, { firstName: event.target.value })}
                        autoComplete="off"
                      />
                    </label>
                    <label>
                      <span className="field-label">Фамилия</span>
                      <input
                        className="field"
                        value={draft.lastName}
                        onChange={(event) => updateDraft(account, { lastName: event.target.value })}
                        autoComplete="off"
                      />
                    </label>
                    <label>
                      <span className="field-label">Уровень</span>
                      <select
                        className="field"
                        value={draft.level}
                        onChange={(event) =>
                          updateDraft(account, { level: event.target.value as CategorySlug })
                        }
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.slug} value={category.slug}>
                            {category.name} — {category.note}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {notice && <DemoNote>{notice}</DemoNote>}

      <section>
        <div className="border-b border-line pb-3">
          <h2 className="text-[0.95rem] font-medium text-ink">Проверенные аккаунты</h2>
        </div>
        {processed.length === 0 ? (
          <p className="py-6 text-sm text-ink-muted">Пока никто не проходил проверку.</p>
        ) : (
          <ul className="divide-y divide-divider">
            {processed.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar firstName={account.firstName} lastName={account.lastName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.78rem] font-medium text-ink">
                    {account.firstName} {account.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-[0.65rem] text-ink-muted">
                    {account.email}
                    <span className="mx-1.5 text-ink-faint">·</span>
                    {CATEGORY_BY_SLUG[account.level]?.name ?? account.level}
                    {account.reviewedAt && (
                      <>
                        <span className="mx-1.5 text-ink-faint">·</span>
                        проверено {timeAgo(account.reviewedAt)}
                      </>
                    )}
                  </p>
                </div>
                <span className={cn("badge shrink-0", STATUS_BADGE[account.status])}>
                  {STATUS_LABEL[account.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}