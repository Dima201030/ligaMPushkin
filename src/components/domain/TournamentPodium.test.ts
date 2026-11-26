import { describe, expect, it } from "vitest";
import { normalizePodiumEntries, type PodiumEntry } from "./TournamentPodium";

describe("normalizePodiumEntries", () => {
  it("splits legacy shared bronze into places 3 and 4", () => {
    const entries: PodiumEntry[] = [
      { place: 1, players: [{ name: "A", slug: "a" }] },
      { place: 2, players: [{ name: "B", slug: "b" }] },
      {
        place: 3,
        players: [
          { name: "C", slug: "c" },
          { name: "D", slug: "d" },
        ],
      },
    ];
    expect(normalizePodiumEntries(entries)).toEqual([
      { place: 1, players: [{ name: "A", slug: "a" }] },
      { place: 2, players: [{ name: "B", slug: "b" }] },
      { place: 3, players: [{ name: "C", slug: "c" }] },
      { place: 4, players: [{ name: "D", slug: "d" }] },
    ]);
  });

  it("drops duplicated 3→4 name pairs", () => {
    const entries: PodiumEntry[] = [
      { place: 3, players: [{ name: "C", slug: "c" }] },
      { place: 4, players: [{ name: "C", slug: "c" }] },
    ];
    expect(normalizePodiumEntries(entries)).toEqual([
      { place: 3, players: [{ name: "C", slug: "c" }] },
    ]);
  });

  it("keeps explicit distinct 3 and 4", () => {
    const entries: PodiumEntry[] = [
      { place: 3, players: [{ name: "C", slug: "c" }] },
      { place: 4, players: [{ name: "D", slug: "d" }] },
    ];
    expect(normalizePodiumEntries(entries)).toEqual(entries);
  });
});
