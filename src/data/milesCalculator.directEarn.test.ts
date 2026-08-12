import { describe, expect, it } from "vitest";
import {
  cards,
  getCardById,
  getDirectEarnProgrammeId,
  getDirectEarnRates,
  getRewardTypeForCardGroup,
  isDirectEarnCard,
} from "@/data/milesCalculator";

describe("direct airline-earning cards", () => {
  it("marks HLB Infinite Doctor's Edition as a direct Enrich earner", () => {
    const card = getCardById("hlb-infinite-doctor");
    expect(card).toBeDefined();
    expect(isDirectEarnCard(card)).toBe(true);
    expect(getDirectEarnProgrammeId(card!.cardGroupId)).toBe("enrich");
  });

  it("keeps the published HLB earn rates as reference only", () => {
    const doctor = getDirectEarnRates(getCardById("hlb-infinite-doctor"));
    expect(doctor.map((r) => r.rate)).toEqual([
      "RM1 = 1 Enrich Point",
      "RM4 = 1 Enrich Point",
      "RM4 = 1 Enrich Point",
      "RM6 = 1 Enrich Point",
    ]);
    const infiniteP = getDirectEarnRates(getCardById("hlb-infinite-p"));
    expect(infiniteP.map((r) => r.rate)).toEqual([
      "RM1 = 1 Enrich Point",
      "RM3 = 1 Enrich Point",
      "RM3 = 1 Enrich Point",
      "RM5 = 1 Enrich Point",
    ]);
  });

  it("treats every direct_airline card as a direct earner and nothing else", () => {
    for (const card of cards) {
      expect(isDirectEarnCard(card)).toBe(card.status === "direct_airline");
    }
  });

  it("defaults untagged card groups to transferable bank points", () => {
    const card = getCardById("mbb-visa-infinite");
    expect(card).toBeDefined();
    expect(getRewardTypeForCardGroup(card!.cardGroupId)).toBe("transferable_bank_points");
    expect(getDirectEarnProgrammeId(card!.cardGroupId)).toBeUndefined();
  });

  it("exposes a direct programme for every direct-earning group", () => {
    const directCards = cards.filter((c) => isDirectEarnCard(c));
    expect(directCards.length).toBeGreaterThan(0);
    for (const card of directCards) {
      expect(getDirectEarnProgrammeId(card.cardGroupId)).toBeTruthy();
    }
  });
});
