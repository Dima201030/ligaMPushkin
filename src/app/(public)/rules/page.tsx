import type { Metadata } from "next";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import { CATEGORIES, FORMATS, RATING_RULES, TOURNAMENT_STATUSES, TOURNAMENT_TYPES } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";
import { CategoryBadge } from "@/components/ui/Badges";

export const metadata: Metadata = {
  title: "Правила лиги",
  description: "Регламент турниров лиги Mr. Pushkin: категории, форматы, регистрация, начисление рейтинга и поведение на корте.",
};

const SECTIONS = [
  {
    title: "1. Общие положения",
    body: [
      "Лига Mr. Pushkin — любительское соревнование клуба. Участвовать могут члены клуба и гости, прошедшие регистрацию и согласившиеся с регламентом.",
      "Организатор публикует расписание, формирует сетки и отвечает за проведение турниров. Спорные ситуации рассматривает турнирный комитет.",
    ],
  },
  {
    title: "2. Регистрация",
    body: [
      "Регистрация открывается на странице турнира. Заявка считается принятой после подтверждения организатором.",
      "Отменить участие можно до дедлайна регистрации. После жеребьёвки отмена возможна только по уважительной причине.",
      "При заполнении сетки игроки попадают в лист ожидания. Место освобождается при отказе одного из участников.",
    ],
  },
  {
    title: "3. Форматы и сетки",
    body: [
      "Основные форматы: олимпийская система, круговой турнир, группы с плей-офф и двойное выбывание. Формат указывается на странице турнира.",
      "Посев формируется по рейтингу. Игроки без рейтинга распределяются жеребьёвкой.",
      "Матчи проводятся до двух побед в сетах, если регламент турнира не устанавливает иной формат.",
    ],
  },
  {
    title: "4. Рейтинг и категории",
    body: [
      "Очки начисляются за каждый завершённый матч. Победа над соперником более высокой категории приносит больше очков.",
      "Срок действия очков — 52 недели. Категория пересматривается после восьми матчей в сезоне.",
      "Ручная корректировка рейтинга фиксируется в журнале изменений с указанием причины.",
    ],
  },
  {
    title: "5. Поведение на корте",
    body: [
      "Участники соблюдают правила тенниса, уважают соперников и решения судьи. Спорные мячи переигрываются по договорённости.",
      "Опоздание более чем на 15 минут считается техническим поражением, если организатор не принял иного решения.",
      "Оскорбления, порча инвентаря и неуважение к персоналу клуба ведут к отстранению от турниров.",
    ],
  },
  {
    title: "6. Результаты и протесты",
    body: [
      "Результат матча вносится организатором или капитаном пары сразу после игры. Игроки могут проверить результат в личном кабинете.",
      "Протест подаётся в течение 24 часов после публикации результата. Решение принимает турнирный комитет.",
      "Изменения результатов фиксируются в истории изменений и не удаляются.",
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Документы"
        title="Правила и регламент"
        description="Как проходят турниры лиги, как начисляется рейтинг и что важно знать перед первым матчем."
        actions={
          <button type="button" className="btn btn-on-dark">
            <Download className="size-4" aria-hidden="true" />
            Скачать PDF
          </button>
        }
        compact
      />

      <div className="page-shell section">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border-y border-line py-4">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Содержание</p>
              <nav className="mt-3 space-y-0.5" aria-label="Содержание регламента">
                {SECTIONS.map((section) => (
                  <a
                    key={section.title}
                    href={`#section-${section.title.charAt(0)}`}
                    className="block py-1.5 text-[0.8rem] leading-snug text-ink-soft transition-colors hover:text-ink"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <Info className="size-4 text-ink-muted" aria-hidden="true" />
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Не нашли ответ? Напишите организатору — поможем разобраться.
              </p>
              <Link href="/contacts" className="link-arrow mt-4">Контакты</Link>
            </div>
          </aside>

          <article className="min-w-0">
            <div className="space-y-8">
              {SECTIONS.map((section) => (
                <section key={section.title} id={`section-${section.title.charAt(0)}`} className="scroll-mt-24 border-t border-line pt-6">
                  <h2 className="text-xl">{section.title}</h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 30)} className="text-sm leading-relaxed text-ink-soft">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-12 border-t border-line pt-6">
              <h2 className="text-xl">Категории игроков</h2>
              <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {CATEGORIES.map((category) => (
                  <div key={category.slug} className="flex items-center justify-between gap-3 border-b border-line py-3">
                    <CategoryBadge category={category.slug} />
                    <span className="text-right text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">{category.note}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-line pt-6">
              <h2 className="text-xl">Типы турниров</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOURNAMENT_TYPES.map((type) => (
                  <span key={type.value} className="badge badge-outline px-3 py-1.5">{type.label}</span>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-line pt-6">
              <h2 className="text-xl">Форматы</h2>
              <div className="mt-4">
                {FORMATS.map((format) => (
                  <div key={format.value} className="border-b border-line py-4 last:border-b-0">
                    <p className="text-sm font-medium">{format.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{format.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-line pt-6">
              <h2 className="text-xl">Статусы турниров</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {TOURNAMENT_STATUSES.filter((status) => status.value !== "draft").map((status) => (
                  <span key={status.value} className="badge badge-neutral px-3 py-1.5">{status.label}</span>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-line pt-6">
              <h2 className="text-lg">Начисление очков</h2>
              <ul className="mt-4 space-y-3">
                {RATING_RULES.map((rule) => (
                  <li key={rule} className="flex gap-2.5 border-b border-divider pb-3 text-xs leading-relaxed text-ink-soft last:border-b-0">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                    {rule}
                  </li>
                ))}
              </ul>
              <Link href="/rating" className="link-arrow mt-5">Перейти к рейтингу</Link>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
