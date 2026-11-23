"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Plus, Search, ShieldCheck, Trophy } from "lucide-react";
import type { CategorySlug, Player, ProfileVerificationStatus } from "@/lib/types";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, formatDateShort, winRate } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { confirmPlayerVerification, updateOrganizerPlayer } from "@/lib/api/organizer-ratings";
import { DemoNote } from "./OrganizerUI";

type Sort = "rating" | "name" | "points" | "matches";

function verificationLabel(status?: ProfileVerificationStatus) {
  switch (status) {
    case "approved":
      return "Верифицирован";
    case "rejected":
      return "Отклонён";
    default:
      return "Ожидает";
  }
}

export function OrganizerPlayersTable({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("rating");
  const [categories, setCategories] = useState<Record<string, CategorySlug>>({});
  const [verification, setVerification] = useState<Record<string, ProfileVerificationStatus>>({});
  const [birthDates, setBirthDates] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return players
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
  }, [players, categories, verification, birthDates, query, category, sort]);

  async function changeCategory(player: Player, next: CategorySlug) {
    setError(null);
    const result = await updateOrganizerPlayer(player.id, { level: next });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCategories((current) => ({ ...current, [player.id]: next }));
    setNotice(
      `${player.firstName} ${player.lastName} переведён в категорию ${CATEGORY_BY_SLUG[next].name}.`,
    );
  }

  async function verifyPlayer(player: Player, status: "approved" | "rejected") {
    setError(null);
    setVerifyingId(player.id);
    const birthDate =
      birthDates[player.id] ||
      player.birthDate ||
      (player.birthYear > 1900 ? `${player.birthYear}-01-01` : "");
    if (status === "approved" && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError("Укажите дату рождения в формате ГГГГ-ММ-ДД перед подтверждением.");
      setVerifyingId(null);
      return;
    }
    const result = await confirmPlayerVerification(player.id, {
      firstName: player.firstName,
      lastName: player.lastName,
      birthDate: birthDate || "1970-01-01",
      level: categories[player.id] ?? player.category,
      phone: player.phone,
      status,
    });
    setVerifyingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setVerification((current) => ({ ...current, [player.id]: status }));
    if (birthDate) setBirthDates((current) => ({ ...current, [player.id]: birthDate }));
    setNotice(
      status === "approved"
        ? `${player.lastName} ${player.firstName}: профиль подтверждён.`
        : `${player.lastName} ${player.firstName}: верификация отклонена.`,
    );
  }

  return (
    <div className="space-y-6">
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
                <th>В лиге с</th>
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
                        <Avatar firstName={player.firstName} lastName={player.lastName} size="sm" />
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
                          type="date"
                          className="field min-h-[28px] w-[132px] border-0 border-b border-line bg-transparent px-1 py-0.5 text-[0.66rem] focus:border-ink"
                          value={player.birthDate || ""}
                          onChange={(event) =>
                            setBirthDates((current) => ({ ...current, [player.id]: event.target.value }))
                          }
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
                              onClick={() => verifyPlayer(player, "approved")}
                            >
                              <ShieldCheck className="size-3" aria-hidden="true" />
                              Подтвердить
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={verifyingId === player.id}
                              onClick={() => verifyPlayer(player, "rejected")}
                            >
                              Отклонить
                            </button>
                          </div>
                        )}
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
                      <Link
                        href={`/players/${player.slug}`}
                        className="grid size-7 place-items-center text-ink-faint transition-colors hover:text-ink"
                        title="Открыть профиль"
                        aria-label={`Профиль ${player.firstName} ${player.lastName}`}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
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
          const count = players.filter((player) => (categories[player.id] ?? player.category) === item.slug).length;
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

      {error && <DemoNote>{error}</DemoNote>}
      {notice && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </span>
        </DemoNote>
      )}
    </div>
  );
}
