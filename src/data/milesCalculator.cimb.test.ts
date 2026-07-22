import { describe, it, expect } from "vitest";
import {
  auditCimbInventory,
  EXPECTED_CIMB_BONUS_POINTS_CARD_COUNT,
  EXPECTED_CIMB_BONUS_POINTS_CARD_IDS,
  getCardById,
  searchCardsInBank,
} from "./milesCalculator";
import { calculateEntry } from "@/lib/milesCalculator";

/* -------------------- Inventory audit -------------------- */

describe("CIMB inventory audit", () => {
  const report = auditCimbInventory();

  it("has exactly 11 current Bonus Points cards", () => {
    expect(EXPECTED_CIMB_BONUS_POINTS_CARD_IDS.length).toBe(
      EXPECTED_CIMB_BONUS_POINTS_CARD_COUNT,
    );
    expect(report.presentBonusPoints).toBe(EXPECTED_CIMB_BONUS_POINTS_CARD_COUNT);
  });

  it("has no missing expected Bonus Points card IDs", () => {
    expect(report.missingBonusPointsIds).toEqual([]);
  });

  it("has no unexpected Bonus Points card IDs", () => {
    expect(report.unexpectedBonusPointsIds).toEqual([]);
  });

  it("does not mis-classify any cashback card as Bonus Points", () => {
    expect(report.misclassifiedCashbackIds).toEqual([]);
  });

  it("keeps CIMB PETRONAS Visa Infinite-i as cashback, not Bonus Points", () => {
    const card = getCardById("cimb-petronas-vi-i");
    expect(card?.cardGroupId).toBe("cg-cimb-cashback");
    expect(card?.status).toBe("cashback_only");
  });
});

/* -------------------- Search -------------------- */

describe("CIMB card search", () => {
  const ids = (results: { id: string }[]) => results.map((r) => r.id);

  it("returns all three 'World' Bonus Points cards", () => {
    const found = ids(searchCardsInBank("cimb", "World"));
    expect(found).toEqual(
      expect.arrayContaining([
        "cimb-travel-world-elite",
        "cimb-travel-world",
        "cimb-world-mc",
      ]),
    );
  });

  it("returns all three 'Platinum' Bonus Points cards", () => {
    const found = ids(searchCardsInBank("cimb", "Platinum"));
    expect(found).toEqual(
      expect.arrayContaining([
        "cimb-travel-platinum",
        "cimb-visa-platinum",
        "cimb-platinum-i",
      ]),
    );
  });

  it("returns CIMB PETRONAS Visa Infinite-i as the exact cashback card", () => {
    const results = searchCardsInBank("cimb", "PETRONAS Visa Infinite-i");
    expect(ids(results)).toContain("cimb-petronas-vi-i");
    const card = results.find((c) => c.id === "cimb-petronas-vi-i");
    expect(card?.cardGroupId).toBe("cg-cimb-cashback");
  });

  it("returns CIMB e Credit Card for 'e Credit'", () => {
    expect(ids(searchCardsInBank("cimb", "e Credit"))).toContain("cimb-e-credit");
  });

  it("returns the Private Wealth alias as CIMB Travel World Elite", () => {
    expect(ids(searchCardsInBank("cimb", "Private Wealth"))).toContain(
      "cimb-travel-world-elite",
    );
  });
});

/* -------------------- 600,000-BP conversion tests -------------------- */

const INPUT = 600_000;

function resultFor(programmeId: string) {
  const results = calculateEntry({
    entryId: "t",
    cardGroupId: "cg-cimb-bonus",
    bankPoints: INPUT,
  });
  const r = results.find((x) => x.programmeId === programmeId);
  if (!r) throw new Error(`No result for ${programmeId}`);
  return r;
}

describe("CIMB 600,000 Bonus Points block calculation", () => {
  it("Enrich: 15 blocks → 75,000 Enrich, 0 remaining", () => {
    const r = resultFor("enrich");
    expect(r.fullBlocks).toBe(15);
    expect(r.partnerPointsReceived).toBe(75_000);
    expect(r.bankPointsUsed).toBe(600_000);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("AirAsia: 12 blocks → 60,000 points, 0 remaining", () => {
    const r = resultFor("airasia");
    expect(r.fullBlocks).toBe(12);
    expect(r.partnerPointsReceived).toBe(60_000);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("KrisFlyer: 9 blocks → 45,000 miles, 37,500 remaining", () => {
    const r = resultFor("krisflyer");
    expect(r.fullBlocks).toBe(9);
    expect(r.partnerPointsReceived).toBe(45_000);
    expect(r.bankPointsUsed).toBe(562_500);
    expect(r.bankPointsRemaining).toBe(37_500);
  });

  it.each([
    ["flying-blue"],
    ["eva"],
    ["ba"],
    ["etihad"],
    ["asia-miles"],
    ["qatar"],
    ["emirates"],
    ["turkish"],
  ])("%s (75,000 BP per block): 8 blocks → 40,000 partner", (programmeId) => {
    const r = resultFor(programmeId);
    expect(r.fullBlocks).toBe(8);
    expect(r.partnerPointsReceived).toBe(40_000);
    expect(r.bankPointsUsed).toBe(600_000);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("JAL Mileage Bank: 6 blocks → 30,000 miles, 0 remaining", () => {
    const r = resultFor("jal");
    expect(r.fullBlocks).toBe(6);
    expect(r.partnerPointsReceived).toBe(30_000);
    expect(r.bankPointsUsed).toBe(600_000);
    expect(r.bankPointsRemaining).toBe(0);
  });
});
