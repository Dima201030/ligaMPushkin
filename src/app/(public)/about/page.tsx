import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Database,
  ListChecks,
  Network,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { CLUB } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Организаторам",
  description:
    "Pairly для организаторов турниров: заявки, сетки, расписание, счёт, рейтинг и публичная страница соревнования.",
};

const CAPABILITIES = [
  {
    icon: ClipboardList,
    title: "Заявки и участники",
    text: "Регистрация с подтверждением, вместимость, лист ожидания, отмена и повторная запись. Организатор может добавить игрока вручную или завести заготовку без аккаунта.",
  },
  {
    icon: UserCheck,
    title: "Проверка профилей",
    text: "Новый аккаунт попадает на проверку. Организатор сверяет имя, фамилию и уровень, после чего открывает вход. Это защищает сетку от случайных и фейковых заявок.",
  },
  {
    icon: Network,
    title: "Сетки и форматы",
    text: "Олимпийская система, круговой этап, группы с плей-офф и двойное выбывание. Посев по заявке или рейтингу, автоматические пропуски и ручная перестановка слотов.",
  },
  {
    icon: CalendarClock,
    title: "Матчи и расписание",
    text: "Дата, время, площадка, корт и статус. Публичная сетка и календарь обновляются вместе с решениями организатора.",
  },
  {
    icon: ListChecks,
    title: "Счёт и ход турнира",
    text: "Счёт по сетам, техническая победа, снятие с коэффициентом, дисквалификация и отмена. Победитель автоматически переходит в следующий круг, проигравший — в матч за третье место, если формат это предполагает.",
  },
  {
    icon: TrendingUp,
    title: "Рейтинг и таблица",
    text: "Elo для посева и турнирные очки для позиции. Окно 52 недель, лучшие результаты, ручные корректировки с причиной и снимки таблицы по сезону.",
  },
  {
    icon: Users,
    title: "Кабинеты и роли",
    text: "Игрок видит свои заявки, матчи и рейтинг. Организатор ведёт турниры и заявки. Владелец управляет доступами, администратор платформы — сопровождением.",
  },
  {
    icon: Newspaper,
    title: "Публичный контент",
    text: "Новости, события, обложки и статические страницы: регламент, контакты, информация о турнире. Всё редактируется из кабинета.",
  },
];

const PRINCIPLES = [
  {
    title: "Один источник правды",
    text: "Заявка, сетка, счёт и рейтинг живут в одной базе. Нет отдельной таблицы для сетки и отдельного чата для результатов.",
  },
  {
    title: "Права проверяются на сервере",
    text: "Интерфейс не является защитой. Каждое действие организатора проходит проверку роли и доступа на API.",
  },
  {
    title: "Прозрачный результат",
    text: "Игрок видит, откуда взялись очки и почему он попал в тот или иной слот сетки.",
  },
  {
    title: "Без платёжного контура",
    text: "Взнос фиксируется в заявке, а деньги принимаются вне платформы. Это снимает с продукта лишнюю юридическую и интеграционную нагрузку.",
  },
  {
    title: "Данные принадлежат организатору",
    text: "База и файлы — не чёрный ящик: предусмотрены выгрузка данных и сопровождение.",
  },
  {
    title: "Только взрослые турниры",
    text: "Платформа не ведёт детские и юношеские зачёты. Это продуктовое ограничение, а не временное решение.",
  },
];

const FLOW = [
  { title: "Черновик турнира", text: "Формат, категория, даты, площадка, взнос и регламент." },
  { title: "Публикация", text: "Карточка турнира появляется в календаре, регистрация открывается по статусу." },
  { title: "Заявки", text: "Игроки записываются, организатор подтверждает состав и видит лист ожидания." },
  { title: "Сетка", text: "Генерация из подтверждённых участников, посев и публикация." },
  { title: "Матчи", text: "Расписание, корты, счёт, технические результаты и продвижение по сетке." },
  { title: "Итог", text: "Очки, рейтинг, архив и публичная история турнира." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={CLUB.productName}
        title="Проведение турниров — от заявки до финала"
        description="Pairly не заменяет организатора. Платформа даёт ему рабочий контур: заявки, сетки, матчи, счёт, рейтинг и публичную страницу турнира."
        actions={
          <>
            <Link href="/tournaments" className="btn btn-light">
              Турниры
            </Link>
            <Link href="/contacts" className="btn btn-on-dark">
              Контакты
            </Link>
          </>
        }
      />

      <div className="page-shell section">
        <div className="grid gap-10 border-b border-line pb-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="eyebrow">Задача</p>
            <h2 className="mt-3 max-w-[14ch]">Убрать ручную рутину из турнира</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Турнир редко ломается на корте. Он ломается в переписках: кто
              записался, кто в листе ожидания, кто оплатил, какая версия сетки
              актуальна и почему у игрока изменились очки.
            </p>
            <p>
              Pairly собирает эти решения в один маршрут. Организатор работает в
              кабинете, игрок видит только свои заявки, матчи и рейтинг, а
              публичная часть показывает актуальную карточку турнира.
            </p>
            <p>
              Платформа не привязана к одному клубу. Её можно запустить для
              отдельного турнирного контура, серии или сообщества — с собственными
              страницами и ролями.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
            <p className="eyebrow">Возможности</p>
            <Link href="/#how" className="text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink">
              Маршрут турнира
            </Link>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border-t border-line pt-5">
                  <span className="grid size-9 place-items-center rounded-full border border-line text-ink">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-14">
          <div className="border-b border-line pb-3">
            <p className="eyebrow">Маршрут</p>
          </div>
          <div className="mt-8 grid gap-0 md:grid-cols-3 xl:grid-cols-6">
            {FLOW.map((step, index) => (
              <div
                key={step.title}
                className="border-t border-line py-6 md:border-l md:border-t-0 md:px-4 md:first:border-l-0 md:first:pl-0"
              >
                <p className="display text-[1.4rem] leading-none text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-sm font-medium">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">Принципы</p>
            <h2 className="mt-3 max-w-[12ch]">Как устроен продукт</h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-relaxed text-ink-muted">
              Это не набор экранов поверх таблицы. Решения о доступах, составе,
              счёте и рейтинге принимает сервер, а интерфейс показывает результат.
            </p>
          </div>
          <div>
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="border-t border-line py-5 last:border-b">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-2 max-w-[62ch] text-xs leading-relaxed text-ink-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-navy p-7 text-white md:p-9">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-sky">Роли</p>
            <h2 className="mt-4 max-w-[18ch] text-[1.9rem] leading-[1.05] text-white">
              Игрок, организатор, владелец, администратор
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-white/60">
              Игрок работает со своими заявками и матчами. Организатор ведёт
              турниры и подтверждает профили. Владелец управляет доступами.
              Администратор платформы отвечает за сопровождение, обновления и
              инфраструктуру.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-5 text-xs text-white/60">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-sky" aria-hidden="true" />
                Проверка прав на API
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="size-3.5 text-sky" aria-hidden="true" />
                PostgreSQL и резервные копии
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div>
              <p className="eyebrow">Начать</p>
              <h2 className="mt-3 text-2xl">Первый турнир без ручных таблиц</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Расскажите про форматы, сезон и состав организаторов. Покажем
                кабинет и обсудим запуск.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/contacts" className="btn btn-primary">
                Контакты
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
