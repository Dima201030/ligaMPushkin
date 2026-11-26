import { describe, expect, it } from "vitest";
import {
  TOURNAMENT_LIMITS,
  validateEventFields,
  validateNewsFields,
  validateTournamentFields,
} from "./tournament-limits";

describe("validateTournamentFields", () => {
  const base = {
    title: "Winter Cup",
    description: "ok",
    regulations: "р".repeat(40),
    startsAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString();
    })(),
    registrationClosesAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 12);
      return d.toISOString();
    })(),
    maxParticipants: "16",
  };

  it("accepts sane payload", () => {
    expect(validateTournamentFields(base)).toEqual({});
  });

  it("rejects oversized text", () => {
    expect(
      validateTournamentFields({
        ...base,
        title: "т".repeat(TOURNAMENT_LIMITS.titleMax + 1),
        description: "д".repeat(TOURNAMENT_LIMITS.descriptionMax + 1),
        regulations: "р".repeat(TOURNAMENT_LIMITS.regulationsMax + 1),
      }),
    ).toMatchObject({
      title: expect.stringContaining("120"),
      description: expect.stringContaining("2000"),
      regulations: expect.stringContaining("10000"),
    });
  });

  it("rejects start more than 6 months ahead", () => {
    const far = new Date();
    far.setMonth(far.getMonth() + 7);
    const close = new Date(far);
    close.setDate(close.getDate() - 2);
    expect(
      validateTournamentFields({
        ...base,
        startsAt: far.toISOString(),
        registrationClosesAt: close.toISOString(),
      }).startsAt,
    ).toMatch(/6 месяцев/);
  });

  it("rejects oversized price and seats", () => {
    expect(
      validateTournamentFields({
        ...base,
        entryFee: TOURNAMENT_LIMITS.entryFeeMax + 1,
        maxParticipants: TOURNAMENT_LIMITS.maxParticipantsMax + 1,
      }),
    ).toMatchObject({
      entryFee: expect.stringContaining("100000000"),
      maxParticipants: expect.stringContaining("500"),
    });
  });
});

describe("content limits", () => {
  it("rejects long news body", () => {
    expect(validateNewsFields({ title: "Новость", excerpt: "", body: "a".repeat(20001) }).body).toMatch(
      /20000/,
    );
  });

  it("rejects far event start", () => {
    const far = new Date();
    far.setMonth(far.getMonth() + 8);
    expect(
      validateEventFields({
        title: "Событие",
        description: "",
        location: "",
        startsAt: far.toISOString(),
      }).startsAt,
    ).toMatch(/6 месяцев/);
  });
});
