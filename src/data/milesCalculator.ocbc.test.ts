import { describe, it, expect } from "vitest";
import { calculateEntry } from "@/lib/milesCalculator";
import { cards, getCardGroupById, conversionRules } from "@/data/milesCalculator";
import { findApplicablePromotion } from "@/data/promotions";

function calc(cardId: string, points: number) {
  const card = cards.find((c) => c.id === cardId);
  if (!card) throw new Error(`Missing card ${cardId}`);
  return calculateEntry({ entryId: "e", cardGroupId: card.cardGroupId, bankPoints: points });
}

describe("OCBC Malaysia — inventory & conversion rules", () => {
  it("registers all 8 required current OCBC cards", () => {
    const expected = [
      "ocbc_premier_voyage_premier_banking",
      "ocbc_premier_voyage_premier_private_client",
      "ocbc_90n_visa",
      "ocbc_titanium_mastercard",
      "ocbc_365_mastercard",
      "ocbc_cashflo_mastercard",
      "ocbc_great_eastern_platinum_mastercard",
      "ocbc_world_mastercard",
    ];
    for (const id of expected) {
      expect(cards.find((c) => c.id === id), `missing card ${id}`).toBeTruthy();
    }
    // No separate Blue/Pink Titanium — one Titanium entry only.
    const titaniums = cards.filter((c) => c.bankId === "ocbc" && /titanium/i.test(c.name));
    expect(titaniums).toHaveLength(1);
  });

  it("Premier Voyage — Premier Banking: 200,000 Voyage Miles -> 66,000 KrisFlyer, 2,000 remaining", () => {
    const results = calc("ocbc_premier_voyage_premier_banking", 200_000);
    // Only KrisFlyer route — no Enrich, Cathay, Emirates, Qatar, Etihad.
    expect(results.map((r) => r.programmeId).sort()).toEqual(["krisflyer"]);
    const [r] = results;
    expect(r.bankPointsPerBlock).toBe(3000);
    expect(r.partnerPointsPerBlock).toBe(1000);
    expect(r.fullBlocks).toBe(66);
    expect(r.partnerPointsReceived).toBe(66_000);
    expect(r.bankPointsUsed).toBe(198_000);
    expect(r.bankPointsRemaining).toBe(2_000);
  });

  it("Premier Voyage — Premier Private Client: 3,000 -> 1,000 KrisFlyer, 0 remaining", () => {
    const [r] = calc("ocbc_premier_voyage_premier_private_client", 3_000);
    expect(r.programmeId).toBe("krisflyer");
    expect(r.partnerPointsReceived).toBe(1_000);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("90°N (Travel$), Titanium and 365 have no airline/hotel conversion rules", () => {
    for (const cardId of ["ocbc_90n_visa", "ocbc_titanium_mastercard", "ocbc_365_mastercard"]) {
      const results = calc(cardId, 100_000);
      expect(results, `${cardId} must not produce airline results`).toHaveLength(0);
      const card = cards.find((c) => c.id === cardId)!;
      expect(getCardGroupById(card.cardGroupId)?.unverifiedNotice).toBeTruthy();
    }
  });

  it("Cashflo, Great Eastern Platinum and World Mastercard are cashback-only (no calc)", () => {
    for (const cardId of [
      "ocbc_cashflo_mastercard",
      "ocbc_great_eastern_platinum_mastercard",
      "ocbc_world_mastercard",
    ]) {
      const card = cards.find((c) => c.id === cardId)!;
      expect(card.status).toBe("cashback_only");
      expect(calc(cardId, 100_000)).toHaveLength(0);
    }
  });

  it("no OCBC card yields an Enrich route", () => {
    const ocbcGroupIds = new Set(
      cards.filter((c) => c.bankId === "ocbc").map((c) => c.cardGroupId),
    );
    const enrichRoutes = conversionRules.filter(
      (r) => ocbcGroupIds.has(r.eligibleCardGroupId) && r.loyaltyProgrammeId === "enrich",
    );
    expect(enrichRoutes).toHaveLength(0);
  });

  it("no active Enrich promotion applies to OCBC balances", () => {
    // Even during the Enrich Bank Conversion Promotion window, OCBC must not be eligible.
    const promo = findApplicablePromotion("ocbc", "enrich", undefined, "2026-07-20");
    expect(promo).toBeUndefined();
  });
});
