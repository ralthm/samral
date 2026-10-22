import { describe, expect, it } from "vitest";
import { cashbackProducts } from "@/data/cashbackCards";
import { boundedCategoryAmount, comparisonCashbackEstimate, spendingAllocation } from "./comparisonSpending";
import { compareFeeScenarios } from "./rewardOutcomes";

describe("simple comparison spending", () => {
  it("calculates Singapore 3200 OCBC INFINITY and illustrative 1.4 miles Tokyo without category confirmation", () => {
    const card = cashbackProducts.find(c => c.id === "sg-ocbc-infinity");
    if (!card) throw new Error("OCBC INFINITY missing");
    const rewards = comparisonCashbackEstimate(card, { monthlySpend: 3200, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: false, requirementsConfirmed: false }, "2026-10-22");
    expect(rewards.grossAnnual).toBe(614.4);
    const scenarios = compareFeeScenarios({ monthlySpend: 3200, cashbackPercent: 1.6, cashbackGrossAnnualOverride: rewards.grossAnnual ?? undefined, earningRate: 1.4, cashFare: 1100, awardTaxes: 100, awardMiles: 51000, assumptionsConfirmed: rewards.grossAnnual !== null }, { status: "unknown", amount: card.annualFee }, { status: "unknown" });
    expect(scenarios[0].result.netCashback).toBe(418.2);
    expect(scenarios[0].result.annualMiles).toBe(53760);
    expect(scenarios[0].result.netMilesValue).toBe(1054.12);
    expect(scenarios[0].result.difference).toBe(635.92);
    expect(scenarios[0].result.winner).toBe("miles");
    expect(scenarios[0].miles.basis).toBe("unresolved");
    expect(scenarios[1].result.netCashback).toBe(614.4);
  });
  it("shows unallocated spending after exclusions", () => {
    expect(spendingAllocation(3200, 200, [1000, 500])).toEqual({ eligible: 3000, allocated: 1500, unallocated: 1500, invalid: false });
  });
  it("prevents category totals exceeding eligible spending", () => expect(boundedCategoryAmount(2500, 3000, [1000])).toBe(2000));
  it("rejects existing allocations when spending is reduced", () => expect(spendingAllocation(1000, 100, [1000]).invalid).toBe(true));
  it("does not invalidate decimal amounts at the spending limit", () => expect(spendingAllocation(0.3, 0, [0.1, 0.2]).invalid).toBe(false));
  it("does not invent missing card terms for the initial estimate", () => {
    const card = cashbackProducts.find(c => c.id === "sg-ocbc-365");
    if (!card) throw new Error("OCBC 365 missing");
    expect(comparisonCashbackEstimate(card, { monthlySpend: 3200, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: false, requirementsConfirmed: false }, "2026-10-22").grossAnnual).toBeNull();
  });
});