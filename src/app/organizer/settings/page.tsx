import type { Metadata } from "next";
import Link from "next/link";
import { ClubSettingsForm } from "@/components/organizer/ClubSettingsForm";
import { OrganizerHeader, Panel } from "@/components/organizer/OrganizerUI";
import { fetchMyClubs, fetchOrganizerClub } from "@/lib/api/clubs";
import { normalizeClubSlug } from "@/lib/club/tenant";
import { CLUB } from "@/lib/domain";
import { requireFullOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "Настройки клуба",
  description: `Редактирование клуба на платформе ${CLUB.productName}.`,
};

export default async function OrganizerSettingsPage({
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

  let club = null as Awaited<ReturnType<typeof fetchOrganizerClub>> | null;
  let loadError: string | null = null;
  if (!clubSlug) {
    loadError = "Нет клуба, которым вы владеете";
  } else {
    try {
      club = await fetchOrganizerClub({ clubSlug });
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Не удалось загрузить клуб";
    }
  }

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Настройки клуба"
        description="Имя, город и безопасные settings клуба владельца — без cookie «текущий клуб»."
        actions={
          <Link
            href={clubSlug ? `/organizer/members?club=${encodeURIComponent(clubSlug)}` : "/organizer/members"}
            className="btn btn-secondary btn-sm"
          >
            Участники
          </Link>
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        {club ? (
          <ClubSettingsForm club={club} />
        ) : (
          <Panel title="Клуб недоступен" description={loadError ?? "Нет данных клуба."}>
            <p className="py-4 text-sm text-ink-muted">
              Нужна роль owner в клубе. Откройте клуб из раздела «Клубы» или создайте новый.
            </p>
          </Panel>
        )}
      </div>
    </>
  );
}