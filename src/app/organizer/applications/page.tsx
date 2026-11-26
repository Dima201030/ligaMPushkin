import type { Metadata } from "next";
import { OrganizerHeader } from "@/components/organizer/OrganizerUI";
import { AccountApprovals } from "@/components/organizer/AccountApprovals";

export const metadata: Metadata = { title: "Заявки игроков" };

export default function OrganizerApplicationsPage() {
  return (
    <>
      <OrganizerHeader
        eyebrow="Доступ на платформу"
        title="Заявки на подтверждение"
        description="Игрок регистрируется сам, а администратор проверяет имя, фамилию и уровень. Только после подтверждения аккаунт может войти в личный кабинет."
      />
      <div className="px-4 py-7 md:px-8 lg:px-10">
        <AccountApprovals />
      </div>
    </>
  );
}
