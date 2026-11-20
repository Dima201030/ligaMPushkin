import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getHomeData } from "@/lib/data";
import { CATEGORY_BY_SLUG, CLUB, TYPE_BY_VALUE } from "@/lib/domain";
import { formatNumber, formatTime, pluralizePlayers, weekday } from "@/lib/utils";
import { HeroWordmark } from "@/components/ui/HeroWordmark";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const INDEX_LINKS = [
  { href: "/tournaments", label: "Турниры" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/players", label: "Игроки" },
  { href: "/news", label: "Новости" },
  { href: "/club", label: "Клуб" },
];

export default async function HomePage() {
  const data = await getHomeData();
  const next = data.heroTournament;

  return (
    <>
      {/* ── 00 · Обложка ─────────────────────────────────────── */}
      <section
        data-reveal
        data-revealed="true"
        className="page-shell flex min-h-[calc(100svh-96px)] flex-col justify-between pb-8 pt-2 md:min-h-[calc(100svh-112px)] md:pb-12"
      >
        <div className="flex flex-1 flex-col items-center justify-center py-12 md:py-16">
          <HeroWordmark />
          <p className="hero-kicker mt-7 text-center text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-ink-muted md:mt-10">
            Сезон {CLUB.season} · {pluralizePlayers(data.stats.players)} · {data.stats.courts} кортов
          </p>
        </div>

        <div className="grid gap-7 border-t border-line pt-6 md:grid-cols-[1.15fr_1fr] md:items-end">
          <p className="max-w-[40ch] text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">
            Турниры для взрослых игроков, прозрачный рейтинг и сообщество {CLUB.name}.
            Записывайтесь, следите за сеткой и растите в игре.
          </p>

          <nav
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 md:justify-end md:gap-x-6"
            aria-label="Разделы сайта"
          >
            {INDEX_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
                <ArrowUpRight
                  className="hidden size-3 opacity-0 transition-opacity group-hover:opacity-100 md:block"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ── 01 · Календарь ───────────────────────────────────── */}
      <section data-reveal className="page-shell section">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            01 / Календарь
          </p>
          <Link
            href="/tournaments"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Все турниры
          </Link>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem] md:items-end md:gap-16">
          <h2 className="max-w-[14ch]">Ближайшие турниры</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Регистрация открывается за две недели до старта. Сетка публикуется после закрытия
            заявок — за день до первого матча.
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          {data.upcoming.length === 0 ? (
            <p className="border-t border-line py-10 text-sm text-ink-muted">
              Ближайших турниров пока нет. Следите за анонсами в новостях.
            </p>
          ) : (
            data.upcoming.map((tournament) => {
              const date = new Date(tournament.startsAt);
              const filled = tournament.participants.filter((item) => item.status !== "cancelled").length;
              return (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.slug}`}
                  className="group grid grid-cols-[3.6rem_1fr_auto] items-start gap-x-5 gap-y-3 border-t border-line py-6 transition-colors last:border-b last:border-line hover:bg-white/35 md:grid-cols-[7rem_1fr_10rem_auto] md:items-center md:gap-x-10 md:py-8"
                >
                  <div className="flex items-baseline gap-2 md:block">
                    <span className="display block text-[2.1rem] leading-none md:text-[3.4rem]">
                      {String(date.getDate()).padStart(2, "0")}
                    </span>
                    <span className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted md:mt-2 md:block">
                      {MONTHS_GENITIVE[date.getMonth()]} · {weekday(date)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[1.05rem] font-medium leading-snug transition-opacity group-hover:opacity-60 md:text-[1.4rem]">
                      {tournament.title}
                    </h3>
                    <p className="mt-1.5 text-[0.62rem] uppercase leading-relaxed tracking-[0.12em] text-ink-muted">
                      {CATEGORY_BY_SLUG[tournament.category].name} ·{" "}
                      {TYPE_BY_VALUE[tournament.type].label} · {formatTime(date)} ·{" "}
                      {tournament.venue.name}
                    </p>
                  </div>

                  <p className="col-start-2 text-xs text-ink-muted md:col-start-auto md:text-right">
                    {filled} / {tournament.maxParticipants} участников
                  </p>

                  <span className="col-start-3 row-span-2 grid size-9 place-items-center self-center rounded-full border border-line text-ink-faint transition-colors group-hover:border-ink group-hover:text-ink md:col-start-auto md:row-span-1">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 02 · Клуб ────────────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">02 / Клуб</p>
          <Link
            href="/club"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            О клубе
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <figure className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/club/courts-aerial.webp"
              alt={`Корты теннисного клуба ${CLUB.name} с высоты`}
              className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
            />
            <figcaption className="mt-3 flex items-center justify-between text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
              <span>Волхонское шоссе, 79А</span>
              <span>7 крытых · 2 грунтовых</span>
            </figcaption>
          </figure>

          <div className="flex flex-col justify-center">
            <h2 className="max-w-[12ch]">Большой теннис в Пушкине</h2>
            <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
              {CLUB.name} — клуб для тех, кто любит теннис без лишнего пафоса. Здесь
              играют любительские турниры и встречаются на корте после работы.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
              {[
                { value: formatNumber(data.stats.players), label: "игроков в лиге" },
                { value: formatNumber(data.stats.tournaments), label: "турниров за сезон" },
                { value: formatNumber(data.stats.matches), label: "сыгранных матчей" },
                { value: String(data.stats.courts), label: "кортов" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="display text-[1.9rem] leading-none md:text-[2.2rem]">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 text-[0.58rem] uppercase leading-relaxed tracking-[0.12em] text-ink-muted">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/club" className="btn btn-primary">
                О клубе
              </Link>
              <Link href="/contacts" className="btn btn-secondary">
                Как добраться
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 · Рейтинг ─────────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            03 / Рейтинг
          </p>
          <Link
            href="/rating"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Полный рейтинг
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="max-w-[12ch]">Топ сезона</h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-ink-muted">
              Очки начисляются за матчи в турнирах клуба и действуют 52 недели. Рейтинг
              определяет посев в сетке.
            </p>
            <p className="mt-8 text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-ink-faint">
              {next
                ? `Ближайший турнир — «${next.title}»`
                : "Рейтинг обновляется после каждого турнира"}
            </p>
          </div>

          <ol>
            {data.top.length === 0 ? (
              <li className="border-t border-line py-8 text-sm text-ink-muted">
                В рейтинге пока никого нет.
              </li>
            ) : (
              data.top.slice(0, 5).map(({ position, points, player }) => (
                <li key={player.id}>
                  <Link
                    href={`/players/${player.slug}`}
                    className="group grid grid-cols-[2.2rem_1fr_auto] items-baseline gap-x-4 border-t border-line py-4 transition-colors last:border-b last:border-line hover:bg-white/35 md:gap-x-6 md:py-5"
                  >
                    <span className="display text-[1.15rem] leading-none text-ink-muted md:text-[1.4rem]">
                      {String(position).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.95rem] font-medium transition-opacity group-hover:opacity-60 md:text-base">
                        {player.firstName} {player.lastName}
                      </span>
                      <span className="mt-0.5 block text-[0.58rem] uppercase tracking-[0.12em] text-ink-muted">
                        {CATEGORY_BY_SLUG[player.category]?.name ?? player.category}
                      </span>
                    </span>
                    <span className="display text-[1rem] tabular-nums md:text-[1.15rem]">
                      {formatNumber(points)}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ol>
        </div>
      </section>

      {/* ── 04 · Журнал ──────────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            04 / Журнал
          </p>
          <Link
            href="/news"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Все публикации
          </Link>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {data.news.length === 0 ? (
            <p className="text-sm text-ink-muted md:col-span-3">Публикаций пока нет.</p>
          ) : (
            data.news.map((post, index) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex flex-col"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverUrl}
                    alt=""
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                      index === 0 ? "aspect-[4/3]" : "aspect-[4/3] md:aspect-[4/5]"
                    }`}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3 text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
                  <span>{post.tag}</span>
                  <span>{post.readingTime} мин</span>
                </div>
                <h3 className="mt-2 max-w-[24ch] text-[1.05rem] font-medium leading-snug transition-opacity group-hover:opacity-60">
                  {post.title}
                </h3>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ── 05 · Присоединиться ──────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="border-t border-line pt-10 md:pt-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
                05 / Участие
              </p>
              <h2 className="mt-5 max-w-[14ch]">Хотите играть в лиге?</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/register" className="btn btn-primary">
                Стать игроком
              </Link>
              <Link href="/login" className="btn btn-secondary">
                Войти в кабинет
              </Link>
            </div>
          </div>

          <p className="mt-8 max-w-[56ch] text-sm leading-relaxed text-ink-muted">
            Оставьте заявку и расскажите об уровне игры. Мы поможем определить категорию,
            подберём компанию и подскажем первый турнир.
          </p>
        </div>
      </section>
    </>
  );
}
