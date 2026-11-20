import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getArchiveYears, listArchive } from "@/lib/data";
import { CATEGORIES, CATEGORY_BY_SLUG, TOURNAMENT_TYPES, TYPE_BY_VALUE } from "@/lib/domain";
import type { CategorySlug, TournamentType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/Section";
import { CategoryBadge, StatusPill } from "@/components/ui/Badges";

export const metadata: Metadata = {
  title: "Архив турниров",
  description: "Все прошедшие турниры Pairly: победители, результаты и фильтры по году, категории и типу.",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; category?: string; type?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? Number(params.year) : undefined;
  const category =
    params.category && params.category in CATEGORY_BY_SLUG
      ? (params.category as CategorySlug)
      : undefined;
  const type =
    params.type && TOURNAMENT_TYPES.some((item) => item.value === params.type)
      ? (params.type as TournamentType)
      : undefined;

  const [tournaments, years] = await Promise.all([
    listArchive({ year, category, type }),
    getArchiveYears(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="История лиги"
        title="Архив турниров"
        description="Все завершённые соревнования клуба. Победители, призёры и полные результаты по годам и категориям."
      >
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/15 pt-5 text-xs text-white/55">
          <span><span className="font-bold text-white">{tournaments.length}</span> турниров по фильтру</span>
          <span>Сезоны {years.join(" · ")}</span>
        </div>
      </PageHeader>

      <div className="page-shell section">
        <form action="/archive" className="card-flat grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <label>
            <span className="field-label">Год</span>
            <select name="year" defaultValue={params.year ?? ""} className="field">
              <option value="">Все годы</option>
              {years.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Категория</span>
            <select name="category" defaultValue={params.category ?? ""} className="field">
              <option value="">Все категории</option>
              {CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Тип</span>
            <select name="type" defaultValue={params.type ?? ""} className="field">
              <option value="">Все типы</option>
              {TOURNAMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Применить</button>
        </form>

        <div className="card-flat mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Турнир</th>
                  <th>Тип</th>
                  <th>Категория</th>
                  <th>Победитель</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => {
                  const winners = tournament.winners?.find((item) => item.place === 1);
                  const winnerNames = winners?.playerIds?.length
                    ? `${winners.playerIds.length} участник(ов)`
                    : null;
                  return (
                    <tr key={tournament.id} className="row-link group">
                      <td className="whitespace-nowrap text-xs text-ink-muted">{formatDate(tournament.startsAt)}</td>
                      <td>
                        <Link href={`/tournaments/${tournament.slug}`} className="font-semibold group-hover:text-accent">
                          {tournament.title}
                        </Link>
                        <p className="mt-0.5 text-[0.66rem] text-ink-faint">{tournament.season} · {TYPE_BY_VALUE[tournament.type].label}</p>
                      </td>
                      <td className="text-xs text-ink-muted">{TYPE_BY_VALUE[tournament.type].label}</td>
                      <td><CategoryBadge category={tournament.category} /></td>
                      <td>
                        {winnerNames ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                            <Trophy className="size-3.5 text-warning" aria-hidden="true" />
                            {winnerNames}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-faint">—</span>
                        )}
                      </td>
                      <td><StatusPill status={tournament.status} /></td>
                      <td className="text-right text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tournaments.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-bold">По этим фильтрам турниров нет</p>
              <p className="mt-1 text-sm text-ink-muted">Попробуйте выбрать другой год или категорию.</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          Ищете текущие соревнования? <Link href="/tournaments" className="font-semibold text-accent hover:underline">Перейти к расписанию →</Link>
        </p>
      </div>
    </>
  );
}
