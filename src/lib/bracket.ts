import type { TournamentFormat } from "@/lib/types";

/**
 * Bracket/draw generator used by the organizer studio and, later, by the
 * server action that persists a published draw to the database.
 *
 * The module is intentionally pure: it takes seeded entries and returns a
 * serialisable draw tree. No dates, no randomness, no React.
 */

export interface BracketEntry {
  /** Set when the entry is a real player/team. Empty for qualifier placeholders. */
  playerId?: string;
  name: string;
  seed?: number;
  rating?: number;
  /** Qualifier placeholders such as "A1" or "B2". */
  isPlaceholder?: boolean;
}

export interface BracketSlot {
  playerId?: string;
  name?: string;
  seed?: number;
  placeholder?: string;
  isBye?: boolean;
}

export interface BracketMatch {
  id: string;
  roundIndex: number;
  position: number;
  slot1: BracketSlot;
  slot2: BracketSlot;
  nextMatchId?: string;
  nextSlot?: 1 | 2;
  /** 1 or 2 when a bye advances a player automatically. */
  automaticWinner?: 1 | 2;
}

export interface BracketRound {
  index: number;
  label: string;
  matches: BracketMatch[];
}

export interface GroupStage {
  name: string;
  entries: BracketEntry[];
  matches: BracketMatch[];
}

export interface GeneratedDraw {
  format: TournamentFormat;
  entriesCount: number;
  bracketSize: number;
  byes: number;
  rounds: BracketRound[];
  lowerRounds?: BracketRound[];
  groups?: GroupStage[];
  playoffRounds?: BracketRound[];
  thirdPlace?: BracketMatch;
  grandFinal?: BracketMatch;
  matchCount: number;
}

export interface DrawOptions {
  groupSize?: number;
  qualifiersPerGroup?: number;
  thirdPlace?: boolean;
}

const ROUND_NAMES: Record<number, string> = {
  1: "Финал",
  2: "Полуфинал",
  4: "1/4 финала",
  8: "1/8 финала",
  16: "1/16 финала",
  32: "1/32 финала",
};

export function roundLabel(matchesInRound: number) {
  return ROUND_NAMES[matchesInRound] ?? `1/${matchesInRound * 2} финала`;
}

export function nextPowerOfTwo(value: number) {
  let size = 2;
  while (size < value) size *= 2;
  return size;
}

/**
 * Classic bracket seed order. For size 8: [1,8,4,5,2,7,3,6].
 * Reading pairs gives the first-round pairing.
 */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const next = order.length * 2 + 1;
    order = order.flatMap((seed) => [seed, next - seed]);
  }
  return order;
}

function seededEntries(entries: BracketEntry[]): BracketEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const left = a.entry.seed ?? 10_000 + a.index;
      const right = b.entry.seed ?? 10_000 + b.index;
      return left - right;
    })
    .map((item) => item.entry);
}

function entrySlot(entry?: BracketEntry): BracketSlot {
  if (!entry) return { isBye: true };
  if (entry.isPlaceholder) {
    return { placeholder: entry.name, seed: entry.seed };
  }
  return { playerId: entry.playerId, name: entry.name, seed: entry.seed };
}

function winnerSlot(match: BracketMatch, winner: 1 | 2): BracketSlot {
  return winner === 1 ? match.slot1 : match.slot2;
}

/* ────────────────────────────── single elimination ───────────────────────── */

export function buildSingleElimination(
  entries: BracketEntry[],
  options: { thirdPlace?: boolean } = {},
): GeneratedDraw {
  const ranked = seededEntries(entries);
  if (ranked.length < 2) {
    return {
      format: "olympic",
      entriesCount: ranked.length,
      bracketSize: ranked.length,
      byes: 0,
      rounds: [],
      matchCount: 0,
    };
  }

  const size = nextPowerOfTwo(ranked.length);
  const order = seedOrder(size);
  // order contains seed numbers: seed 1 is the top-ranked entry, seed 8 the
  // lowest. Missing seeds become byes.
  const placed: (BracketEntry | undefined)[] = order.map((seedNumber) => ranked[seedNumber - 1]);

  const totalRounds = Math.log2(size);
  const rounds: BracketRound[] = [];

  for (let round = 0; round < totalRounds; round += 1) {
    const matchCount = size / 2 ** (round + 1);
    const matches: BracketMatch[] = [];

    for (let position = 0; position < matchCount; position += 1) {
      const match: BracketMatch = {
        id: `R${round + 1}M${position + 1}`,
        roundIndex: round,
        position,
        slot1:
          round === 0
            ? entrySlot(placed[position * 2])
            : { placeholder: `Победитель R${round}M${position * 2 + 1}` },
        slot2:
          round === 0
            ? entrySlot(placed[position * 2 + 1])
            : { placeholder: `Победитель R${round}M${position * 2 + 2}` },
        nextMatchId:
          round < totalRounds - 1
            ? `R${round + 2}M${Math.floor(position / 2) + 1}`
            : undefined,
        nextSlot: ((position % 2) + 1) as 1 | 2,
      };

      if (round === 0) {
        const hasFirst = Boolean(match.slot1.name || match.slot1.playerId);
        const hasSecond = Boolean(match.slot2.name || match.slot2.playerId);
        if (hasFirst && !hasSecond) {
          match.automaticWinner = 1;
          match.slot2 = { isBye: true, placeholder: "Пропуск" };
        } else if (!hasFirst && hasSecond) {
          match.automaticWinner = 2;
          match.slot1 = { isBye: true, placeholder: "Пропуск" };
        }
      }

      matches.push(match);
    }

    rounds.push({ index: round, label: roundLabel(matchCount), matches });
  }

  // Push bye winners into the next round so the preview reads correctly.
  for (let round = 0; round < rounds.length - 1; round += 1) {
    for (const match of rounds[round].matches) {
      if (!match.automaticWinner || !match.nextMatchId || !match.nextSlot) continue;
      const next = rounds[round + 1].matches.find((item) => item.id === match.nextMatchId);
      if (!next) continue;
      const slot = winnerSlot(match, match.automaticWinner);
      if (match.nextSlot === 1) next.slot1 = slot;
      else next.slot2 = slot;
    }
  }

  let thirdPlace: BracketMatch | undefined;
  if (options.thirdPlace && size >= 4) {
    const semis = rounds[rounds.length - 2]?.matches ?? [];
    thirdPlace = {
      id: "R3P",
      roundIndex: rounds.length - 2,
      position: 0,
      slot1: {
        placeholder: `Проигравший ${semis[0]?.id ?? "SF1"}`,
      },
      slot2: {
        placeholder: `Проигравший ${semis[1]?.id ?? "SF2"}`,
      },
    };
  }

  const matchCount = rounds.reduce((sum, round) => sum + round.matches.length, 0) + (thirdPlace ? 1 : 0);

  return {
    format: "olympic",
    entriesCount: ranked.length,
    bracketSize: size,
    byes: size - ranked.length,
    rounds,
    thirdPlace,
    matchCount,
  };
}

/* ──────────────────────────────── round robin ────────────────────────────── */

export function buildRoundRobin(entries: BracketEntry[], idPrefix = "RR"): BracketRound[] {
  const list = seededEntries(entries);
  const slots: (BracketEntry | undefined)[] = [...list];
  if (slots.length % 2 === 1) slots.push(undefined);

  const count = slots.length;
  if (count < 2) return [];

  const rounds: BracketRound[] = [];
  const rotation = [...slots];

  for (let round = 0; round < count - 1; round += 1) {
    const matches: BracketMatch[] = [];
    for (let index = 0; index < count / 2; index += 1) {
      const first = rotation[index];
      const second = rotation[count - 1 - index];
      if (!first && !second) continue;
      matches.push({
        id: `${idPrefix}R${round + 1}M${index + 1}`,
        roundIndex: round,
        position: index,
        slot1: entrySlot(first),
        slot2: entrySlot(second),
      });
    }
    rounds.push({
      index: round,
      label: `Круг ${round + 1}`,
      matches,
    });

    // Rotate all but the first slot (circle method).
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return rounds;
}

/* ─────────────────────────────── group stage ─────────────────────────────── */

const GROUP_LETTERS = "ABCDEFGH";

export function buildGroups(entries: BracketEntry[], groupSize = 4): GroupStage[] {
  const ranked = seededEntries(entries);
  const groupCount = Math.max(1, Math.ceil(ranked.length / Math.max(2, groupSize)));
  const groups: GroupStage[] = Array.from({ length: groupCount }, (_, index) => ({
    name: `Группа ${GROUP_LETTERS[index]}`,
    entries: [],
    matches: [],
  }));

  // Snake distribution keeps the strongest players apart.
  ranked.forEach((entry, index) => {
    const cycle = Math.floor(index / groupCount);
    const offset = index % groupCount;
    const target = cycle % 2 === 0 ? offset : groupCount - 1 - offset;
    groups[target].entries.push(entry);
  });

  groups.forEach((group, index) => {
    const rounds = buildRoundRobin(group.entries, `G${GROUP_LETTERS[index]}`);
    group.matches = rounds.flatMap((round) =>
      round.matches.map((match) => ({
        ...match,
        id: `${GROUP_LETTERS[index]}-${match.id}`,
      })),
    );
  });

  return groups;
}

/* ─────────────────────────── groups + playoff ────────────────────────────── */

export function buildGroupsPlayoff(
  entries: BracketEntry[],
  options: DrawOptions = {},
): GeneratedDraw {
  const groupSize = options.groupSize ?? 4;
  const qualifiersPerGroup = Math.max(1, options.qualifiersPerGroup ?? 2);
  const groups = buildGroups(entries, groupSize);

  const qualified: BracketEntry[] = [];
  groups.forEach((group) => {
    for (let place = 1; place <= qualifiersPerGroup; place += 1) {
      qualified.push({
        name: `${group.name.replace("Группа ", "")}${place}`,
        isPlaceholder: true,
      });
    }
  });
  // Give qualifier placeholders a seed so group winners are separated.
  qualified.forEach((entry, index) => {
    entry.seed = index + 1;
  });

  const playoff = buildSingleElimination(qualified, { thirdPlace: options.thirdPlace });
  const groupMatchCount = groups.reduce((sum, group) => sum + group.matches.length, 0);

  return {
    ...playoff,
    format: "groups_playoff",
    entriesCount: entries.length,
    groups,
    playoffRounds: playoff.rounds,
    rounds: [],
    matchCount: groupMatchCount + playoff.matchCount,
  };
}

/* ─────────────────────────── double elimination ──────────────────────────── */

export function buildDoubleElimination(entries: BracketEntry[]): GeneratedDraw {
  const upper = buildSingleElimination(entries);
  if (upper.bracketSize < 2) return { ...upper, format: "double_elimination" };

  const size = upper.bracketSize;
  const log = Math.log2(size);
  const lowerRounds: BracketRound[] = [];

  // Lower bracket has 2*log2(size)-2 rounds. Even rounds pair upper-bracket
  // losers, odd rounds feed in the next wave of upper-bracket losers.
  for (let round = 0; round < 2 * log - 2; round += 1) {
    const matchCount = size / 2 ** (Math.floor(round / 2) + 2);
    const matches: BracketMatch[] = [];
    for (let position = 0; position < matchCount; position += 1) {
      let slot1: BracketSlot;
      let slot2: BracketSlot;

      if (round === 0) {
        slot1 = { placeholder: `Проигравший ВС R1 M${position * 2 + 1}` };
        slot2 = { placeholder: `Проигравший ВС R1 M${position * 2 + 2}` };
      } else if (round % 2 === 0) {
        slot1 = { placeholder: `Победитель НС R${round} M${position * 2 + 1}` };
        slot2 = { placeholder: `Победитель НС R${round} M${position * 2 + 2}` };
      } else {
        slot1 = { placeholder: `Победитель НС R${round} M${position + 1}` };
        slot2 = { placeholder: `Проигравший ВС R${(round + 1) / 2 + 1} M${position + 1}` };
      }

      matches.push({
        id: `LB${round + 1}M${position + 1}`,
        roundIndex: round,
        position,
        slot1,
        slot2,
        nextMatchId:
          round < 2 * log - 3
            ? `LB${round + 2}M${Math.floor(position / 2) + 1}`
            : undefined,
        nextSlot: ((position % 2) + 1) as 1 | 2,
      });
    }
    lowerRounds.push({
      index: round,
      label: `Нижняя сетка · ${round + 1}`,
      matches,
    });
  }

  const grandFinal: BracketMatch = {
    id: "GF",
    roundIndex: 0,
    position: 0,
    slot1: { placeholder: "Победитель верхней сетки" },
    slot2: { placeholder: "Победитель нижней сетки" },
  };

  const lowerMatchCount = lowerRounds.reduce((sum, round) => sum + round.matches.length, 0);

  return {
    ...upper,
    format: "double_elimination",
    lowerRounds,
    grandFinal,
    matchCount: upper.matchCount + lowerMatchCount + 1,
  };
}

/* ──────────────────────────────── dispatcher ─────────────────────────────── */

export function generateDraw(
  format: TournamentFormat,
  entries: BracketEntry[],
  options: DrawOptions = {},
): GeneratedDraw {
  switch (format) {
    case "round_robin": {
      const rounds = buildRoundRobin(entries);
      return {
        format,
        entriesCount: entries.length,
        bracketSize: entries.length,
        byes: 0,
        rounds,
        matchCount: rounds.reduce((sum, round) => sum + round.matches.length, 0),
      };
    }
    case "groups_playoff":
      return buildGroupsPlayoff(entries, options);
    case "double_elimination":
      return buildDoubleElimination(entries);
    case "olympic":
    default:
      return buildSingleElimination(entries, { thirdPlace: options.thirdPlace });
  }
}

/**
 * Convert tournament registrations into bracket entries. Seeds come from the
 * registration, otherwise entries are ordered by rating.
 */
export function entriesFromRegistrations(
  registrations: { playerId: string; seed?: number; status: string }[],
  resolve: (playerId: string) => { firstName: string; lastName: string; rating: number } | undefined,
): BracketEntry[] {
  return registrations
    .filter((registration) => registration.status !== "cancelled" && registration.status !== "rejected")
    .map((registration) => {
      const player = resolve(registration.playerId);
      return {
        playerId: registration.playerId,
        name: player ? `${player.lastName} ${player.firstName}` : registration.playerId,
        seed: registration.seed,
        rating: player?.rating ?? 0,
      };
    })
    .sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
}
