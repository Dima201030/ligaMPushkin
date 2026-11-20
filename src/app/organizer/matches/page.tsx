import { getMatchDesk } from "@/lib/data";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { MatchScoreDesk } from "@/components/organizer/MatchScoreDesk";

export default async function OrganizerMatchesPage() {
  const { live, scheduled, completed } = await getMatchDesk();
  const matches = [...live, ...scheduled, ...completed];

  return (
    <>
      <OrganizerHeader
        eyebrow="Матчи и результаты"
        title="Счёт и расписание"
        description="Ведите матчи в реальном времени, вносите счёты и технические победы. Победитель сразу переносится в следующий матч сетки."
        meta={
          <span className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
            <span className="size-1.5 animate-pulse bg-negative" aria-hidden="true" />
            {live.length} live
          </span>
        }
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <MatchScoreDesk matches={matches} />
      </div>
    </>
  );
}
