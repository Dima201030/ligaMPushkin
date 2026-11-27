import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { getCmsPage } from "@/lib/data";
import { FORMAT_GUIDES, HANDBOOK_SECTIONS, HANDBOOK_TOC } from "@/lib/handbook";
import { PageHeader } from "@/components/ui/Section";
import { CategoryBadge } from "@/components/ui/Badges";
import { CmsBody } from "@/components/domain/CmsBody";
import { HandbookSectionView } from "@/components/domain/HandbookBody";
import { FormatDiagram } from "@/components/domain/FormatDiagrams";
import { CATEGORIES } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Справочник: регламент и правила",
  description:
    "Подробный справочник Pairly простым языком: форматы сеток со схемами, категории, регистрация, счёт и рейтинг.",
};

function FormatTopic({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">{title}</p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-relaxed text-ink-soft">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function RulesPage() {
  const page = await getCmsPage("rules");
  const overview = HANDBOOK_SECTIONS.find((section) => section.id === "overview")!;
  const formats = HANDBOOK_SECTIONS.find((section) => section.id === "formats")!;
  const rest = HANDBOOK_SECTIONS.filter(
    (section) => section.id !== "overview" && section.id !== "formats",
  );

  return (
    <>
      <PageHeader
        eyebrow="Документы"
        title={page?.title || "Справочник турниров"}
        description="Простым языком: как устроены сетки, уровни, запись на турнир и рейтинг. Со схемами форматов."
        actions={
          <Link href="/contacts" className="btn btn-on-dark">
            Контакты
          </Link>
        }
        compact
      />

      <div className="page-shell section">
        <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border-y border-line py-4">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">Содержание</p>
              <nav className="mt-4 space-y-2.5" aria-label="Разделы справочника">
                {HANDBOOK_TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm leading-snug text-ink-soft transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <Info className="size-4 text-ink-muted" aria-hidden="true" />
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Если на карточке турнира написано иначе — действует карточка. Этот текст —
                общие правила платформы.
              </p>
              <Link href="/tournaments" className="link-arrow mt-4">
                К турнирам
              </Link>
            </div>
          </aside>

          <article className="min-w-0 space-y-14">
            {page?.bodyMarkdown ? (
              <section className="border-t border-line pt-6">
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">
                  Регламент организатора
                </p>
                <h2 className="mt-3 text-2xl">Опубликованный текст</h2>
                <div className="mt-4 text-base">
                  <CmsBody markdown={page.bodyMarkdown} />
                </div>
              </section>
            ) : null}

            <HandbookSectionView section={overview} />

            <HandbookSectionView section={formats}>
              <div className="space-y-0 border-t border-line">
                {FORMAT_GUIDES.map((format) => (
                  <div
                    key={format.value}
                    id={`format-${format.value}`}
                    className="scroll-mt-8 border-b border-line py-12 last:border-b-0"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">
                      Формат
                    </p>
                    <h3 className="mt-3 text-2xl text-ink md:text-[1.65rem]">{format.label}</h3>
                    <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-ink-muted">
                      {format.plainLead}
                    </p>
                    <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-ink-soft">
                      Когда удобен: {format.whenUseful}
                    </p>

                    <div className="mt-8">
                      <FormatDiagram format={format.value} />
                    </div>

                    <div className="mt-10 grid gap-10 lg:grid-cols-2">
                      <FormatTopic title="Как устроено" items={format.howItWorks} />
                      <FormatTopic title="Кто проходит дальше" items={format.whoAdvances} />
                      <FormatTopic title="Пропуски (bye)" items={format.byes} />
                      <FormatTopic title="Третье место" items={format.thirdPlace} />
                    </div>

                    <div className="mt-10">
                      <FormatTopic title="Типовой счёт из пресета" items={format.scoring} />
                      <p className="mt-5 border-l border-line pl-4 text-sm leading-relaxed text-ink-muted">
                        Текст пресета: {format.typical}
                      </p>
                    </div>

                    <div className="mt-10 border-t border-line pt-8">
                      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-ink-muted">
                        Пример маленького турнира
                      </p>
                      <h4 className="mt-3 text-lg text-ink">{format.exampleTitle}</h4>
                      <ol className="mt-5 space-y-0">
                        {format.exampleSteps.map((step, index) => (
                          <li
                            key={step.title}
                            className="grid gap-2 border-b border-line py-4 first:pt-0 last:border-b-0 sm:grid-cols-[3.5rem_1fr] sm:gap-5"
                          >
                            <p className="display text-[1.5rem] leading-none text-ink-faint">
                              {String(index + 1).padStart(2, "0")}
                            </p>
                            <div>
                              <p className="text-base font-medium text-ink">{step.title}</p>
                              <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-ink-soft">
                                {step.text}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </HandbookSectionView>

            {rest.map((section) =>
              section.id === "categories" ? (
                <HandbookSectionView
                  key={section.id}
                  section={section}
                  childrenBefore={
                    <div className="grid gap-x-8 sm:grid-cols-2">
                      {CATEGORIES.map((category) => (
                        <div
                          key={category.slug}
                          className="flex items-center justify-between gap-3 border-b border-line py-4"
                        >
                          <CategoryBadge category={category.slug} />
                          <span className="max-w-[18ch] text-right text-sm leading-snug text-ink-muted">
                            {category.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  }
                />
              ) : (
                <HandbookSectionView key={section.id} section={section} />
              ),
            )}
          </article>
        </div>
      </div>
    </>
  );
}
