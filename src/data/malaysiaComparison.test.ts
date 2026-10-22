import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cashbackProducts } from "./cashbackCards";
import { evaluateCashback, completeCashbackTerms } from "../lib/cashbackStrategy";
import { compareRewards } from "../lib/rewardComparison";
import { usableMilesCards, usableMilesTerms, transferForCard, destinationsFor, comparisonTargets } from "./rewardComparison";
import { rewardScenario } from "./rewardScenarios";

const today = "2026-10-22";
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-22T12:00:00Z")); });
afterEach(() => vi.useRealTimers());
const ambank = cashbackProducts.find(c => c.id === "my-ambank-cash-rebate")!;
const profile = (monthlySpend: number, categories = {}) => ({ monthlySpend, excludedMonthlySpend: 0, categories, categoriesConfirmed: true, requirementsConfirmed: true });

describe("Malaysian cashback", () => {
  it("AmBank caps each 10% category at RM10, then 0.2%", () => {
    // dining 500: 10 cap + 0.2% of 400 = 10.80; other 1500 at 0.2% = 3.00
    expect(evaluateCashback(ambank, profile(2000, { dining: 500 }), today).grossAnnual).toBe(165.6);
  });
  it("AmBank pays only 0.2% below the RM1,500 threshold", () => {
    expect(evaluateCashback(ambank, profile(1400, { dining: 500 }), today).grossAnnual).toBe(33.6);
  });
  it("incomplete Malaysian cards are listed but never calculated", () => {
    for (const id of ["my-maybank-2-amex", "my-cimb-cash-rebate", "my-affin-duo-cashback", "my-pb-quantum-visa", "my-rhb-shell-visa"]) {
      const card = cashbackProducts.find(c => c.id === id)!;
      expect(completeCashbackTerms(card, today)).toBe(false);
      expect(evaluateCashback(card, profile(3000), today).grossAnnual).toBeNull();
    }
  });
});

describe("Malaysian miles", () => {
  it("only verified Malaysian cards appear in the main list", () => {
    expect(usableMilesCards("MY").map(c => c.id).sort()).toEqual(["hlb-infinite", "hsbc-travelone", "mbb-m2-platinum", "uob-prvi-elite"]);
    expect(usableMilesTerms("hsbc-travelone", "SG")).toBeUndefined();
  });
  const miles = (id: string, programme: string) => compareRewards({ monthlySpend: 3000, cashbackPercent: 0.2, earningRate: usableMilesTerms(id, "MY")!.ratePerDollar,
    transfer: transferForCard(id, programme), ...rewardScenario("MY", "Tokyo", "Economy", programme) }).annualMiles;
  it("HSBC TravelOne uses different ratios per programme", () => {
    expect(miles("hsbc-travelone", "enrich")).toBe(1714); // 36,000 / 21
    expect(miles("hsbc-travelone", "krisflyer")).toBe(1440); // 36,000 / 25
  });
  it("bank points are not treated as miles one-to-one", () => {
    expect(miles("uob-prvi-elite", "enrich")).toBe(3000); // 36,000 UNIRM in 12,000 blocks
    expect(miles("mbb-m2-platinum", "enrich")).toBe(1000); // 36,000 TreatsPoints, one 20,000 block
  });
  it("Hong Leong Infinite earns Enrich directly at 1 per RM6", () => {
    expect(compareRewards({ monthlySpend: 3000, cashbackPercent: 0, earningRate: 1 / 6 }).annualMiles).toBeCloseTo(6000);
  });
});

describe("country switching and fee-excluded break-even", () => {
  it("Singapore is a Malaysia-only destination with a Kuala Lumpur origin award", () => {
    expect(destinationsFor("MY").some(d => d.name === "Singapore")).toBe(true);
    expect(destinationsFor("SG").some(d => d.name === "Singapore")).toBe(false);
    expect(comparisonTargets("MY", "Singapore", "Economy", "enrich")[0]?.originAirport).toBe("KUL");
  });
  it("break-even uses cashback plus transfer charge only", () => {
    const r = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4, cashFare: 1100, awardTaxes: 100, awardMiles: 51000 });
    expect(r.netCashback).toBe(612);
    expect(r.breakEvenCents).toBeCloseTo(1.214, 3);
  });
});
