import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchSession, isOrganizerRole } from "@/lib/api/auth";
import { OrganizerNav } from "@/components/organizer/OrganizerNav";

export const metadata: Metadata = {
  title: {
    default: "Кабинет организатора",
    template: "%s · Организатор лиги Mr. Pushkin",
  },
  description: "Управление турнирами, игроками, матчами и рейтингом лиги Mr. Pushkin.",
};

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const session = await fetchSession();
  if (!session) {
    redirect("/login?next=/organizer");
  }
  if (!isOrganizerRole(session.user.role) || session.user.status !== "approved") {
    redirect("/cabinet");
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[264px_minmax(0,1fr)] print:block print:bg-white">
      <OrganizerNav
        organizerName={`${session.user.firstName} ${session.user.lastName}`}
        organizerEmail={session.user.email}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
