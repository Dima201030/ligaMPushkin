import { Award, TrendingUp, UserPlus, Users } from "lucide-react";
import { listOrganizerPlayers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { OrganizerHeader, OrgStat } from "@/components/organizer/OrganizerUI";
import { OrganizerPlayersTable } from "@/components/organizer/OrganizerPlayersTable";
import { AddPlaceholderPlayerForm } from "@/components/organizer/AddPlaceholderPlayerForm";

export default async function OrganizerPlayersPage() {
  const players = await listOrganizerPlayers();
  const averageRating = players.length
    ? Math.round(players.reduce((sum, player) => sum + player.rating, 0) / players.length)
    : 0;
  const newcomers = players.filter((player) => player.category === "newcomers").length;
  const placeholders = players.filter((player) => player.isPlaceholder).length;
  const titles = players.reduce((sum, player) => sum + player.titlesCount, 0);
  const totalMatches = players.reduce((sum, player) => sum + player.wins + player.losses, 0);

  return (
    <>
      <OrganizerHeader
        eyebrow="База игроков"
        title="Игроки"
        description="Добавляйте участников без регистрации, затем связывайте заготовку с заявкой, когда человек зарегистрируется."
      />
      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat label="Игроков в базе" value={players.length} hint="активные профили" icon={<Users className="size-4" />} tone="neutral" />
          <OrgStat label="Средний рейтинг" value={averageRating} hint={`${formatNumber(totalMatches)} матчей сыграно`} icon={<TrendingUp className="size-4" />} />
          <OrgStat label="Без аккаунта" value={placeholders} hint="ждут объединения с заявкой" icon={<UserPlus className="size-4" />} tone="positive" />
          <OrgStat label="Титулы" value={titles || newcomers} hint={titles ? "за всё время на платформе" : "новички в базе"} icon={<Award className="size-4" />} tone="warning" />
        </div>

        <AddPlaceholderPlayerForm />
        <OrganizerPlayersTable players={players} />
      </div>
    </>
  );
}
