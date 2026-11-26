"use client";

import { CountUp } from "@/components/motion/CountUp";
import { AvatarRing } from "@/components/polish/AvatarRing";
import { XpBar } from "@/components/polish/XpBar";
import { StreakFlame } from "@/components/polish/StreakFlame";
import { ActivityHeatmap } from "@/components/polish/ActivityHeatmap";
import { BadgeUnlock } from "@/components/polish/BadgeUnlock";
import { CategoryBadge } from "@/components/ui/Badges";
import type { CategorySlug } from "@/lib/types";

function streakFromForm(form: number[]) {
  let streak = 0;
  for (const delta of form) {
    if (delta > 0) streak += 1;
    else break;
  }
  return streak;
}

function weeksFromForm(form: number[]) {
  return form
    .slice()
    .reverse()
    .map((delta) => (delta > 8 ? 3 : delta > 0 ? 2 : delta < 0 ? 1 : 0));
}

export function PlayerHeroMeta({
  firstName,
  lastName,
  avatarUrl,
  category,
  memberSinceYear,
  rating,
  points,
  form,
}: {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  category: CategorySlug;
  memberSinceYear?: number | null;
  rating: number;
  points: number;
  form: number[];
}) {
  const streak = streakFromForm(form);
  const progress = Math.min(100, Math.round((rating / 2200) * 100));

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <AvatarRing firstName={firstName} lastName={lastName} src={avatarUrl} progress={progress} size={112} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <BadgeUnlock unlockKey={category}>
            <CategoryBadge category={category} />
          </BadgeUnlock>
          {memberSinceYear ? (
            <span className="badge badge-neutral">На платформе с {memberSinceYear}</span>
          ) : null}
          <StreakFlame streak={streak} />
        </div>
        <h1 className="mt-3">
          {firstName} {lastName}
        </h1>
        <div className="mt-4 max-w-sm">
          <XpBar value={progress} label="Уровень мастерства" />
        </div>
      </div>
      <div className="flex gap-8 border-t border-line pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        <div>
          <p className="stat-value">
            <CountUp value={rating} />
          </p>
          <p className="stat-label mt-1.5">рейтинг</p>
        </div>
        <div>
          <p className="stat-value">
            <CountUp value={points} />
          </p>
          <p className="stat-label mt-1.5">очков</p>
        </div>
      </div>
    </div>
  );
}

export function PlayerStatStrip({
  wins,
  losses,
  rate,
  tournamentsCount,
}: {
  wins: number;
  losses: number;
  rate: number;
  tournamentsCount: number;
}) {
  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-7 border-y border-line py-7 sm:grid-cols-4">
      {[
        { value: wins, label: "побед", suffix: "" },
        { value: losses, label: "поражений", suffix: "" },
        { value: rate, label: "процент побед", suffix: "%" },
        { value: tournamentsCount, label: "турниров", suffix: "" },
      ].map((stat) => (
        <div key={stat.label}>
          <p className="display text-[1.9rem] leading-none tabular-nums">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="stat-label mt-2">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}

export function PlayerActivity({ form }: { form: number[] }) {
  return <ActivityHeatmap weeks={weeksFromForm(form)} className="border-t border-line pt-6" />;
}
