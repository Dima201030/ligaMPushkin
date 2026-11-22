import Link from "next/link";
import { ArrowUpRight, CalendarDays, Eye, Newspaper, Send, Share2 } from "lucide-react";
import { getContentDesk } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import { OrganizerHeader, OrgStat, Panel } from "@/components/organizer/OrganizerUI";
import { ContentManager } from "@/components/organizer/ContentManager";

export default async function OrganizerContentPage() {
  const { news, events } = await getContentDesk();
  const nextEvent = [...events].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
  const totalReading = news.reduce((sum, post) => sum + post.readingTime, 0);

  return (
    <>
      <OrganizerHeader
        eyebrow="Контент клуба"
        title="Новости и события"
        description="Публикуйте анонсы, итоги турниров и клубные события. Материалы сразу появляются на главной странице сайта."
        actions={
          <Link href="/news" className="btn btn-secondary btn-sm">
            Открыть сайт
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat label="Новостей" value={news.length} hint="опубликовано в сезоне" icon={<Newspaper className="size-4" />} tone="neutral" />
          <OrgStat label="Событий в календаре" value={events.length} hint="клубные встречи и турниры" icon={<CalendarDays className="size-4" />} />
          <OrgStat label="Объём материалов" value={`${totalReading} мин`} hint="суммарное время чтения" icon={<Eye className="size-4" />} tone="positive" />
          <OrgStat
            label="Ближайшее событие"
            value={nextEvent ? formatDateShort(nextEvent.startsAt) : "—"}
            hint={nextEvent?.title}
            icon={<Share2 className="size-4" />}
            tone="warning"
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <ContentManager
              news={news.map((post) => ({
                id: post.id,
                slug: post.slug,
                title: post.title,
                tag: post.tag,
                author: post.author,
                publishedAt: post.publishedAt,
                readingTime: post.readingTime,
                coverUrl: post.coverUrl,
                status: "status" in post ? String(post.status) : "published",
              }))}
              events={events.map((event) => ({
                id: event.id,
                slug: event.slug,
                title: event.title,
                kind: event.kind,
                startsAt: event.startsAt,
                location: event.location,
                seatsLeft: event.seatsLeft,
                status: "status" in event ? String(event.status) : "published",
              }))}
            />
          </div>

          <aside className="space-y-8">
            <Panel title="Редакционный чек-лист" description="Чтобы материал хорошо читался">
              <ol className="space-y-2.5 text-[0.74rem] leading-relaxed text-ink-soft">
                {[
                  "Заголовок до 60 символов: понятно, о чём и когда.",
                  "Первый абзац — суть: кто, где, когда, результат.",
                  "Одна обложка 16:9, без мелкого текста на фото.",
                  "Имена игроков — полностью, как в профиле лиги.",
                  "Ссылка на турнир или событие в первом абзаце.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center border border-line text-[0.7rem] tabular-nums text-ink-muted">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel title="Каналы публикации">
              <ul className="space-y-3">
                {[
                  { label: "Сайт лиги", value: "Синхронизирован", tone: "text-positive" },
                  { label: "Клубный VK", value: "Автопостинг", tone: "text-accent" },
                  { label: "Telegram-канал", value: "По расписанию", tone: "text-ink-muted" },
                  { label: "Рассылка игрокам", value: "Раз в неделю", tone: "text-ink-muted" },
                ].map((channel) => (
                  <li key={channel.label} className="flex items-center justify-between gap-3 text-[0.72rem]">
                    <span className="inline-flex items-center gap-2 text-ink-soft">
                      <Send className="size-3.5 text-ink-faint" aria-hidden="true" />
                      {channel.label}
                    </span>
                    <span className={channel.tone}>{channel.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-[0.72rem] leading-relaxed text-ink-faint">
                Подключение соцсетей и рассылок — следующий этап. Сейчас публикация управляется вручную.
              </p>
            </Panel>

            <Panel title="Последние материалы" flush>
              <ul className="divide-y divide-line">
                {news.slice(0, 4).map((post) => (
                  <li key={post.id} className="py-3">
                    <Link href={`/news/${post.slug}`} className="block text-[0.74rem] font-medium text-ink transition-opacity hover:opacity-60">
                      {post.title}
                    </Link>
                    <p className="mt-0.5 text-[0.7rem] text-ink-muted">
                      {formatDateShort(post.publishedAt)} · {post.tag}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
