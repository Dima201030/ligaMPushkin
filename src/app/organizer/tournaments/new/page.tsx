import type { Metadata } from "next";
import { CLUB_VENUES } from "@/lib/data";
import { fetchClubs, fetchMyClubs } from "@/lib/api/clubs";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { TournamentWizard } from "@/components/organizer/TournamentWizard";
import { requireOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "Новый турнир",
};

export default async function NewTournamentPage() {
  await requireOrganizerSession();
  const [catalog, memberships] = await Promise.all([
    fetchClubs().catch(() => []),
    fetchMyClubs().catch(() => []),
  ]);
  const ownedClubs = memberships
    .filter((item) => item.role === "owner")
    .map((item) => ({
      id: item.clubId,
      slug: item.slug,
      name: item.name,
    }));
  const clubs =
    catalog.length > 0
      ? catalog.map((item) => ({ id: item.id, slug: item.slug, name: item.name }))
      : ownedClubs;

  return (
    <>
      <OrganizerHeader
        eyebrow="Турниры · создание"
        title="Новый турнир"
        description="Клуб выбирается на карточке турнира. Глобальный «текущий клуб» не нужен — владельцы видят свой клуб по умолчанию, организаторы выбирают клуб при публикации."
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <TournamentWizard venues={CLUB_VENUES} clubs={clubs} ownedClubs={ownedClubs} />
      </div>
    </>
  );
}
