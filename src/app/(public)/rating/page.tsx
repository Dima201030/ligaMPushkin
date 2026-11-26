import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight, Info, Minus } from "lucide-react";
import { getRankingPage } from "@/lib/data";
import { RATING_RULES } from "@/lib/domain";
import { cn, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/ui/Section";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = {
  title: "Рейтинг",
  description: "Рейтинг игроков Pairly. Очки, позиции и динамика сезона 2026.",
};

export default async function RatingPage() {
  const page = await getRankingPage();
  const top = page.rows.slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Сезон 2026"
        title="Общий рейтинг"
        description="Очки начисляются за результаты турниров и действуют 52 недели. Рейтинг определяет посев в сетке и приглашение на итоговые турниры."
        actions={
          <Link href="/players" className="btn btn-on-dark">
            Каталог игроков
          </Link>
        }
      >
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs text-white/55">
          <span><span className="font-bold text-white">{page.totalPlayers}</span> игроков в общем зачёте</span>
          <span>Обновлено после последнего турнира</span>
        </div>
      </PageHeader>

      <div className="page-shell section">
        <div className="grid gap-px border-y border-line bg-line md:grid-cols-3">
          {top.map((row) => (
            <Link
              key={row.playerId}
              href={`/players/${row.player.slug}`}
              className="group flex flex-col bg-canvas p-5 transition-colors hover:bg-white/45 md:p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="display text-[2.4rem] leading-none text-ink-faint transition-colors group-hover:text-ink">
                  {String(row.position).padStart(2, "0")}
                </span>
                <span className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
                  рейтинг {row.rating}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Avatar
                  firstName={row.player.firstName}
                  lastName={row.player.lastName}
                  src={row.player.avatarUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.player.firstName} {row.player.lastName}</p>
                  <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-ink-muted">
                    {formatNumber(row.points)} очков
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-line pt-4">
                <div>
                  <p className="display text-[1.9rem] leading-none tabular-nums">{formatNumber(row.points)}</p>
                  <p className="stat-label mt-2">очков</p>
                </div>
                <ArrowUpRight className="size-4 text-ink-faint transition-colors group-hover:text-ink" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 border-y border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
            <h2 className="text-lg">Таблица рейтинга</h2>
            <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">{page.rows.length} игроков</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th className="w-12 text-center">Δ</th>
                  <th>Игрок</th>
                    <th className="text-right">Рейтинг</th>
                  <th className="text-right">Очки</th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((row) => {
                  const moved = row.previousPosition - row.position;
                  return (
                    <tr key={row.playerId} className="row-link group">
                      <td className="text-center text-sm font-extrabold tabular-nums text-navy">{row.position}</td>
                      <td className="text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 text-[0.66rem] font-bold",
                            moved > 0 ? "text-positive" : moved < 0 ? "text-negative" : "text-ink-faint",
                          )}
                        >
                          {moved > 0 ? <ArrowUp className="size-3" /> : moved < 0 ? <ArrowDown className="size-3" /> : <Minus className="size-3" />}
                          {Math.abs(moved) || ""}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            firstName={row.player.firstName}
                            lastName={row.player.lastName}
                            src={row.player.avatarUrl}
                            size="sm"
                          />
                          <Link href={`/players/${row.player.slug}`} className="font-semibold group-hover:text-accent">
                            {row.player.firstName} {row.player.lastName}
                          </Link>
                        </div>
                      </td>
                      <td className="text-right font-medium tabular-nums text-ink-soft">{row.rating}</td>
                      <td className="text-right text-sm font-bold tabular-nums text-navy">{formatNumber(row.points)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <section className="mt-12 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2 text-ink-muted">
              <Info className="size-4" aria-hidden="true" />
              <h2 className="text-lg text-ink">Как начисляются очки</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {RATING_RULES.map((rule) => (
                <li key={rule} className="flex gap-3 border-b border-divider pb-3 text-sm leading-relaxed text-ink-soft last:border-b-0">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-navy p-6 text-white md:p-8">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sky">Сезон 2026</p>
            <p className="display mt-4 text-[1.6rem] leading-[1.08]">Рейтинг пересчитывается после каждого завершённого турнира</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Если вы заметили ошибку в очках или категории — напишите организатору. Все изменения фиксируются в журнале.
            </p>
            <Link href="/contacts" className="btn btn-on-dark mt-6">Связаться с организатором</Link>
          </div>
        </section>
      </div>
    </>
  );
}
