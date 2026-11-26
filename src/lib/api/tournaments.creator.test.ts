import { describe, expect, it } from "vitest";
import { formatTournamentCreatorLabel } from "./tournaments";

describe("formatTournamentCreatorLabel", () => {
  it("returns name only and never surfaces email-like fields", () => {
    expect(
      formatTournamentCreatorLabel({
        id: "11111111-1111-4111-8111-111111111111",
        firstName: "Дмитрий",
        lastName: "Кожемякин",
      }),
    ).toBe("Дмитрий Кожемякин");
  });

  it("returns empty for missing creator", () => {
    expect(formatTournamentCreatorLabel(undefined)).toBe("");
    expect(formatTournamentCreatorLabel(null)).toBe("");
  });
});
