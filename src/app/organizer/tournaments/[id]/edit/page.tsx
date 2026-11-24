import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrganizerTournament } from "@/lib/data";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { TournamentEditForm } from "@/components/organizer/TournamentEditForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getOrganizerTournament(id);
  return { title: data ? `Редактирование · ${data.tournament.title}` : "Турнир не найден" };
}

export default async function OrganizerTournamentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrganizerTournament(id);
  if (!data) notFound();

  return (
    <>
      <OrganizerHeader
        eyebrow="Турниры · редактирование"
        title={data.tournament.title}
        description="Измените карточку, даты, площадку и регламент. Статус и видимость управляются здесь же или в карточке турнира."
        actions={
          <Link href={`/organizer/tournaments/${data.tournament.id}`} className="btn btn-secondary btn-sm">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            К турниру
          </Link>
        }
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <TournamentEditForm tournament={data.tournament} />
      </div>
    </>
  );
}
