import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { getCmsPage } from "@/lib/data";
import { FORMAT_GUIDES, HANDBOOK_SECTIONS, HANDBOOK_TOC } from "@/lib/handbook";
import { PageHeader } from "@/components/ui/Section";
import { CategoryBadge } from "@/components/ui/Badges";
import { CmsBody } from "@/components/domain/CmsBody";
import { HandbookSectionView } from "@/components/domain/HandbookBody";
import { CATEGORIES } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Справочник: регламент и правила",
  description:
    "Публичный справочник Pairly: форматы сеток, категории, регистрация, счёт, рейтинг и роли игрока и организатора.",
};

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
        description="Регламент, форматы сеток, категории, регистрация, счёт и рейтинг — в одном публичном справочнике."
        actions={
          <Link href="/contacts" className="btn btn-on-dark">
            Контакты
          </Link>
        }
        compact
      />

      <div className="page-shell section">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="border-y border-line py-4">
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Содержание</p>
              <nav className="mt-4 space-y-2" aria-label="Разделы справочника">
                {HANDBOOK_TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <Info className="size-4 text-ink-muted" aria-hidden="true" />
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                У конкретного турнира приоритет у текста на его карточке. Этот справочник —
                общие правила платформы.
              </p>
              <Link href="/tournaments" className="link-arrow mt-4">
                К турнирам
              </Link>
            </div>
          </aside>

          <article className="min-w-0 space-y-12">
            {page?.bodyMarkdown ? (
              <section className="border-t border-line pt-6">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                  Регламент организатора
                </p>
                <h2 className="mt-3 text-xl">Опубликованный текст</h2>
                <div className="mt-4">
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
                    className="scroll-mt-8 border-b border-line py-8 last:border-b-0"
                  >
                    <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
                      Формат
                    </p>
                    <h3 className="mt-2 text-lg text-ink">{format.label}</h3>
                    <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-muted">
                      {format.short}
                    </p>

                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
                          Как устроено
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {format.howItWorks.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
                            >
                              <span
                                className="mt-2 size-1 shrink-0 rounded-full bg-ink"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
                          Счёт и заметки
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {[...format.scoring, ...format.notes].map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
                            >
                              <span
                                className="mt-2 size-1 shrink-0 rounded-full bg-ink"
                                aria-hidden="true"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="mt-6 border-l border-line pl-4 text-xs leading-relaxed text-ink-muted">
                      Типовой пресет: {format.typical}
                    </p>
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
                          className="flex items-center justify-between gap-3 border-b border-line py-3"
                        >
                          <CategoryBadge category={category.slug} />
                          <span className="text-right text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
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
