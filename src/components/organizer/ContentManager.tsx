"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  MapPin,
  Newspaper,
  Plus,
  Tent,
  Trophy,
  Users,
} from "lucide-react";
import { cn, formatDateShort, timeAgo } from "@/lib/utils";
import {
  createEvent,
  createNews,
  updateEventStatus,
  updateNewsStatus,
} from "@/lib/api/organizer-content";
import { DemoNote } from "./OrganizerUI";

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  tag: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  coverUrl: string;
  status?: string;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  kind: "tournament" | "camp" | "school" | "club";
  startsAt: string;
  location: string;
  seatsLeft?: number;
  status?: string;
}

const KIND = {
  tournament: { label: "Турнир", icon: Trophy },
  camp: { label: "Кэмп", icon: Tent },
  school: { label: "Школа", icon: GraduationCap },
  club: { label: "Клуб", icon: Users },
} as const;

export function ContentManager({ news, events }: { news: NewsRow[]; events: EventRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"news" | "events">("news");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<EventRow["kind"]>("club");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("Mr. Pushkin");

  const archivedNews = useMemo(
    () => new Set(news.filter((item) => item.status === "archived" || item.status === "draft").map((item) => item.id)),
    [news],
  );
  const archivedEvents = useMemo(
    () => new Set(events.filter((item) => item.status === "archived" || item.status === "draft").map((item) => item.id)),
    [events],
  );

  async function toggleNews(post: NewsRow) {
    const next = archivedNews.has(post.id) ? "published" : "archived";
    setBusy(true);
    setError(null);
    const result = await updateNewsStatus(post.id, next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(next === "published" ? `«${post.title}» опубликовано.` : `«${post.title}» снято с публикации.`);
    router.refresh();
  }

  async function toggleEvent(event: EventRow) {
    const next = archivedEvents.has(event.id) ? "published" : "archived";
    setBusy(true);
    setError(null);
    const result = await updateEventStatus(event.id, next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice(next === "published" ? `«${event.title}» снова на сайте.` : `«${event.title}» скрыто.`);
    router.refresh();
  }

  async function submitComposer(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    if (tab === "news") {
      const result = await createNews({
        title: title.trim(),
        excerpt: excerpt.trim() || title.trim(),
        body: body
          .split(/\n{2,}/)
          .map((part) => part.trim())
          .filter(Boolean),
        status: "published",
      });
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(`Новость «${result.news.title}» опубликована.`);
    } else {
      const iso = startsAt ? new Date(startsAt).toISOString() : new Date().toISOString();
      const result = await createEvent({
        title: title.trim(),
        kind,
        description: body.trim() || excerpt.trim() || title.trim(),
        startsAt: iso,
        location: location.trim() || "Mr. Pushkin",
        status: "published",
      });
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(`Событие «${result.event.title}» опубликовано.`);
    }
    setTitle("");
    setExcerpt("");
    setBody("");
    setComposerOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-b border-line pb-3">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => setTab("news")}
            className={cn(
              "inline-flex items-baseline gap-1.5 text-[0.64rem] uppercase tracking-[0.12em] transition-colors",
              tab === "news"
                ? "text-ink underline decoration-1 underline-offset-[6px]"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Newspaper className="size-3.5 self-center" aria-hidden="true" />
            Новости
            <span className="text-[0.55rem] tabular-nums text-ink-faint">{news.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("events")}
            className={cn(
              "inline-flex items-baseline gap-1.5 text-[0.64rem] uppercase tracking-[0.12em] transition-colors",
              tab === "events"
                ? "text-ink underline decoration-1 underline-offset-[6px]"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <CalendarDays className="size-3.5 self-center" aria-hidden="true" />
            События
            <span className="text-[0.55rem] tabular-nums text-ink-faint">{events.length}</span>
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm ml-auto"
          onClick={() => setComposerOpen((value) => !value)}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {tab === "news" ? "Новая публикация" : "Новое событие"}
        </button>
      </div>

      {composerOpen && (
        <form onSubmit={submitComposer} className="space-y-3 border-y border-line py-4">
          <label className="block">
            <span className="field-label">Заголовок</span>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          {tab === "news" ? (
            <>
              <label className="block">
                <span className="field-label">Лид</span>
                <input className="field" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              </label>
              <label className="block">
                <span className="field-label">Текст (абзацы через пустую строку)</span>
                <textarea className="field min-h-[120px]" value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="field-label">Тип</span>
                  <select className="field" value={kind} onChange={(e) => setKind(e.target.value as EventRow["kind"])}>
                    {Object.entries(KIND).map(([value, meta]) => (
                      <option key={value} value={value}>{meta.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Дата и время</span>
                  <input
                    type="datetime-local"
                    className="field"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="field-label">Место</span>
                  <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} />
                </label>
              </div>
              <label className="block">
                <span className="field-label">Описание</span>
                <textarea className="field min-h-[96px]" value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
            </>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>
            {busy ? "Публикуем…" : "Опубликовать"}
          </button>
        </form>
      )}

      {tab === "news" ? (
        <div className="border-y border-line">
          {news.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-muted">Новостей пока нет.</p>
          ) : (
            <ul className="divide-y divide-line">
              {news.map((post) => {
                const isHidden = archivedNews.has(post.id);
                return (
                  <li key={post.id} className="flex flex-wrap items-center gap-4 py-3.5">
                    <div className="h-12 w-16 shrink-0 overflow-hidden bg-navy">
                      <img src={post.coverUrl} alt="" className="size-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="badge badge-neutral text-[0.55rem]">{post.tag}</span>
                        <span className={cn("badge text-[0.55rem]", isHidden ? "badge-warning" : "badge-positive")}>
                          {isHidden ? "Снято с публикации" : "Опубликовано"}
                        </span>
                      </div>
                      <Link
                        href={`/news/${post.slug}`}
                        className="mt-1 block truncate text-[0.8rem] font-medium text-ink transition-opacity hover:opacity-60"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 text-[0.62rem] text-ink-muted">
                        {post.author} · {post.publishedAt ? formatDateShort(post.publishedAt) : "черновик"} · {post.readingTime} мин
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-ink hover:text-ink"
                        disabled={busy}
                        onClick={() => toggleNews(post)}
                        title={isHidden ? "Опубликовать" : "Снять с публикации"}
                      >
                        {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                      <Link
                        href={`/news/${post.slug}`}
                        className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="border-y border-line">
          {events.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-muted">Событий пока нет.</p>
          ) : (
            <ul className="divide-y divide-line">
              {events.map((event) => {
                const meta = KIND[event.kind];
                const Icon = meta.icon;
                const isHidden = archivedEvents.has(event.id);
                return (
                  <li key={event.id} className="flex flex-wrap items-center gap-4 py-3.5">
                    <span className="grid size-10 shrink-0 place-items-center border border-line text-ink-muted">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="badge badge-neutral text-[0.55rem]">{meta.label}</span>
                        <span className={cn("badge text-[0.55rem]", isHidden ? "badge-warning" : "badge-positive")}>
                          {isHidden ? "Скрыто" : "На сайте"}
                        </span>
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="mt-1 block truncate text-[0.8rem] font-medium text-ink transition-opacity hover:opacity-60"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.62rem] text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3 text-ink-faint" aria-hidden="true" />
                          {formatDateShort(event.startsAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-ink-faint" aria-hidden="true" />
                          {event.location}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-ink hover:text-ink"
                        disabled={busy}
                        onClick={() => toggleEvent(event)}
                      >
                        {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      </button>
                      <Link
                        href={`/events/${event.slug}`}
                        className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
        <span>
          Обновлено <span className="text-ink">{timeAgo(new Date())}</span> · {news.length} новостей и {events.length} событий
        </span>
      </div>

      {error && <DemoNote>{error}</DemoNote>}
      {notice && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </span>
        </DemoNote>
      )}
    </div>
  );
}
