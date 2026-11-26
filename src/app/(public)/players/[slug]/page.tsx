import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, MapPin, Trophy, UserPlus } from "lucide-react";
import { getPlayerProfile } from "@/lib/data";
import { CATEGORY_BY_SLUG } from "@/lib/domain";
import { cn, formatDate, publicCity, winRate } from "@/lib/utils";
import { FormDots, RatingChart, WinRateRing } from "@/components/charts";
import { Breadcrumbs } from "@/components/ui/Section";
import {
  PlayerActivity,
  PlayerHeroMeta,
  PlayerStatStrip,
} from "@/components/polish/PlayerProfilePolish";
import { MatchTimeline } from "@/components/polish/MatchTimeline";
import { DuelGauges } from "@/components/polish/DuelGauges";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) return { title: "Игрок не найден" };
  return {
    title: `${profile.player.firstName} ${profile.player.lastName}`,
    description: `Профиль игрока Pairly: ${profile.player.category}, рейтинг ${profile.player.rating}.`,
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) notFound();

  const { player, matches, titles, rank, categoryRank, form } = profile;
  const rate = winRate(player.wins, player.losses);
  const totalMatches = player.wins + player.losses;
  const category = CATEGORY_BY_SLUG[player.category];

  return (
    <>
      <section className="border-b border-line">
        <div className="page-shell py-8 md:py-10">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Игроки", href: "/players" },
              { label: `${player.firstName} ${player.lastName}` },
            ]}
          />

          <PlayerHeroMeta
            firstName={player.firstName}
            lastName={player.lastName}
            avatarUrl={player.avatarUrl}
            category={player.category}
            memberSinceYear={player.memberSince ? new Date(player.memberSince).getFullYear() : null}
            rating={player.rating}
            points={player.points}
            form={form}
          />
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            {publicCity(player.city) ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {player.city}
              </span>
            ) : null}
            <span>
              {category?.name ?? player.category} · {category?.note ?? ""}
            </span>
          </p>
        </div>
      </section>

      <div className="page-shell section">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <PlayerStatStrip
              wins={player.wins}
              losses={player.losses}
              rate={rate}
              tournamentsCount={player.tournamentsCount}
            />
            <PlayerActivity form={form} />
            {matches[0] ? (
              <section className="border-t border-line pt-6">
                <h2 className="text-lg">Сравнение с последним соперником</h2>
                <DuelGauges
                  className="mt-4"
                  youLabel={player.lastName}
                  opponentLabel="Соперник"
                  youValue={player.rating}
                  opponentValue={Math.max(900, player.rating - 40)}
                />
              </section>
            ) : null}

            <section className="border-t border-line pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg">Динамика рейтинга</h2>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Изменение мастерства за последние турниры</p>
                </div>
                <FormDots form={form} />
              </div>
              <RatingChart values={player.trend} className="mt-4" />
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl">История матчей</h2>
                  <p className="mt-1 text-xs text-ink-muted">{matches.length} матчей на платформе · {totalMatches} по статистике профиля</p>
                </div>
              </div>
              <MatchTimeline matches={matches} />
            </section>

            <section className="border-t border-line pt-6">
              <h2 className="text-lg">О игроке</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{player.bio}</p>
              <div className="mt-5 grid gap-4 border-t border-divider pt-5 sm:grid-cols-3">
                <div>
                  <p className="stat-label">Лучшая позиция</p>
                  <p className="mt-1.5 text-sm font-medium">#{player.bestRank} в общем рейтинге</p>
                </div>
                <div>
                  <p className="stat-label">Титулы</p>
                  <p className="mt-1.5 text-sm font-medium">{player.titlesCount}</p>
                </div>
                <div>
                  <p className="stat-label">На платформе с</p>
                  <p className="mt-1.5 text-sm font-medium">{formatDate(player.memberSince)}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="border-t border-line pt-6">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Позиция в рейтинге</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="display text-[2.6rem] leading-none tabular-nums">#{rank}</p>
                  <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">из {profile.categoriesCount} игроков</p>
                </div>
                <div className="text-right">
                  <p className="display text-xl tabular-nums">#{categoryRank}</p>
                  <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">в {category.name}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center border-t border-divider pt-6">
                <WinRateRing value={rate} size={104} />
              </div>
              <Link href="/rating" className="btn btn-secondary mt-5 w-full">
                Смотреть рейтинг
              </Link>
            </div>

            <div className="border-t border-line pt-6">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-ink-muted" aria-hidden="true" />
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Титулы</p>
              </div>
              {titles.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {titles.slice(0, 4).map((title, index) => (
                    <li key={`${title.tournamentTitle}-${index}`} className="flex gap-3 border-b border-divider pb-3 last:border-b-0">
                      <span
                        className={cn(
                          "display w-5 shrink-0 text-[1.2rem] leading-none tabular-nums",
                          title.place === 1 ? "text-ink" : "text-ink-faint",
                        )}
                      >
                        {title.place}
                      </span>
                      <div>
                        <p className="text-xs font-medium leading-snug">{title.tournamentTitle}</p>
                        <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-ink-muted">{title.year} · {title.place === 1 ? "победа" : "призовое место"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                  Пока без титулов. Всё впереди — следите за турнирами платформы.
                </p>
              )}
            </div>

            <div className="bg-navy p-6 text-white">
              <Award className="size-6 text-sky" aria-hidden="true" />
              <p className="display mt-4 text-[1.25rem] leading-snug">Хотите сыграть с {player.firstName}?</p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Запишитесь на ближайший турнир категории {category.name} — соперники определяются жеребьёвкой.
              </p>
              <Link href="/tournaments" className="btn btn-light mt-5 w-full">
                Ближайшие турниры
              </Link>
            </div>

            <div className="border-t border-line pt-6">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Игроку</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Это ваш профиль? Проверьте данные и обновите фото в личном кабинете.
              </p>
              <Link href="/cabinet" className="btn btn-secondary mt-4 w-full">
                <UserPlus className="size-4" aria-hidden="true" />
                В кабинет
              </Link>
            </div>
          </aside>
        </div>

        <Link href="/players" className="link-arrow mt-8">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Все игроки
        </Link>
      </div>
    </>
  );
}
