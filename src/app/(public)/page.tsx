import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  ListChecks,
  Network,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { getHomeData } from "@/lib/data";
import { tournamentPath } from "@/lib/club/tenant";
import { CATEGORY_BY_SLUG, TYPE_BY_VALUE } from "@/lib/domain";
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
  { href: "/news", label: "Журнал" },
  { href: "/about", label: "О платформе" },
  { href: "/contacts", label: "Контакты" },
];

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Запись на турнир",
    text: "Регистрация с подтверждением, отмена и повторная запись — в личном кабинете.",
  },
  {
    icon: Users,
    title: "Лист ожидания",
    text: "Если мест нет, заявка встаёт в очередь и поднимается автоматически после отказа.",
  },
  {
    icon: Network,
    title: "Сетка и соперники",
    text: "Олимпийская система, круговой этап, группы с плей-офф и двойное выбывание.",
  },
  {
    icon: CalendarClock,
    title: "Расписание и корты",
    text: "Дата, время, площадка и корт вашего матча — в одном календаре.",
  },
  {
    icon: ListChecks,
    title: "Результаты матчей",
    text: "Счёт по сетам, техническая победа, снятие и отмена — с понятным статусом.",
  },
  {
    icon: TrendingUp,
    title: "Рейтинг и очки",
    text: "Турнирные очки за 52 недели и Elo для посева. История изменений видна в профиле.",
  },
  {
    icon: Newspaper,
    title: "Журнал и архив",
    text: "Анонсы, итоги турниров и история результатов в одном месте.",
  },
  {
    icon: ShieldCheck,
    title: "Проверенные профили",
    text: "Аккаунт подтверждает организатор. В зачёт попадают взрослые любительские турниры.",
  },
];

const STEPS = [
  {
    title: "Создайте аккаунт",
    text: "Имя, фамилия и уровень игры. Без лишних полей и платёжных данных.",
  },
  {
    title: "Подтвердите профиль",
    text: "Организатор проверяет заявку и открывает доступ к регистрации.",
  },
  {
    title: "Запишитесь на турнир",
    text: "Выберите соревнование в календаре. Если мест нет — встаньте в лист ожидания.",
  },
  {
    title: "Следите за сеткой",
    text: "Соперник, время и корт появляются на странице турнира и в кабинете.",
  },
  {
    title: "Смотрите итог",
    text: "Результат матча, очки и позиция в рейтинге обновляются автоматически.",
  },
];

const FAQ = [
  {
    question: "Что такое Pairly?",
    answer:
      "Платформа для взрослых любительских турниров по теннису. Здесь можно найти соревнование, записаться, следить за сеткой и результатами, а также видеть свой рейтинг.",
  },
  {
    question: "Как записаться на турнир?",
    answer:
      "Создайте аккаунт и дождитесь подтверждения организатором. Затем откройте карточку турнира с открытой регистрацией и отправьте заявку. Заявка, лист ожидания и отмена доступны в личном кабинете.",
  },
  {
    question: "Зачем подтверждать профиль?",
    answer:
      "Подтверждение защищает сетку от случайных заявок: организатор сверяет имя, фамилию и уровень игры. После проверки открывается запись на турниры.",
  },
  {
    question: "Как работает лист ожидания?",
    answer:
      "Когда основной состав заполнен, новая заявка попадает в очередь. Если кто-то отменяет участие, место освобождается и переходит следующему игроку.",
  },
  {
    question: "Как считается рейтинг?",
    answer:
      "Очки начисляются за результаты турниров и действуют 52 недели. Elo используется для посева в сетке. История начислений и позиция видны в профиле игрока.",
  },
  {
    question: "Где смотреть результаты?",
    answer:
      "На странице турнира — матчи, счёт и призёры. В разделе рейтинга — таблица сезона, в архиве — завершённые турниры прошлых лет.",
  },
  {
    question: "Можно ли оплатить участие на сайте?",
    answer:
      "Нет. Взнос указан в карточке турнира, а оплата происходит вне платформы. Pairly не ведёт платёжный контур.",
  },
  {
    question: "Я провожу турниры. Что дальше?",
    answer:
      "В разделе «Организаторам» описаны возможности кабинета: заявки, сетки, расписание, счёт и рейтинг. Связаться можно через страницу контактов.",
  },
];

export default async function HomePage() {
  const data = await getHomeData();
  const next = data.heroTournament;
  const hasStats = data.stats.players > 0 || data.stats.tournaments > 0;

  return (
    <>
      {/* ── 00 · Обложка ─────────────────────────────────────── */}
      <section
        data-reveal
        data-revealed="true"
        className="hero-parallax-lite page-shell flex min-h-[calc(100svh-96px)] flex-col justify-between pb-8 pt-2 md:min-h-[calc(100svh-112px)] md:pb-12"
      >
        <div className="flex flex-1 flex-col items-center justify-center py-12 md:py-16">
          <HeroWordmark />
          <p className="hero-kicker mt-7 max-w-[34ch] text-center text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-ink-muted md:mt-10">
            Турниры, рейтинг и результаты · взрослый любительский теннис
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tournaments" className="btn btn-primary">
              Смотреть турниры
            </Link>
            <Link href="/rating" className="btn btn-secondary">
              Рейтинг
            </Link>
          </div>

          {hasStats ? (
            <p className="mt-8 text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
              {data.stats.players > 0 ? pluralizePlayers(data.stats.players) : null}
              {data.stats.players > 0 && data.stats.tournaments > 0 ? " · " : null}
              {data.stats.tournaments > 0
                ? `${formatNumber(data.stats.tournaments)} турниров в системе`
                : null}
            </p>
          ) : null}
        </div>

        <div className="grid gap-7 border-t border-line pt-6 md:grid-cols-[1.15fr_1fr] md:items-end">
          <p className="max-w-[42ch] text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">
            Pairly показывает турниры и всё, что нужно игроку: запись, лист
            ожидания, соперников, расписание, счёт и рейтинг. Без переписок и
            ручных таблиц.
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

      {/* ── 01 · Возможности ─────────────────────────────────── */}
      <section id="features" data-reveal className="page-shell section scroll-mt-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            01 / Возможности
          </p>
          <Link
            href="/about"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Организаторам
          </Link>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem] md:items-end md:gap-16">
          <h2 className="max-w-[15ch]">Турнир понятен без вопросов</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Календарь, запись, сетка, результаты и рейтинг — на одной странице.
            Игроку не нужны чаты и таблицы, чтобы понять, где и когда он играет.
          </p>
        </div>

        <div className="stagger mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="feature-item border-t border-line pt-5">
                <span className="feature-icon grid size-9 place-items-center rounded-full border border-line text-ink">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-medium">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 02 · Как это работает ────────────────────────────── */}
      <section id="how" data-reveal className="page-shell section scroll-mt-6 pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            02 / Как это работает
          </p>
          <Link
            href="/rules"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Справочник
          </Link>
        </div>

        <div className="stagger mt-10 grid gap-0 md:grid-cols-5">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="border-t border-line py-6 md:border-l md:border-t-0 md:px-5 md:first:border-l-0 md:first:pl-0"
            >
              <p className="display text-[1.6rem] leading-none text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 text-sm font-medium">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 · Календарь ───────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            03 / Календарь
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
            Публичный календарь показывает то, что организатор открыл для записи.
            Регистрация, лист ожидания и отмена — на странице турнира.
          </p>
        </div>

        <div className="mt-10 md:mt-14">
          {data.upcoming.length === 0 ? (
            <p className="border-t border-line py-10 text-sm text-ink-muted">
              Открытых турниров пока нет. Расписание появится, когда организатор
              опубликует соревнование.
            </p>
          ) : (
            data.upcoming.map((tournament) => {
              const date = new Date(tournament.startsAt);
              const filled = tournament.participants.filter((item) => item.status !== "cancelled").length;
              return (
                <Link
                  key={tournament.id}
                  href={tournamentPath(tournament.clubSlug, tournament.slug)}
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

      {/* ── 04 · Рейтинг ─────────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            04 / Рейтинг
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
            <p className="mt-5 max-w-[40ch] text-sm leading-relaxed text-ink-muted">
              Очки начисляются за результаты турниров и действуют 52 недели. Elo
              помогает сеять игроков в сетке, очки — показывать позицию в таблице.
            </p>
            <p className="mt-8 text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-ink-faint">
              {next
                ? `Ближайший турнир — «${next.title}»`
                : "Таблица обновляется после публикации результатов"}
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

      {/* ── 05 · Журнал ──────────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            05 / Журнал
          </p>
          <Link
            href="/news"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Все публикации
          </Link>
        </div>

        <div className="stagger mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3">
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

      {/* ── 06 · Вопросы ─────────────────────────────────────── */}
      <section id="faq" data-reveal className="page-shell section scroll-mt-6 pt-0">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
            06 / Вопросы
          </p>
          <Link
            href="/contacts"
            className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
          >
            Контакты
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="max-w-[12ch]">Коротко о главном</h2>
            <p className="mt-5 max-w-[36ch] text-sm leading-relaxed text-ink-muted">
              Короткие ответы для игроков. Если вопроса нет в списке, напишите —
              поможем разобраться.
            </p>
          </div>

          <div>
            {FAQ.map((item) => (
              <details key={item.question} className="group border-t border-line last:border-b">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5">
                  <span className="text-sm font-medium text-ink">{item.question}</span>
                  <span className="text-ink-faint transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="max-w-[62ch] pb-5 text-sm leading-relaxed text-ink-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 · Связаться ───────────────────────────────────── */}
      <section data-reveal className="page-shell section pt-0">
        <div className="border-t border-line pt-10 md:pt-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">
                07 / Начать
              </p>
              <h2 className="mt-5 max-w-[16ch]">Найдите следующий турнир</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/tournaments" className="btn btn-primary">
                Смотреть турниры
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/register" className="btn btn-secondary">
                Создать аккаунт
              </Link>
            </div>
          </div>

          <p className="mt-8 max-w-[58ch] text-sm leading-relaxed text-ink-muted">
            Аккаунт нужен, чтобы записываться на турниры и видеть свои матчи,
            результаты и рейтинг. Проводите турниры сами — возможности кабинета
            организатора описаны отдельно.
          </p>

          <Link
            href="/about"
            className="link-arrow mt-6 inline-flex"
          >
            Организаторам: заявки, сетки и рейтинг
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
