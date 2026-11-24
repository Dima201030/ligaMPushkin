import { Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type PodiumEntry = {
  place: 1 | 2 | 3;
  names: string[];
};

const META: Record<
  1 | 2 | 3,
  { title: string; note: string; numeral: string; frame: string; accent: string }
> = {
  1: {
    title: "Первое место",
    note: "Победитель турнира",
    numeral: "text-warning",
    frame: "border-warning/50",
    accent: "bg-warning",
  },
  2: {
    title: "Второе место",
    note: "Финалист",
    numeral: "text-ink",
    frame: "border-line-strong",
    accent: "bg-line-strong",
  },
  3: {
    title: "Третье место",
    note: "Бронзовый призёр",
    numeral: "text-ink-muted",
    frame: "border-line",
    accent: "bg-line",
  },
};

function PodiumCard({ entry, featured }: { entry: PodiumEntry; featured: boolean }) {
  const meta = META[entry.place];
  return (
    <div
      className={cn(
        "relative flex h-full flex-col border bg-canvas p-5 pt-6",
        meta.frame,
        featured && "sm:-mt-4 sm:pb-7",
      )}
    >
      <span className={cn("absolute left-0 top-0 h-0.5 w-full", meta.accent)} aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <span className={cn("display text-[2.2rem] leading-none tabular-nums", meta.numeral)}>
          {entry.place}
        </span>
        {entry.place === 1 ? (
          <Trophy className="size-5 text-warning" aria-hidden="true" />
        ) : (
          <Medal className="size-5 text-ink-faint" aria-hidden="true" />
        )}
      </div>
      <p className="mt-5 text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">{meta.title}</p>
      <p className="mt-1 text-[0.66rem] text-ink-faint">{meta.note}</p>
      <div className="mt-3 space-y-1 border-t border-line pt-3">
        {entry.names.length > 0 ? (
          entry.names.map((name) => (
            <p key={name} className="text-[0.92rem] font-medium leading-snug text-ink">
              {name}
            </p>
          ))
        ) : (
          <p className="text-[0.82rem] text-ink-muted">Имя не указано</p>
        )}
      </div>
    </div>
  );
}

export function TournamentPodium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null;

  const ordered = [...entries].sort((a, b) => a.place - b.place);
  const three = ordered.length === 3;

  return (
    <section className="border-t border-line pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Призёры турнира</h2>
        <span className="text-[0.6rem] uppercase tracking-[0.14em] text-ink-muted">
          {ordered.length === 1 ? "1 место" : `${ordered.length} места`}
        </span>
      </div>
      <div
        className={cn(
          "mt-5 grid items-stretch gap-3",
          ordered.length === 1
            ? "max-w-sm"
            : ordered.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-3",
        )}
      >
        {ordered.map((entry) => (
          <div
            key={entry.place}
            className={cn(
              "h-full",
              three && entry.place === 1 && "sm:order-2",
              three && entry.place === 2 && "sm:order-1",
              three && entry.place === 3 && "sm:order-3",
            )}
          >
            <PodiumCard entry={entry} featured={entry.place === 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
