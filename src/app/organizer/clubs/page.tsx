import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Building2 } from "lucide-react";
import { CreateClubForm } from "@/components/organizer/CreateClubForm";
import { OrganizerHeader, Panel } from "@/components/organizer/OrganizerUI";
import { fetchMyClubs } from "@/lib/api/clubs";
import { CLUB_COOKIE, clubPath, DEFAULT_CLUB_SLUG } from "@/lib/club/tenant";
import { CLUB } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Клубы",
  description: `Создание и переключение клубов на платформе ${CLUB.productName}.`,
};

export default async function OrganizerClubsPage() {
  const jar = await cookies();
  const activeSlug = jar.get(CLUB_COOKIE)?.value || DEFAULT_CLUB_SLUG;
  const memberships = await fetchMyClubs().catch(() => []);

  return (
    <>
      <OrganizerHeader
        eyebrow={CLUB.productName}
        title="Клубы"
        description="Создайте новый клуб или переключитесь на существующий. Данные турниров и рейтинга изолированы по tenant."
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
          description="Memberships текущего аккаунта. «Открыть» переключает cookie клуба."
        >
          {memberships.length === 0 ? (
            <p className="py-6 text-sm text-ink-muted">Пока нет memberships — создайте первый клуб выше.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {memberships.map((item) => {
                const active = item.slug === activeSlug;
                return (
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
                        {active ? " · текущий" : ""}
                      </p>
                    </div>
                    <Link
                      href={clubPath(item.slug, "/organizer")}
                      className="btn btn-secondary btn-sm"
                      aria-current={active ? "page" : undefined}
                    >
                      {active ? "Текущий" : "Открыть"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
