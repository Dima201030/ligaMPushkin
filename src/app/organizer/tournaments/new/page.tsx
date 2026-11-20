import type { Metadata } from "next";
import { CLUB_VENUES } from "@/lib/data";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { TournamentWizard } from "@/components/organizer/TournamentWizard";

export const metadata: Metadata = {
  title: "Новый турнир",
};

export default function NewTournamentPage() {
  return (
    <>
      <OrganizerHeader
        eyebrow="Турниры · создание"
        title="Новый турнир"
        description="Заполните карточку за несколько минут. Черновик можно сохранить и вернуться к нему позже — участники не увидят турнир до публикации."
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <TournamentWizard venues={CLUB_VENUES} />
      </div>
    </>
  );
}
