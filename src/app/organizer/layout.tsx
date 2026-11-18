import type { Metadata } from "next";
import { OrganizerNav } from "@/components/organizer/OrganizerNav";

export const metadata: Metadata = {
  title: {
    default: "Кабинет организатора",
    template: "%s · Организатор лиги Mr. Pushkin",
  },
  description: "Управление турнирами, игроками, матчами и рейтингом лиги Mr. Pushkin.",
};

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[264px_minmax(0,1fr)] print:block print:bg-white">
      <OrganizerNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
