import type { Metadata } from "next";
import { InviteMemberForm, MembersTable } from "@/components/organizer/ClubMembersPanel";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { fetchClubMembers } from "@/lib/api/club-members";
import { fetchMyClubs } from "@/lib/api/clubs";
import { normalizeClubSlug } from "@/lib/club/tenant";
import { CLUB } from "@/lib/domain";
import { requireFullOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "Участники",
  description: `Участники клуба и роли на платформе ${CLUB.productName}.`,
};

export default async function OrganizerMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string }>;
}) {
  await requireFullOrganizerSession();
  const params = await searchParams;
  const memberships = await fetchMyClubs().catch(() => []);
  const owned = memberships.filter((item) => item.role === "owner");
  const requested = normalizeClubSlug(params.club ?? "");
  const clubSlug =
    (requested && owned.some((item) => item.slug === requested) ? requested : null) ||
    owned[0]?.slug ||
    undefined;
  const clubName = owned.find((item) => item.slug === clubSlug)?.name;
  const members = clubSlug
    ? await fetchClubMembers({ clubSlug }).catch(() => [])
    : [];

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Участники клуба"
        description={
          clubName
            ? `Клуб «${clubName}». Назначайте роли без глобального переключателя текущего клуба.`
            : "Назначайте роли: организатор турниров (ограниченный кабинет) или владелец клуба (полный доступ)."
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        <InviteMemberForm clubSlug={clubSlug} />
        <MembersTable members={members} clubSlug={clubSlug} />
      </div>
    </>
  );
}
