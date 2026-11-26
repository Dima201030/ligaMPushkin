import type { Metadata } from "next";
import { listNews } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { NewsCard } from "@/components/domain/NewsCard";

export const metadata: Metadata = {
  title: "Журнал",
  description: "Журнал Pairly: турниры, результаты, обновления платформы и заметки организаторов.",
};

export default async function NewsPage() {
  const news = await listNews();
  const [featured, ...rest] = news;

  return (
    <>
      <PageHeader
        eyebrow="Журнал платформы"
        title="Новости и публикации"
        description="Результаты турниров, обновления продукта и заметки организаторов о том, как устроен турнирный процесс."
      />

      <div className="page-shell section">
        {!featured ? (
          <p className="border-y border-line py-16 text-center text-sm text-ink-muted">
            Публикаций пока нет.
          </p>
        ) : (
          <>
            <NewsCard post={featured} featured />
            {rest.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
