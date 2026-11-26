import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { getEventBySlug, listEvents } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";
import { Breadcrumbs, PageHeader } from "@/components/ui/Section";
import { EventCard } from "@/components/domain/EventRow";

const KIND_LABEL = {
  tournament: "Турнир",
  camp: "Кэмп",
  school: "Школа",
  club: "Организатор",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Мероприятие не найдено" };
  return { title: event.title, description: event.description };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const date = new Date(event.startsAt);
  const other = (await listEvents()).filter((item) => item.id !== event.id).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={KIND_LABEL[event.kind]}
        title={event.title}
        description={event.description}
        compact
        actions={
          <Link href="/contacts" className="btn btn-light">Спросить организатора</Link>
        }
      />

      <div className="page-shell section">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Мероприятия", href: "/events" },
            { label: event.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div className="cover-image aspect-[16/9]">
              {event.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.coverUrl} alt="" />
              ) : (
                <div className="size-full court-pattern" />
              )}
            </div>
            <div className="border-t border-line pt-6">
              <h2 className="text-lg">О мероприятии</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{event.description}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Условия участия, запись и расписание определяет организатор события.
                Уточните формат и свободные места в карточке турнира или напишите
                организатору.
              </p>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="border-t border-line pt-6">
              <div className="space-y-5 text-sm">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <div>
                    <p className="stat-label">Дата</p>
                    <p className="mt-1.5 font-medium">{formatDate(date)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <div>
                    <p className="stat-label">Начало</p>
                    <p className="mt-1.5 font-medium">{formatTime(date)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  <div>
                    <p className="stat-label">Место</p>
                    <p className="mt-1.5 font-medium">{event.location}</p>
                    <p className="mt-1 text-xs text-ink-muted">Волхонское шоссе, 79А</p>
                  </div>
                </div>
                {typeof event.seatsLeft === "number" && (
                  <div className="flex gap-3">
                    <Users className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    <div>
                      <p className="stat-label">Свободно</p>
                      <p className="mt-1.5 font-medium text-positive">{event.seatsLeft} мест</p>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/contacts" className="btn btn-primary mt-6 w-full">Записаться</Link>
              <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
                Демо-страница мероприятия
              </p>
            </div>
            <Link href="/events" className="link-arrow">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Все мероприятия
            </Link>
          </aside>
        </div>

        {other.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-xl">Другие мероприятия</h2>
              <Link href="/events" className="link-arrow">Все</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {other.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
