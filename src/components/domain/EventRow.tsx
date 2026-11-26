import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { ClubEvent } from "@/lib/types";
import { formatDayMonth, formatTime, weekday } from "@/lib/utils";

const KIND_LABEL = {
  tournament: "Турнир",
  camp: "Кэмп",
  school: "Школа",
  club: "Сообщество",
} as const;

export function EventRow({ event }: { event: ClubEvent }) {
  const date = new Date(event.startsAt);
  return (
    <div className="group flex items-center gap-4 border-b border-line py-4 last:border-b-0">
      <div className="w-12 shrink-0 text-center">
        <div className="text-[0.54rem] uppercase tracking-[0.14em] text-ink-muted">{weekday(date)}</div>
        <div className="display mt-1 text-[1.5rem] leading-none">
          {String(date.getDate()).padStart(2, "0")}
        </div>
        <div className="mt-1 text-[0.54rem] uppercase tracking-[0.14em] text-ink-faint">
          {formatDayMonth(date).split(" ")[1]}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[0.56rem] uppercase tracking-[0.14em] text-ink-muted">
          <span className="text-ink">{KIND_LABEL[event.kind]}</span>
          <span>{formatTime(date)}</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-ink transition-opacity group-hover:opacity-60">
          {event.title}
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {event.location}
        </p>
      </div>
      {typeof event.seatsLeft === "number" && (
        <span className="hidden shrink-0 text-[0.58rem] uppercase tracking-[0.14em] text-positive sm:block">
          {event.seatsLeft} мест
        </span>
      )}
      <ArrowRight
        className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-ink"
        aria-hidden="true"
      />
    </div>
  );
}

export function EventCard({ event }: { event: ClubEvent }) {
  const date = new Date(event.startsAt);
  return (
    <Link href={`/events/${event.slug}`} className="group flex flex-col">
      <div className="cover-image relative aspect-[4/3]">
        {event.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="size-full court-pattern" />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline justify-between gap-3 text-[0.56rem] uppercase tracking-[0.14em] text-ink-muted">
          <span className="text-ink">{KIND_LABEL[event.kind]}</span>
          <span>
            {String(date.getDate()).padStart(2, "0")} {formatDayMonth(date).split(" ")[1]}
          </span>
        </div>
        <h3 className="mt-2.5 text-[1.02rem] font-medium leading-snug transition-opacity group-hover:opacity-60">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{event.description}</p>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-[0.6rem] uppercase tracking-[0.12em] text-ink-muted">
            <span className="truncate">
              {formatTime(date)} · {event.location}
            </span>
            {typeof event.seatsLeft === "number" && (
              <span className="shrink-0 text-positive">{event.seatsLeft} мест</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
