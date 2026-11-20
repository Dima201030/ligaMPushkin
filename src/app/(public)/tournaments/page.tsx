import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CircleDot, Trophy } from "lucide-react";
import { listTournaments } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { TournamentsExplorer } from "@/components/domain/TournamentsExplorer";
import type { Tournament } from "@/lib/types";

export const metadata: Metadata = {
  title: "Турниры",
  description: "Расписание турниров Pairly: одиночные, парные, микст и кубки.",
};

export default async function TournamentsPage() {
  const tournaments = (await listTournaments({ status: "upcoming" })) as Tournament[];
  const open = tournaments.filter((item) => item.status === "registration_open").length;
  const live = tournaments.filter((item) => item.status === "live").length;

  return (
    <>
      <PageHeader
        eyebrow="Сезон 2026"
        title="Турниры клуба"
        description="Одиночные и парные соревнования, микст и кубки. Выберите свой формат и запишитесь прямо на странице турнира."
        actions={
          <Link href="/rules" className="btn btn-on-dark">
            Регламент турниров
          </Link>
        }
      >
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs text-white/55">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-3.5 text-sky" aria-hidden="true" />
            <span className="font-bold text-white">{tournaments.length}</span> турниров в расписании
          </span>
          <span className="inline-flex items-center gap-2">
            <CircleDot className="size-3.5 text-positive" aria-hidden="true" />
            <span className="font-bold text-white">{open}</span> с открытой регистрацией
          </span>
          <span className="inline-flex items-center gap-2">
            <Trophy className="size-3.5 text-warning" aria-hidden="true" />
            <span className="font-bold text-white">{live}</span> идут сейчас
          </span>
        </div>
      </PageHeader>

      <div className="page-shell section">
        <TournamentsExplorer tournaments={tournaments} />
      </div>
    </>
  );
}
