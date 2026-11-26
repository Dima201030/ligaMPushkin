import Link from "next/link";
import { ArrowRight, ArrowUpRight, Minus, TrendingDown, TrendingUp, Users } from "lucide-react";
import { getRatingDesk } from "@/lib/data";
import { CATEGORIES, RATING_RULES } from "@/lib/domain";
import { cn, formatDateShort, formatNumber, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { OrganizerHeader, OrgStat, Panel, MiniLabel } from "@/components/organizer/OrganizerUI";
import {
  ManualAdjustment,
  RatingCalculatorHint,
  RatingLegend,
  RecalculateRating,
} from "@/components/organizer/RatingTools";

import { requireFullOrganizerSession } from "@/lib/organizer-access";

export default async function OrganizerRatingsPage() {
  await requireFullOrganizerSession();
  const { ranking, history, audit, players } = await getRatingDesk();
  const averageRating = ranking.length
    ? Math.round(ranking.reduce((sum, row) => sum + row.rating, 0) / ranking.length)
    : 0;
  const totalPoints = ranking.reduce((sum, row) => sum + row.points, 0);
  const improved = ranking.filter((row) => row.previousPosition > 0 && row.position < row.previousPosition).length;
  const counts = CATEGORIES.map((category) => ({
    category: category.slug,
    count: players.filter((player) => player.category === category.slug).length,
  })).filter((item) => item.count > 0);

  return (
    <>
      <OrganizerHeader
        eyebrow="Рейтинг · сезон 2026"
        title="Рейтинг и очки"
        description="Прозрачные правила, пересчёт после турниров и ручные корректировки с полным журналом изменений."
        actions={
          <Link href="/rating" className="btn btn-secondary btn-sm">
            Публичный рейтинг
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat label="Игроков в рейтинге" value={ranking.length} hint="сезон 2026" icon={<Users className="size-4" />} tone="neutral" />
          <OrgStat label="Средний рейтинг" value={averageRating} hint="по всем категориям" icon={<TrendingUp className="size-4" />} />
          <OrgStat label="Очков в сезоне" value={formatNumber(totalPoints)} hint="сумма активных очков" icon={<TrendingUp className="size-4" />} tone="positive" />
          <OrgStat label="Выросли в рейтинге" value={improved} hint="после последнего пересчёта" icon={<TrendingUp className="size-4" />} tone="warning" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-8">
            <Panel
              title="Таблица рейтинга"
              description="Топ игроков по очкам сезона. Стрелка показывает движение за последний пересчёт."
              action={
                <Link href="/rating" className="link-arrow text-xs">
                  Публичная таблица
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              }
              flush
            >
              <div className="overflow-x-auto">
                <table className="data-table min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="w-12">#</th>
                      <th className="w-16">Δ</th>
                      <th>Игрок</th>
                        <th className="text-right">Очки</th>
                      <th className="text-right">Рейтинг</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((row) => {
                      const diff = row.previousPosition - row.position;
                      return (
                        <tr key={row.playerId}>
                          <td className="tabular-nums text-ink">{row.position}</td>
                          <td>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[0.66rem] tabular-nums",
                                diff > 0 ? "text-positive" : diff < 0 ? "text-negative" : "text-ink-faint",
                              )}
                            >
                              {diff > 0 ? (
                                <>
                                  <TrendingUp className="size-3" aria-hidden="true" />
                                  {diff}
                                </>
                              ) : diff < 0 ? (
                                <>
                                  <TrendingDown className="size-3" aria-hidden="true" />
                                  {Math.abs(diff)}
                                </>
                              ) : (
                                <Minus className="size-3" aria-hidden="true" />
                              )}
                            </span>
                          </td>
                          <td className="min-w-[190px]">
                            <Link href={`/players/${row.player.slug}`} className="group flex items-center gap-2.5">
                              <Avatar firstName={row.player.firstName} lastName={row.player.lastName} size="sm" />
                              <span>
                                <span className="block text-[0.78rem] font-medium text-ink transition-opacity group-hover:opacity-60">
                                  {row.player.lastName} {row.player.firstName}
                                </span>
                                <span className="block text-[0.6rem] text-ink-faint">{row.player.city}</span>
                              </span>
                            </Link>
                          </td>
                          <td className="text-right text-[0.72rem] tabular-nums text-ink-soft">
                            {formatNumber(row.points)}
                          </td>
                          <td className="text-right text-[0.76rem] tabular-nums text-ink">{row.rating}</td>
                          <td>
                            <Link
                              href={`/players/${row.player.slug}`}
                              className="grid size-7 place-items-center text-ink-faint transition-colors hover:text-ink"
                              title="Открыть профиль"
                              aria-label={`Профиль ${row.player.firstName} ${row.player.lastName}`}
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
            </Panel>

            <Panel
              title="История изменений рейтинга"
              description="Начисления и списания по матчам"
              flush
            >
              <div className="overflow-x-auto">
                <table className="data-table min-w-[680px]">
                  <thead>
                    <tr>
                      <th>Матч</th>
                      <th>Дата</th>
                      <th className="text-right">Δ</th>
                      <th className="text-right">Рейтинг</th>
                      <th>Основание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry.id}>
                        <td className="font-medium text-ink">{entry.match}</td>
                        <td className="whitespace-nowrap text-[0.68rem] text-ink-muted">{formatDateShort(entry.date)}</td>
                        <td
                          className={cn(
                            "text-right tabular-nums",
                            entry.delta > 0 ? "text-positive" : entry.delta < 0 ? "text-negative" : "text-ink-faint",
                          )}
                        >
                          {entry.delta > 0 ? "+" : ""}
                          {entry.delta}
                        </td>
                        <td className="text-right tabular-nums">{entry.after}</td>
                        <td className="text-[0.68rem] text-ink-muted">{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Правила начисления" description="Опубликованы в разделе «Регламент» на сайте">
              <ol className="space-y-2.5">
                {RATING_RULES.map((rule, index) => (
                  <li key={rule} className="flex gap-2.5 text-[0.78rem] leading-relaxed text-ink-soft">
                    <span className="grid size-5 shrink-0 place-items-center border border-line text-[0.6rem] tabular-nums text-ink-muted">
                      {index + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
              <RatingCalculatorHint />
            </Panel>
          </div>

          <aside className="space-y-8">
            <Panel title="Пересчёт сезона" description="Полный пересчёт очков">
              <RecalculateRating playersCount={players.length} matchesCount={28} />
            </Panel>

            <Panel title="Ручная корректировка" description="Для спорных и перенесённых матчей">
              <ManualAdjustment
                players={players.map((player) => ({
                  id: player.id,
                  name: `${player.lastName} ${player.firstName}`,
                  rating: player.rating,
                  category: player.category,
                }))}
              />
            </Panel>

            <Panel title="Категории" description="Распределение игроков" flush>
              <div className="pb-2">
                <RatingLegend counts={counts} />
              </div>
            </Panel>

            <Panel title="Журнал аудита" description="Последние действия организаторов" flush>
              <ul className="divide-y divide-line">
                {audit.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <p className="text-[0.72rem] leading-snug text-ink-soft">
                      <span className="font-medium text-ink">{entry.actor}</span> {entry.action.toLowerCase()}
                    </p>
                    <p className="mt-0.5 flex items-center justify-between gap-2 text-[0.62rem] text-ink-muted">
                      <span className="truncate">{entry.entity}</span>
                      <span className="shrink-0 text-ink-faint">{timeAgo(entry.createdAt)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <MiniLabel>Важно</MiniLabel>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-muted">
                Пересчёт рейтинга необратим. Перед запуском убедитесь, что все матчи турнира завершены и счёт внесён
                корректно.
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
