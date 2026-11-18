import Link from "next/link";
import { CalendarClock, CircleDot, FileEdit, Plus, Trophy } from "lucide-react";
import { listOrganizerTournaments } from "@/lib/data";
import { OrganizerHeader, OrgStat } from "@/components/organizer/OrganizerUI";
import { OrganizerTournamentTable } from "@/components/organizer/OrganizerTournamentTable";

export default async function OrganizerTournamentsPage() {
  const tournaments = await listOrganizerTournaments();
  const live = tournaments.filter((item) => item.status === "live").length;
  const open = tournaments.filter((item) => item.status === "registration_open").length;
  const soon = tournaments.filter((item) => item.status === "registration_soon").length;
  const drafts = tournaments.filter((item) => item.status === "draft").length;

  return (
    <>
      <OrganizerHeader
        eyebrow="Календарь сезона"
        title="Турниры"
        description="Полный цикл: черновик, регламент, регистрация, жеребьёвка, сетка и результаты. Открывайте карточку турнира для управления участниками."
        actions={
          <Link href="/organizer/tournaments/new" className="btn btn-primary btn-sm">
            <Plus className="size-4" aria-hidden="true" />
            Новый турнир
          </Link>
        }
      />

      <div className="space-y-6 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat label="Всего турниров" value={tournaments.length} icon={<Trophy className="size-4" />} tone="neutral" />
          <OrgStat label="Идут сейчас" value={live} icon={<CircleDot className="size-4" />} tone="negative" hint="Pushkin Open 2026" />
          <OrgStat label="Регистрация открыта" value={open} icon={<CalendarClock className="size-4" />} tone="positive" hint={`${soon} откроются скоро`} />
          <OrgStat label="Черновики" value={drafts} icon={<FileEdit className="size-4" />} tone="warning" hint="Нужно проверить регламент" />
        </div>

        <OrganizerTournamentTable tournaments={tournaments} />
      </div>
    </>
  );
}
