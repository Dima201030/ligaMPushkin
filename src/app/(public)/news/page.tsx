import type { Metadata } from "next";
import { listNews } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { NewsCard } from "@/components/domain/NewsCard";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости лиги и клуба Mr. Pushkin: турниры, результаты, школа тенниса и жизнь клуба.",
};

export default async function NewsPage() {
  const news = await listNews();
  const [featured, ...rest] = news;

  return (
    <>
      <PageHeader
        eyebrow="Жизнь клуба"
        title="Новости и публикации"
        description="Результаты турниров, анонсы соревнований и заметки тренеров клуба Mr. Pushkin."
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
