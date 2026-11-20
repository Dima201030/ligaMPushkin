import type { Metadata } from "next";
import Link from "next/link";
import { listPlayersWithRank } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { PlayersExplorer } from "@/components/domain/PlayersExplorer";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Игроки",
  description: "Каталог игроков Pairly: рейтинг, категория, статистика побед и история матчей.",
};

export default async function PlayersPage() {
  const rows = await listPlayersWithRank();
  const averageRating = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.player.rating, 0) / rows.length)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Сообщество"
        title="Игроки лиги"
        description="Все участники клуба: рейтинг, категория мастерства и соревновательная статистика. Найдите игрока или сравните свой прогресс."
      >
        <div className="mt-8 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/15 pt-5 sm:grid-cols-4">
          <div>
            <p className="display text-[1.65rem] leading-none tabular-nums text-white">{rows.length}</p>
            <p className="mt-2 text-[0.66rem] text-white/45">в каталоге</p>
          </div>
          <div>
            <p className="display text-[1.65rem] leading-none tabular-nums text-white">{formatNumber(rows.length)}</p>
            <p className="mt-2 text-[0.66rem] text-white/45">всего в лиге</p>
          </div>
          <div>
            <p className="display text-[1.65rem] leading-none tabular-nums text-white">{formatNumber(averageRating)}</p>
            <p className="mt-2 text-[0.66rem] text-white/45">средний рейтинг</p>
          </div>
          <div>
            <p className="display text-[1.65rem] leading-none tabular-nums text-white">6</p>
            <p className="mt-2 text-[0.66rem] text-white/45">категорий</p>
          </div>
        </div>
      </PageHeader>

      <div className="page-shell section">
        <PlayersExplorer rows={rows} />
        <p className="mt-6 text-xs leading-relaxed text-ink-muted">
          Рейтинг пересчитывается после каждого турнира. Очки действуют 52 недели.{" "}
          <Link href="/rating" className="font-semibold text-accent hover:underline">Как считается рейтинг →</Link>
        </p>
        <p className="sr-only">{formatNumber(rows.length)} игроков</p>
      </div>
    </>
  );
}
