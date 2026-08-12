import { describe, expect, it } from "vitest";
import { calculateEntry, computePortfolioTotals } from "@/lib/milesCalculator";
import { isPromotionActive, promotions } from "@/data/promotions";

/**
 * Multi-bank Enrich conversion: every eligible bank contribution must receive
 * its own 10% bonus. The bonus is never applied blindly to the portfolio total.
 */

const enrichPromo = promotions.find((p) => p.id === "mh-enrich-10pct-2026")!;
const promoLive = isPromotionActive(enrichPromo);

const scenario = [
  { entryId: "uob", cardGroupId: "cg-uob-prvi-elite", bankPoints: 60_000, base: 5_000 },
  { entryId: "affin", cardGroupId: "cg-affin-p2", bankPoints: 45_000, base: 3_000 },
  { entryId: "rakyat", cardGroupId: "cg-rakyat", bankPoints: 39_000, base: 7_000 },
  { entryId: "sc", cardGroupId: "cg-sc-360-7k", bankPoints: 41_000, base: 5_000 },
];

function enrichResults(entries = scenario) {
  return entries.flatMap((e) =>
    calculateEntry({ entryId: e.entryId, cardGroupId: e.cardGroupId, bankPoints: e.bankPoints }).filter(
      (r) => r.programmeId === "enrich",
    ),
  );
}

describe("Four-bank Enrich conversion with the 10% promotion", () => {
  const results = enrichResults();

  it("converts each bank independently to the expected base Enrich", () => {
    for (const e of scenario) {
      const r = results.find((x) => x.entryId === e.entryId)!;
      expect(r.partnerPointsReceived).toBe(e.base);
    }
  });

  it("leaves the expected unconverted remainders", () => {
    expect(results.find((r) => r.entryId === "rakyat")!.bankPointsRemaining).toBe(500);
    expect(results.find((r) => r.entryId === "sc")!.bankPointsRemaining).toBe(6_000);
  });

  it("treats all four contributions as promotion-eligible", () => {
    for (const r of results) {
      expect(r.promotions.some((p) => p.id === enrichPromo.id)).toBe(promoLive);
    }
  });

  it("gives each contribution its own 10% bonus", () => {
    for (const e of scenario) {
      const r = results.find((x) => x.entryId === e.entryId)!;
      expect(r.bonusPartnerPoints).toBe(promoLive ? e.base / 10 : 0);
    }
  });

  it("totals 20,000 base, 2,000 bonus and 22,000 promotional Enrich", () => {
    const enrich = computePortfolioTotals(results, {}).find((p) => p.programmeId === "enrich")!;
    expect(enrich.transferredTotal).toBe(20_000);
    expect(enrich.bonusTotal).toBe(promoLive ? 2_000 : 0);
    expect(enrich.promotionalTotal).toBe(promoLive ? 22_000 : 20_000);
  });
});

describe("Mixed eligible and ineligible contributions", () => {
  it("bonuses only the eligible base and keeps the rest in the standard balance", () => {
    // cg-ocbc-* routes are not listed in the Enrich promotion's participating banks.
    const ineligible = calculateEntry({
      entryId: "ineligible",
      cardGroupId: "cg-sc-360-unverified",
      bankPoints: 100_000,
    }).filter((r) => r.programmeId === "enrich");

    const results = [...enrichResults(), ...ineligible];
    for (const r of ineligible) {
      expect(r.promotions).toHaveLength(0);
      expect(r.bonusPartnerPoints).toBe(0);
    }

    const eligibleBase = 20_000;
    const ineligibleBase = ineligible.reduce((s, r) => s + r.partnerPointsReceived, 0);
    const enrich = computePortfolioTotals(results, {}).find((p) => p.programmeId === "enrich")!;

    expect(enrich.transferredTotal).toBe(eligibleBase + ineligibleBase);
    expect(enrich.bonusTotal).toBe(promoLive ? eligibleBase / 10 : 0);
    expect(enrich.promotionalTotal).toBe(enrich.transferredTotal + enrich.bonusTotal);
  });
});
