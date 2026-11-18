import { Award, TrendingUp, UserPlus, Users } from "lucide-react";
import { listOrganizerPlayers } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { OrganizerHeader, OrgStat } from "@/components/organizer/OrganizerUI";
import { OrganizerPlayersTable } from "@/components/organizer/OrganizerPlayersTable";

export default async function OrganizerPlayersPage() {
  const players = await listOrganizerPlayers();
  const averageRating = Math.round(players.reduce((sum, player) => sum + player.rating, 0) / players.length);
  const newcomers = players.filter((player) => player.category === "newcomers").length;
  const titles = players.reduce((sum, player) => sum + player.titlesCount, 0);
  const totalMatches = players.reduce((sum, player) => sum + player.wins + player.losses, 0);

  return (
    <>
      <OrganizerHeader
        eyebrow="База лиги"
        title="Игроки"
        description="Каталог участников: категории, рейтинг, статистика и контакты. Категория меняется в таблице — в продакшене изменение попадёт в журнал."
      />
      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <OrgStat label="Игроков в базе" value={players.length} hint="активные профили" icon={<Users className="size-4" />} tone="neutral" />
          <OrgStat label="Средний рейтинг" value={averageRating} hint={`${formatNumber(totalMatches)} матчей сыграно`} icon={<TrendingUp className="size-4" />} />
          <OrgStat label="Новички" value={newcomers} hint="первый сезон в лиге" icon={<UserPlus className="size-4" />} tone="positive" />
          <OrgStat label="Титулы" value={titles} hint="за всё время в лиге" icon={<Award className="size-4" />} tone="warning" />
        </div>

        <OrganizerPlayersTable players={players} />
      </div>
    </>
  );
}
