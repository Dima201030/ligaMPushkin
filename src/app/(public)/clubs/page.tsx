import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchClubs } from "@/lib/api/clubs";
import { CLUB_COOKIE, clubPath, DEFAULT_CLUB_SLUG } from "@/lib/club/tenant";
import { CLUB } from "@/lib/domain";
import { PageHeader } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Клубы",
  description: `Клубы на платформе ${CLUB.productName}: выберите клуб для турниров и рейтинга.`,
};

export default async function ClubsPage() {
  const jar = await cookies();
  const activeSlug = jar.get(CLUB_COOKIE)?.value || DEFAULT_CLUB_SLUG;
  const clubs = await fetchClubs().catch(() => []);

  return (
    <>
      <PageHeader
        eyebrow={CLUB.productName}
        title="Клубы"
        description="Выберите клуб — турниры, рейтинг и кабинет откроются в его контексте."
      />

      <div className="page-shell section">
        <ul className="divide-y divide-line border-y border-line">
          {clubs.length === 0 ? (
            <li className="py-8 text-center text-sm text-ink-muted">Пока нет доступных клубов.</li>
          ) : (
            clubs.map((club) => {
              const active = club.slug === activeSlug;
              return (
                <li
                  key={club.id}
                  className="flex flex-wrap items-baseline justify-between gap-4 py-5"
                >
                  <div>
                    <p className="display text-[1.55rem] leading-none text-ink">{club.name}</p>
                    {club.city ? (
                      <p className="mt-2 text-[0.78rem] uppercase tracking-[0.14em] text-ink-muted">
                        {club.city}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={clubPath(club.slug, "/")}
                    className="btn btn-primary"
                    aria-current={active ? "page" : undefined}
                  >
                    {active ? "Текущий клуб" : "Открыть"}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}
