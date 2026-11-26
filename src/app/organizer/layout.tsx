import type { Metadata } from "next";
import { EmailConfirmBanner } from "@/components/layout/EmailConfirmBanner";
import { OrganizerNav } from "@/components/organizer/OrganizerNav";
import { CLUB } from "@/lib/domain";
import { hasFullOrganizerAccess } from "@/lib/api/auth";
import { requireOrganizerSession } from "@/lib/organizer-access";

export const metadata: Metadata = {
  title: {
    default: "Кабинет организатора",
    template: `%s · Организатор ${CLUB.leagueName}`,
  },
  description: `Управление турнирами, игроками, матчами и рейтингом ${CLUB.leagueName}.`,
};

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireOrganizerSession();
  const fullAccess = hasFullOrganizerAccess(session);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[264px_minmax(0,1fr)] print:block print:bg-white">
      <OrganizerNav
        organizerName={`${session.user.firstName} ${session.user.lastName}`}
        organizerEmail={session.user.email}
        access={fullAccess ? "full" : "tournament"}
      />
      <div className="min-w-0">
        <EmailConfirmBanner />
        {children}
      </div>
    </div>
  );
}
