import { describe, expect, it } from "vitest";
import { mapTournament } from "./tournaments";

describe("mapTournament places (MP-87 + place-4)", () => {
  it("maps suggested_places, places_mismatch, and place 4", () => {
    const mapped = mapTournament({
      id: "00000000-0000-4000-8000-000000000001",
      slug: "t",
      title: "Test",
      description: "",
      type: "singles",
      category: "open",
      surface: "hard",
      format: "olympic",
      status: "completed",
      starts_at: "2026-01-01T00:00:00Z",
      ends_at: "2026-01-02T00:00:00Z",
      registration_opens_at: "2025-12-01T00:00:00Z",
      registration_closes_at: "2025-12-31T00:00:00Z",
      venue: {
        id: "00000000-0000-4000-8000-000000000099",
        name: "Courts",
        address: "",
        courts: 4,
        surface: "hard",
      },
      entry_fee: 0,
      max_participants: 16,
      regulations: "",
      season: 2026,
      winners: [{ place: 4, player_ids: ["00000000-0000-4000-8000-000000000004"] }],
      suggested_places: [
        { place: 3, player_ids: ["00000000-0000-4000-8000-000000000003"] },
        { place: 4, player_ids: ["00000000-0000-4000-8000-000000000004"] },
      ],
      places_mismatch: true,
    });

    expect(mapped.placesMismatch).toBe(true);
    expect(mapped.winners).toEqual([
      { place: 4, playerIds: ["00000000-0000-4000-8000-000000000004"] },
    ]);
    expect(mapped.suggestedPlaces).toEqual([
      { place: 3, playerIds: ["00000000-0000-4000-8000-000000000003"] },
      { place: 4, playerIds: ["00000000-0000-4000-8000-000000000004"] },
    ]);
  });
});
