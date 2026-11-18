"use client";

import { useState } from "react";
import Link from "next/link";
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
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  kind: "tournament" | "camp" | "school" | "club";
  startsAt: string;
  location: string;
  seatsLeft?: number;
}

const KIND = {
  tournament: { label: "Турнир", icon: Trophy },
  camp: { label: "Кэмп", icon: Tent },
  school: { label: "Школа", icon: GraduationCap },
  club: { label: "Клуб", icon: Users },
} as const;

export function ContentManager({ news, events }: { news: NewsRow[]; events: EventRow[] }) {
  const [tab, setTab] = useState<"news" | "events">("news");
  const [hidden, setHidden] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  function toggle(id: string, title: string) {
    const isHidden = hidden.includes(id);
    setHidden((current) => (isHidden ? current.filter((item) => item !== id) : [...current, id]));
    setNotice(
      isHidden
        ? `«${title}» снова опубликовано на сайте.`
        : `«${title}» снято с публикации. Материал останется в архиве организатора.`,
    );
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
          onClick={() => setNotice("Редактор новостей и событий появится после подключения бэкенда и хранилища файлов.")}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {tab === "news" ? "Новая публикация" : "Новое событие"}
        </button>
      </div>

      {tab === "news" ? (
        <div className="border-y border-line">
          <ul className="divide-y divide-line">
            {news.map((post) => {
              const isHidden = hidden.includes(post.id);
              return (
                <li key={post.id} className="flex flex-wrap items-center gap-4 py-3.5">
                  <div className="h-12 w-16 shrink-0 overflow-hidden bg-navy">
                    <img src={post.coverUrl} alt="" className="size-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge badge-neutral text-[0.55rem]">{post.tag}</span>
                      <span
                        className={cn(
                          "badge text-[0.55rem]",
                          isHidden ? "badge-warning" : "badge-positive",
                        )}
                      >
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
                      {post.author} · {formatDateShort(post.publishedAt)} · {post.readingTime} мин чтения
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        "grid size-8 place-items-center border border-line transition-colors",
                        isHidden
                          ? "text-ink-muted hover:border-positive hover:text-positive"
                          : "text-ink-muted hover:border-warning hover:text-warning",
                      )}
                      title={isHidden ? "Опубликовать" : "Снять с публикации"}
                      aria-label={isHidden ? `Опубликовать ${post.title}` : `Снять с публикации ${post.title}`}
                      onClick={() => toggle(post.id, post.title)}
                    >
                      {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                    <Link
                      href={`/news/${post.slug}`}
                      className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
                      title="Открыть на сайте"
                      aria-label={`Открыть ${post.title}`}
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="border-y border-line">
          <ul className="divide-y divide-line">
            {events.map((event) => {
              const kind = KIND[event.kind];
              const Icon = kind.icon;
              const isHidden = hidden.includes(event.id);
              return (
                <li key={event.id} className="flex flex-wrap items-center gap-4 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center border border-line text-ink-muted">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge badge-neutral text-[0.55rem]">{kind.label}</span>
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
                      {typeof event.seatsLeft === "number" && (
                        <span className="text-positive">{event.seatsLeft} мест свободно</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        "grid size-8 place-items-center border border-line transition-colors",
                        isHidden
                          ? "text-ink-muted hover:border-positive hover:text-positive"
                          : "text-ink-muted hover:border-warning hover:text-warning",
                      )}
                      title={isHidden ? "Показать на сайте" : "Скрыть с сайта"}
                      aria-label={isHidden ? `Показать ${event.title}` : `Скрыть ${event.title}`}
                      onClick={() => toggle(event.id, event.title)}
                    >
                      {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                    <Link
                      href={`/events/${event.slug}`}
                      className="grid size-8 place-items-center text-ink-faint transition-colors hover:text-ink"
                      title="Открыть на сайте"
                      aria-label={`Открыть ${event.title}`}
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
        <span>
          Обновлено <span className="text-ink">{timeAgo(new Date())}</span> · {news.length} новостей и {events.length} событий
        </span>
        <span className="inline-flex items-center gap-1.5 text-positive">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Сайт синхронизирован
        </span>
      </div>

      {notice && (
        <DemoNote>
          <span className="inline-flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{notice} Демо-режим: данные не сохраняются.</span>
          </span>
        </DemoNote>
      )}
    </div>
  );
}
