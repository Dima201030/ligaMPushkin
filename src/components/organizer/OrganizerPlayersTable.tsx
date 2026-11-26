"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Plus, Search, ShieldCheck, Trash2, Trophy } from "lucide-react";
import type { CategorySlug, Player, ProfileVerificationStatus } from "@/lib/types";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, formatDateShort, winRate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { confirmPlayerVerification, updateOrganizerPlayer } from "@/lib/api/organizer-ratings";
import { deleteOrganizerPlayer } from "@/lib/api/organizer-players";
import { validateBirthAge } from "@/lib/club-limits";
import { DemoNote } from "./OrganizerUI";

type Sort = "rating" | "name" | "points" | "matches";

function verificationLabel(status?: ProfileVerificationStatus) {
  switch (status) {
    case "approved":
      return "Подтверждён";
    case "rejected":
      return "Отклонён";
    default:
      return "Ожидает";
  }
}

function resolveBirthDate(
  player: Player,
  birthDates: Record<string, string>,
): string {
  return (
    birthDates[player.id] ||
    player.birthDate ||
    (player.birthYear > 1900 ? `${player.birthYear}-01-01` : "")
  );
}

export function OrganizerPlayersTable({ players }: { players: Player[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [categories, setCategories] = useState<Record<string, CategorySlug>>({});
  const [verification, setVerification] = useState<Record<string, ProfileVerificationStatus>>({});
  const [birthDates, setBirthDates] = useState<Record<string, string>>({});
  const [rowsOverride, setRowsOverride] = useState<Player[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorPlayerId, setErrorPlayerId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const birthInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const sourcePlayers = rowsOverride ?? players;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sourcePlayers
      .map((player) => ({
        ...player,
        category: categories[player.id] ?? player.category,
        verificationStatus: verification[player.id] ?? player.verificationStatus ?? "pending",
        birthDate: birthDates[player.id] ?? player.birthDate,
        birthYear: (() => {
          const bd = birthDates[player.id] ?? player.birthDate;
          if (bd) return Number(bd.slice(0, 4)) || player.birthYear;
          return player.birthYear;
        })(),
      }))
      .filter((player) => {
        return (
          (category === "all" || player.category === category) &&
          (needle
            ? `${player.firstName} ${player.lastName} ${player.slug} ${player.city}`.toLowerCase().includes(needle)
            : true)
        );
      })
      .sort((a, b) => {
        if (sort === "name") return a.lastName.localeCompare(b.lastName, "ru");
        if (sort === "points") return b.points - a.points;
        if (sort === "matches") return b.wins + b.losses - (a.wins + a.losses);
        return b.rating - a.rating;
      });
  }, [sourcePlayers, categories, verification, birthDates, query, category, sort]);

  async function erasePlayer(player: Player) {
    const label = `${player.lastName} ${player.firstName}`.trim();
    if (
      !window.confirm(
        `Удалить ${label}?\n\nАккаунт будет обезличен («Удалённый аккаунт») и исчезнет из участников, рейтинга, игроков и активных заявок.`,
      )
    ) {
      return;
    }
    setDeletingId(player.id);
    setError(null);
    const result = await deleteOrganizerPlayer(player.id);
    setDeletingId(null);
    if (!result.ok) {
      showFeedback(result.error, "error", player.id);
      return;
    }
    setRowsOverride((current) => (current ?? players).filter((item) => item.id !== player.id));
    showFeedback(`${label} удалён и обезличен во всех списках.`, "notice");
    router.refresh();
  }

  function showFeedback(message: string, kind: "error" | "notice", playerId?: string) {
    if (kind === "error") {
      setNotice(null);
      setError(message);
      setErrorPlayerId(playerId ?? null);
    } else {
      setError(null);
      setErrorPlayerId(null);
      setNotice(message);
    }
    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  async function changeCategory(player: Player, next: CategorySlug) {
    setError(null);
    setErrorPlayerId(null);
    try {
      const result = await updateOrganizerPlayer(player.id, { level: next });
      if (!result.ok) {
        showFeedback(result.error, "error", player.id);
        return;
      }
      setCategories((current) => ({ ...current, [player.id]: next }));
      showFeedback(
        `${player.firstName} ${player.lastName} переведён в категорию ${CATEGORY_BY_SLUG[next].name}.`,
        "notice",
      );
    } catch {
      showFeedback("Не удалось сменить категорию. Проверьте соединение и сессию организатора.", "error", player.id);
    }
  }

  async function verifyPlayer(player: Player, status: "approved" | "rejected") {
    setVerifyingId(player.id);
    const birthDate = resolveBirthDate(player, birthDates);
    if (status === "approved") {
      const ageError =
        !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)
          ? `Укажите дату рождения для ${player.lastName} ${player.firstName}, затем нажмите «Подтвердить» ещё раз.`
          : validateBirthAge(birthDate);
      if (ageError) {
        showFeedback(ageError, "error", player.id);
        birthInputRefs.current[player.id]?.focus();
        setVerifyingId(null);
        return;
      }
    }
    try {
      const result = await confirmPlayerVerification(player.id, {
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: birthDate || "1970-01-01",
        level: categories[player.id] ?? player.category,
        phone: player.phone,
        status,
      });
      if (!result.ok) {
        showFeedback(result.error, "error", player.id);
        return;
      }
      setVerification((current) => ({ ...current, [player.id]: status }));
      if (birthDate) setBirthDates((current) => ({ ...current, [player.id]: birthDate }));
      showFeedback(
        status === "approved"
          ? `${player.lastName} ${player.firstName}: профиль подтверждён, игрок может записываться на турниры.`
          : `${player.lastName} ${player.firstName}: подтверждение профиля отклонено.`,
        "notice",
      );
    } catch {
      showFeedback(
        "Не удалось подтвердить профиль. Проверьте соединение и что вы вошли как организатор.",
        "error",
        player.id,
      );
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div ref={feedbackRef} className="space-y-2">
        {error && (
          <DemoNote className="text-negative">
            {error}
          </DemoNote>
        )}
        {notice && (
          <DemoNote>
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{notice}</span>
            </span>
          </DemoNote>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Поиск игрока</span>
          <Search className="pointer-events-none absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <input
            className="field min-h-[36px] border-0 border-b border-line bg-transparent pl-6 text-xs focus:border-ink"
            placeholder="Имя, фамилия или город"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="field min-h-[36px] w-auto border-0 border-b border-line bg-transparent text-xs focus:border-ink"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Категория"
        >
          <option value="all">Все категории</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
        <select
          className="field min-h-[36px] w-auto border-0 border-b border-line bg-transparent text-xs focus:border-ink"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          aria-label="Сортировка"
        >
          <option value="rating">По рейтингу</option>
          <option value="points">По очкам</option>
          <option value="matches">По числу матчей</option>
          <option value="name">По фамилии</option>
        </select>
        <Link href="/organizer/applications" className="btn btn-secondary btn-sm ml-auto">
          <Plus className="size-3.5" aria-hidden="true" />
          Заявки / объединение
        </Link>
      </div>

      <p className="text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
        {rows.length} из {players.length} игроков · заготовки без email объединяйте с заявками во вкладке «Заявки»
      </p>

      <div className="border-y border-line">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1100px]">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Игрок</th>
                <th>Категория</th>
                <th>Дата рождения</th>
                <th>Верификация</th>
                <th className="text-right">Рейтинг</th>
                <th className="text-right">Очки</th>
                <th className="text-right">Матчи</th>
                <th className="text-right">Процент побед</th>
                <th className="text-right">Турниры</th>
                <th>На платформе с</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((player, index) => {
                const rate = winRate(player.wins, player.losses);
                const status = player.verificationStatus ?? "pending";
                return (
                  <tr key={player.id}>
                    <td className="text-[0.64rem] tabular-nums text-ink-faint">{index + 1}</td>
                    <td className="min-w-[200px]">
                      <Link href={`/players/${player.slug}`} className="group flex items-center gap-2.5">
                        <Avatar
                          firstName={player.firstName}
                          lastName={player.lastName}
                          src={player.avatarUrl}
                          size="sm"
                        />
                        <span>
                          <span className="block text-[0.78rem] font-medium text-ink transition-opacity group-hover:opacity-60">
                            {player.lastName} {player.firstName}
                          </span>
                          <span className="block text-[0.6rem] text-ink-faint">
                            {player.isPlaceholder ? "без аккаунта" : player.city}
                            {!player.isPlaceholder && player.birthYear > 1900 ? ` · ${player.birthYear} г.` : ""}
                            {player.isPlaceholder ? (
                              <span className="ml-1.5 uppercase tracking-[0.08em] text-warning">заготовка</span>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <label className="block">
                        <span className="sr-only">Категория {player.firstName} {player.lastName}</span>
                        <select
                          className="field min-h-[28px] w-[124px] border-0 border-b border-line bg-transparent px-1 py-0.5 text-[0.66rem] focus:border-ink"
                          value={player.category}
                          onChange={(event) => changeCategory(player, event.target.value as CategorySlug)}
                        >
                          {CATEGORIES.map((item) => (
                            <option key={item.slug} value={item.slug}>{item.name}</option>
                          ))}
                        </select>
                      </label>
                    </td>
                    <td>
                      <label className="block">
                        <span className="sr-only">Дата рождения {player.firstName} {player.lastName}</span>
                        <input
                          ref={(node) => {
                            birthInputRefs.current[player.id] = node;
                          }}
                          type="date"
                          className={cn(
                            "field min-h-[28px] w-[132px] border-0 border-b bg-transparent px-1 py-0.5 text-[0.66rem] focus:border-ink",
                            errorPlayerId === player.id ? "border-negative text-negative" : "border-line",
                          )}
                          value={player.birthDate || ""}
                          onChange={(event) => {
                            setBirthDates((current) => ({ ...current, [player.id]: event.target.value }));
                            if (errorPlayerId === player.id) {
                              setError(null);
                              setErrorPlayerId(null);
                            }
                          }}
                        />
                      </label>
                    </td>
                    <td className="min-w-[160px]">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={cn(
                            "text-[0.62rem] uppercase tracking-[0.1em]",
                            status === "approved" && "text-positive",
                            status === "rejected" && "text-negative",
                            status === "pending" && "text-ink-muted",
                          )}
                        >
                          {verificationLabel(status)}
                        </span>
                        {status !== "approved" && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={verifyingId === player.id}
                              onClick={() => void verifyPlayer(player, "approved")}
                            >
                              <ShieldCheck className="size-3" aria-hidden="true" />
                              {verifyingId === player.id ? "Сохраняем…" : "Подтвердить"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={verifyingId === player.id}
                              onClick={() => void verifyPlayer(player, "rejected")}
                            >
                              Отклонить
                            </button>
                          </div>
                        )}
                        {errorPlayerId === player.id && error ? (
                          <p role="alert" className="max-w-[180px] text-[0.58rem] leading-snug text-negative">
                            {error}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="text-right text-[0.76rem] tabular-nums text-ink">{player.rating}</td>
                    <td className="text-right text-[0.72rem] tabular-nums text-ink-soft">{player.points}</td>
                    <td className="text-right text-[0.7rem] tabular-nums text-ink-soft">
                      {player.wins}–{player.losses}
                    </td>
                    <td className="text-right">
                      <span className={cn("text-[0.7rem] tabular-nums", rate >= 60 ? "text-positive" : "text-ink-soft")}>
                        {rate}%
                      </span>
                    </td>
                    <td className="text-right text-[0.7rem] tabular-nums text-ink-soft">
                      {player.tournamentsCount}
                      {player.titlesCount > 0 && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-[0.58rem] text-warning">
                          <Trophy className="size-3" aria-hidden="true" />
                          {player.titlesCount}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-[0.66rem] text-ink-muted">
                      {formatDateShort(player.memberSince)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/players/${player.slug}`}
                          className="grid size-7 place-items-center text-ink-faint transition-colors hover:text-ink"
                          title="Открыть профиль"
                          aria-label={`Профиль ${player.firstName} ${player.lastName}`}
                        >
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          className="grid size-7 place-items-center text-ink-faint transition-colors hover:text-negative"
                          title="Удалить аккаунт"
                          aria-label={`Удалить ${player.firstName} ${player.lastName}`}
                          disabled={deletingId === player.id}
                          onClick={() => void erasePlayer(player)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium">Игроки не найдены</p>
            <p className="mt-1 text-xs text-ink-muted">Измените запрос или категорию.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {CATEGORIES.map((item) => {
          const count = sourcePlayers.filter((player) => (categories[player.id] ?? player.category) === item.slug).length;
          if (!count) return null;
          return (
            <span key={item.slug} className="inline-flex items-baseline gap-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
              <span className="size-1.5 self-center" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.name}
              <span className="tabular-nums text-ink">{count}</span>
            </span>
          );
        })}
      </div>

    </div>
  );
}
