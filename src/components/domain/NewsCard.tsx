import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { NewsPost } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function NewsCard({ post, featured = false }: { post: NewsPost; featured?: boolean }) {
  return (
    <article className={cn("group", featured && "md:grid md:grid-cols-[1.08fr_1fr] md:items-center md:gap-10")}>
      <Link
        href={`/news/${post.slug}`}
        className={cn("flex h-full flex-col", featured && "md:contents")}
      >
        <div className={cn(featured ? "md:h-full" : "")}>
          <div
            className={cn(
              "cover-image relative aspect-[4/3] shrink-0",
              featured && "md:aspect-[5/4] md:h-full",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt="" loading="lazy" />
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col pt-4", featured && "md:justify-center md:pt-0")}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.56rem] uppercase tracking-[0.14em] text-ink-muted">
            <span className="text-ink">{post.tag}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {post.readingTime} мин
            </span>
          </div>

          <h3
            className={cn(
              "mt-2.5 font-medium leading-snug text-ink transition-opacity group-hover:opacity-60",
              featured ? "display text-[clamp(1.7rem,2.6vw,2.6rem)] leading-[1.02]" : "text-[1.02rem]",
            )}
          >
            {post.title}
          </h3>

          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-ink-soft",
              featured ? "max-w-[46ch] line-clamp-3" : "line-clamp-2",
            )}
          >
            {post.excerpt}
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink">
            Читать
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function NewsRow({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex gap-4 border-b border-line py-4 last:border-b-0"
    >
      <div className="cover-image aspect-square w-20 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.coverUrl} alt="" loading="lazy" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.56rem] uppercase tracking-[0.14em] text-ink-muted">{post.tag}</p>
        <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-ink transition-opacity group-hover:opacity-60">
          {post.title}
        </p>
        <p className="mt-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted">
          {formatDate(post.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
