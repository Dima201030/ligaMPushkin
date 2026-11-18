import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { getNewsBySlug, listNews } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Section";
import { NewsCard } from "@/components/domain/NewsCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return { title: "Новость не найдена" };
  return { title: post.title, description: post.excerpt };
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const related = (await listNews())
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <>
      <div className="border-b border-line">
        <div className="page-shell py-5">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Новости", href: "/news" },
              { label: post.title },
            ]}
          />
        </div>
      </div>

      <article className="page-shell section">
        <div className="mx-auto max-w-[820px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
            <span className="text-ink">{post.tag}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {post.readingTime} мин чтения
            </span>
          </div>

          <h1 className="mt-5 text-[clamp(2.2rem,1.8rem+2.6vw,3.6rem)]">{post.title}</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-soft md:text-lg">{post.excerpt}</p>

          <div className="mt-7 flex items-center justify-between gap-4 border-y border-line py-3">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">{post.author}</p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title="Поделиться публикацией"
            >
              <Share2 className="size-4" aria-hidden="true" />
              Поделиться
            </button>
          </div>

          <div className="cover-image mt-7 aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt="" />
          </div>

          <div className="mt-8 space-y-5">
            {post.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-[0.95rem] leading-[1.8] text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <div>
              <p className="display text-[1.4rem] leading-snug">Хотите участвовать в турнирах лиги?</p>
              <p className="mt-2 text-xs text-ink-muted">Расписание и регистрация — в разделе «Турниры».</p>
            </div>
            <Link href="/tournaments" className="btn btn-primary btn-sm">К турнирам</Link>
          </div>

          <Link href="/news" className="link-arrow mt-8">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Все новости
          </Link>
        </div>
      </article>

      <div className="border-t border-line">
        <div className="page-shell section">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-xl">Читайте также</h2>
            <Link href="/news" className="link-arrow">Все публикации</Link>
          </div>
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} post={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
