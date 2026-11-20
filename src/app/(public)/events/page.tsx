import type { Metadata } from "next";
import { listEvents } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { EventCard } from "@/components/domain/EventRow";

export const metadata: Metadata = {
  title: "Мероприятия",
  description: "Календарь клубных мероприятий Pairly: турниры, открытые тренировки и встречи лиги.",
};

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <>
      <PageHeader
        eyebrow="Календарь"
        title="Ближайшие мероприятия"
        description="Турниры, клубные вечера и открытые тренировки. Выберите событие и присоединяйтесь."
      />
      <div className="page-shell section">
        {events.length === 0 ? (
          <p className="border-y border-line py-16 text-center text-sm text-ink-muted">
            Мероприятий пока нет.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
