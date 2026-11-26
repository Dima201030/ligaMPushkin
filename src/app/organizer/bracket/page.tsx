import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { getBracketSources } from "@/lib/data";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { BracketStudio } from "@/components/organizer/BracketStudio";

export const metadata: Metadata = {
  title: "Генератор сеток",
};

export default async function OrganizerBracketPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const [{ tournament }, sources] = await Promise.all([searchParams, getBracketSources()]);

  return (
    <>
      <OrganizerHeader
        eyebrow="Жеребьёвка и сетки"
        title="Генератор сеток"
        description="Олимпийская система, круговой этап, группы с плей-офф и двойное выбывание. Посев по заявке или рейтингу, автоматические пропуски для неполных сеток."
        actions={
          <>
            <Link href="/rules" className="btn btn-secondary btn-sm">
              <BookOpen className="size-3.5" aria-hidden="true" />
              Регламент
            </Link>
            <Link href="/organizer/tournaments/new" className="btn btn-primary btn-sm">
              <Plus className="size-3.5" aria-hidden="true" />
              Новый турнир
            </Link>
          </>
        }
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <BracketStudio sources={sources} initialTournamentId={tournament} />
      </div>
    </>
  );
}
