import type { Metadata } from "next";
import {
  CalendarDays,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { OrganizerHeader, OrgStat, Panel } from "@/components/organizer/OrganizerUI";
import {
  fetchOrganizerAnalyticsSummary,
  type AnalyticsMonthPoint,
  type OrganizerAnalyticsSummary,
} from "@/lib/api/organizer-analytics";
import { ApiError } from "@/lib/api/client";
import {
  CLUB,
  MATCH_STATUS_LABEL,
  REGISTRATION_STATUS_LABEL,
  STATUS_BY_VALUE,
} from "@/lib/domain";
import { requireFullOrganizerSession } from "@/lib/organizer-access";
import type { MatchStatus, RegistrationStatus, TournamentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Аналитика",
  description: `Сводка по клубу на платформе ${CLUB.productName}.`,
};

function tournamentStatusLabel(status: string): string {
  return STATUS_BY_VALUE[status as TournamentStatus]?.label ?? status;
}

function registrationStatusLabel(status: string): string {
  return REGISTRATION_STATUS_LABEL[status as RegistrationStatus] ?? status;
}

function matchStatusLabel(status: string): string {
  if (status === "disqualified") return "Дисквалификация";
  return MATCH_STATUS_LABEL[status as MatchStatus] ?? status;
}

function monthLabel(month: string): string {
  const [year, mon] = month.split("-");
  if (!year || !mon) return month;
  const names = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек",
  ];
  const idx = Number(mon) - 1;
  if (idx < 0 || idx > 11) return month;
  return `${names[idx]} ${year.slice(2)}`;
}

function GrowthBars({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points: AnalyticsMonthPoint[];
}) {
  const max = Math.max(0, ...points.map((point) => point.count));
  return (
    <Panel title={title} description={description}>
      {points.length === 0 ? (
        <p className="py-4 text-[0.78rem] text-ink-muted">За выбранный период данных нет.</p>
      ) : (
        <ul className="space-y-3 py-2">
          {points.map((point) => {
            const width = max > 0 ? Math.max(4, Math.round((point.count / max) * 100)) : 0;
            return (
              <li key={point.month} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                <span className="text-[0.66rem] uppercase tracking-[0.08em] text-ink-muted">
                  {monthLabel(point.month)}
                </span>
                <span className="block h-2 bg-line">
                  <span
                    className="block h-full bg-ink"
                    style={{ width: `${width}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-right text-[0.78rem] tabular-nums text-ink">{point.count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function StatusTable({
  title,
  description,
  rows,
  labelFor,
}: {
  title: string;
  description: string;
  rows: [string, number][];
  labelFor: (status: string) => string;
}) {
  return (
    <Panel title={title} description={description} flush>
      {rows.length === 0 ? (
        <p className="px-0 py-4 text-[0.78rem] text-ink-muted">Пока нет записей.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table min-w-[280px]">
            <thead>
              <tr>
                <th>Статус</th>
                <th className="text-right">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([status, count]) => (
                <tr key={status}>
                  <td className="text-[0.78rem] text-ink">{labelFor(status)}</td>
                  <td className="text-right text-[0.78rem] tabular-nums text-ink-soft">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function sortedStatusEntries(byStatus: Record<string, number>): [string, number][] {
  return Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
}

export default async function OrganizerAnalyticsPage() {
  await requireFullOrganizerSession();

  let summary: OrganizerAnalyticsSummary | null = null;
  let loadError: string | null = null;
  try {
    summary = await fetchOrganizerAnalyticsSummary();
  } catch (error) {
    if (error instanceof ApiError) {
      loadError = error.message;
    } else {
      loadError = "Не удалось загрузить аналитику";
    }
  }

  const clubLabel = summary?.clubName || summary?.clubSlug || CLUB.productName;

  return (
    <>
      <OrganizerHeader
        eyebrow={`Владелец · ${clubLabel}`}
        title="Аналитика"
        description="Сводка по игрокам, турнирам, заявкам и матчам текущего клуба. Доступна только владельцу."
      />

      <div className="space-y-7 px-4 py-7 md:px-8 lg:px-10">
        {loadError || !summary ? (
          <Panel title="Данные недоступны">
            <p className={cn("py-4 text-[0.78rem]", loadError ? "text-negative" : "text-ink-muted")}>
              {loadError ?? "Нет данных."}
            </p>
          </Panel>
        ) : (
          <>
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              <OrgStat
                label="Игроки"
                value={summary.players.approvedActive}
                hint="подтверждённые активные"
                icon={<Users className="size-4" />}
                tone="neutral"
              />
              <OrgStat
                label="Активные участники"
                value={summary.players.membersActive}
                hint="членства клуба"
                icon={<UserPlus className="size-4" />}
              />
              <OrgStat
                label="Турниры"
                value={summary.tournaments.total}
                hint={`активных: ${summary.tournaments.activeNonTerminal}`}
                icon={<Trophy className="size-4" />}
                tone="positive"
              />
              <OrgStat
                label="Матчи сыграны"
                value={summary.matches.completed}
                hint={`открытых: ${summary.matches.openPlayable}`}
                icon={<CalendarDays className="size-4" />}
                tone="warning"
              />
            </div>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
              <OrgStat
                label="Заявки на вход"
                value={summary.players.pendingApplications}
                hint="ждут подтверждения"
                icon={<UserCheck className="size-4" />}
              />
              <OrgStat
                label="Плейсхолдеры"
                value={summary.players.placeholders}
                hint="без email"
                icon={<Users className="size-4" />}
                tone="neutral"
              />
              <OrgStat
                label="Регистрации"
                value={summary.registrations.confirmed}
                hint={`ожидают: ${summary.registrations.pending}`}
                icon={<UserPlus className="size-4" />}
                tone="positive"
              />
              <OrgStat
                label="Матчи live"
                value={summary.matches.live}
                hint={`запланировано: ${summary.matches.scheduled}`}
                icon={<CalendarDays className="size-4" />}
              />
            </div>

            <div className="grid gap-8 xl:grid-cols-3">
              <StatusTable
                title="Турниры по статусам"
                description="Все турниры клуба."
                rows={sortedStatusEntries(summary.tournaments.byStatus)}
                labelFor={tournamentStatusLabel}
              />
              <StatusTable
                title="Регистрации"
                description="Заявки на турниры клуба."
                rows={sortedStatusEntries(summary.registrations.byStatus)}
                labelFor={registrationStatusLabel}
              />
              <StatusTable
                title="Матчи"
                description="Без bye."
                rows={sortedStatusEntries(summary.matches.byStatus)}
                labelFor={matchStatusLabel}
              />
            </div>

            <div className="grid gap-8 xl:grid-cols-3">
              <GrowthBars
                title="Новые игроки"
                description={`По месяцам с ${summary.growth.since}.`}
                points={summary.growth.players}
              />
              <GrowthBars
                title="Регистрации"
                description={`По месяцам с ${summary.growth.since}.`}
                points={summary.growth.registrations}
              />
              <GrowthBars
                title="Сыгранные матчи"
                description={`Завершённые, walkover и DQ с ${summary.growth.since}.`}
                points={summary.growth.matches}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
