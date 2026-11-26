import type { Metadata } from "next";
import Link from "next/link";
import { ClubSettingsForm } from "@/components/organizer/ClubSettingsForm";
import { OrganizerHeader, Panel } from "@/components/organizer/OrganizerUI";
import { fetchOrganizerClub } from "@/lib/api/clubs";
import { CLUB } from "@/lib/domain";
import { requireFullOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "Настройки клуба",
  description: `Редактирование текущего клуба на платформе ${CLUB.productName}.`,
};

export default async function OrganizerSettingsPage() {
  await requireFullOrganizerSession();
  let club = null as Awaited<ReturnType<typeof fetchOrganizerClub>> | null;
  let loadError: string | null = null;
  try {
    club = await fetchOrganizerClub();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Не удалось загрузить клуб";
  }

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Настройки клуба"
        description="Имя, город и безопасные settings текущего клуба."
        actions={
          <Link href="/organizer/members" className="btn btn-secondary btn-sm">
            Участники
          </Link>
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        {club ? (
          <ClubSettingsForm club={club} />
        ) : (
          <Panel title="Клуб недоступен" description={loadError ?? "Нет данных текущего клуба."}>
            <p className="py-4 text-sm text-ink-muted">
              Нужны роль organizer/owner в текущем клубе и живой{" "}
              <code className="text-[0.78rem]">GET /api/organizer/club</code>.
            </p>
          </Panel>
        )}
      </div>
    </>
  );
}
