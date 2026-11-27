import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDot, Trophy } from "lucide-react";
import { listTournamentsChecked } from "@/lib/data";
import { PageHeader } from "@/components/ui/Section";
import { TournamentsExplorer } from "@/components/domain/TournamentsExplorer";
import type { Tournament } from "@/lib/types";

export const metadata: Metadata = {
  title: "Турниры",
  description: "Расписание турниров Pairly: одиночные, парные, микст и кубки.",
};

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const [upcoming, completed] = await Promise.all([
    listTournamentsChecked({ status: "upcoming" }),
    listTournamentsChecked({ status: "completed" }),
  ]);
  const loadFailed = !upcoming.ok || !completed.ok;
  const tournaments = upcoming.items as Tournament[];
  const finished = completed.items as Tournament[];
  const open = tournaments.filter((item) => item.status === "registration_open").length;
  const live = tournaments.filter((item) => item.status === "live").length;
  const initialView = params.view === "completed" ? "completed" as const : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Расписание"
        title="Турниры"
        description="Одиночные и парные соревнования, микст и кубки. Выберите формат и запишитесь прямо на странице турнира."
        actions={
          <Link href="/rules" className="btn btn-on-dark">
            Справочник
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
          <Link href="/tournaments?view=completed" className="inline-flex items-center gap-2 transition-colors hover:text-white">
            <CheckCircle2 className="size-3.5 text-white/45" aria-hidden="true" />
            <span className="font-bold text-white">{finished.length}</span> завершено
          </Link>
        </div>
      </PageHeader>

      <div className="page-shell section">
        <TournamentsExplorer
          tournaments={tournaments}
          completed={finished}
          initialView={initialView}
        />
      </div>
    </>
  );
}
