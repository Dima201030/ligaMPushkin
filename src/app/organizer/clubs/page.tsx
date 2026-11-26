import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { CreateClubForm } from "@/components/organizer/CreateClubForm";
import { OrganizerHeader, Panel } from "@/components/organizer/OrganizerUI";
import { fetchMyClubs } from "@/lib/api/clubs";
import { CLUB } from "@/lib/domain";
import { requireFullOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: "Клубы",
  description: `Создание и управление клубами на платформе ${CLUB.productName}.`,
};

export default async function OrganizerClubsPage() {
  await requireFullOrganizerSession();
  const memberships = await fetchMyClubs().catch(() => []);
  const owned = memberships.filter((item) => item.role === "owner");

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Клубы"
        description="Владельцы управляют своими клубами и участниками. Глобальный переключатель «текущий клуб» не используется — клуб выбирается на карточке турнира."
        actions={
          <Link href="/clubs" className="btn btn-secondary btn-sm">
            Публичный список
          </Link>
        }
      />

      <div className="space-y-10 px-4 py-7 md:px-8 lg:px-10">
        <CreateClubForm />

        <Panel
          title="Ваши клубы"
          description="Клубы, где вы owner. Участников и настройки открывайте из кабинета клуба — без cookie-switcher."
        >
          {owned.length === 0 ? (
            <p className="py-6 text-sm text-ink-muted">Пока нет клубов — создайте первый выше.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {owned.map((item) => (
                <li
                  key={item.clubId}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[0.95rem] font-medium text-ink">
                      <Building2 className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                      {item.name}
                    </p>
                    <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">
                      {item.slug} · {item.role}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/organizer/members?club=${encodeURIComponent(item.slug)}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Участники
                    </Link>
                    <Link
                      href={`/organizer/settings?club=${encodeURIComponent(item.slug)}`}
                      className="btn btn-ghost btn-sm"
                    >
                      Настройки
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
