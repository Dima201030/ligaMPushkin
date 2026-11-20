import type { Metadata } from "next";
import Link from "next/link";
import { InviteMemberForm, MembersTable } from "@/components/organizer/ClubMembersPanel";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { fetchClubMembers } from "@/lib/api/club-members";
import { CLUB } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Участники",
  description: `Участники клуба и роли на платформе ${CLUB.productName}.`,
};

export default async function OrganizerMembersPage() {
  const members = await fetchClubMembers().catch(() => []);

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Участники клуба"
        description="Список memberships текущего клуба. Добавление по email — для уже зарегистрированных пользователей."
        actions={
          <Link href="/organizer/clubs" className="btn btn-secondary btn-sm">
            Клубы
          </Link>
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        <InviteMemberForm />
        <MembersTable members={members} />
      </div>
    </>
  );
}
