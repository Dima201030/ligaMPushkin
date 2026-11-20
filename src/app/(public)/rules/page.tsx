import type { Metadata } from "next";
import Link from "next/link";
import { Download, Info } from "lucide-react";
import { getCmsPage } from "@/lib/data";
import { CATEGORIES, FORMATS, RATING_RULES, TOURNAMENT_STATUSES, TOURNAMENT_TYPES } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";
import { CategoryBadge } from "@/components/ui/Badges";
import { CmsBody } from "@/components/domain/CmsBody";

export const metadata: Metadata = {
  title: "Правила лиги",
  description: "Регламент турниров Pearly: категории, форматы, регистрация, начисление рейтинга и поведение на корте.",
};

export default async function RulesPage() {
  const page = await getCmsPage("rules");

  return (
    <>
      <PageHeader
        eyebrow="Документы"
        title={page?.title || "Правила и регламент"}
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
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">Справка</p>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Ниже — актуальный текст регламента и справочник категорий/форматов лиги.
              </p>
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
            <section className="border-t border-line pt-6">
              <h2 className="text-xl">Регламент</h2>
              <div className="mt-4">
                {page?.bodyMarkdown ? (
                  <CmsBody markdown={page.bodyMarkdown} />
                ) : (
                  <p className="text-sm text-ink-muted">Текст правил пока не опубликован.</p>
                )}
              </div>
            </section>

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
