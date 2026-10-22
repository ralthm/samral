import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { milesEarningTerms, usableMilesCards, usableMilesTerms, transferForCard, comparisonTargets, publishedEconomyReturnMiles } from "./rewardComparison";
import { compareRewards } from "../lib/rewardComparison";
import { rewardScenario } from "./rewardScenarios";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-22T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

describe("usable miles-card catalogue", () => {
  it("uses only matching published one-person return economy awards for flight coverage", () => {
    const target = comparisonTargets("SG", "Tokyo", "Economy", "krisflyer")[0];
    expect(publishedEconomyReturnMiles(target)).toBe(51000);
    expect(publishedEconomyReturnMiles(target, true)).toBeUndefined();
    expect(publishedEconomyReturnMiles(comparisonTargets("SG", "Tokyo", "Business", "krisflyer")[0])).toBeUndefined();
    expect(publishedEconomyReturnMiles(comparisonTargets("SG", "Tokyo", "Economy", "asia-miles")[0])).toBeUndefined();
  });
  it("never labels secondary or observed award pricing as published flight coverage", () => {
    const target = comparisonTargets("SG", "Tokyo", "Economy", "krisflyer")[0];
    expect(target).toBeDefined();
    if (!target) return;
    expect(publishedEconomyReturnMiles({ ...target, source: { ...target.source, sourceType: "verified_secondary" } })).toBeUndefined();
    expect(publishedEconomyReturnMiles({ ...target, verificationLevel: "observed-redemption-data" })).toBeUndefined();
  });
  it("uses Citi's sourced 1.2 local rate, not 2.2 foreign or promotional bonuses", () => {
    const terms = usableMilesTerms("sg-citi-premiermiles", "SG");
    expect(terms?.ratePerDollar).toBe(1.2);
    expect(terms?.annualFee).toBe(196.2);
    expect(terms?.transferFeeAmount).toBe(27.25);
    expect(terms?.categories).toEqual([]);
    expect(terms?.verifiedOn).toBe("2026-10-22");
  });
  it("keeps incomplete and wrong-country cards out of main choices", () => {
    expect(usableMilesTerms("sg-dbs-womans", "SG")).toBeUndefined();
    expect(usableMilesTerms("sg-citi-premiermiles", "MY")).toBeUndefined();
    expect(usableMilesCards("MY")).toEqual([]);
    expect(usableMilesCards("SG").some(c => c.id === "sg-citi-premiermiles")).toBe(true);
  });
  it("every main selectable card calculates with eligible spending and Tokyo", () => {
    const cards = usableMilesCards("SG");
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const terms = usableMilesTerms(card.id, "SG");
      expect(terms).toBeDefined();
      for (const programme of terms?.supportedProgrammes ?? []) {
        const transfer = transferForCard(card.id, programme);
        expect(transfer).toBeDefined();
        const result = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7,
          earningRate: terms?.ratePerDollar ?? 0, milesAnnualFee: terms?.annualFee,
          annualTransferFee: terms?.transferFeeAmount ?? transfer?.transferFeeAmount,
          transfer, ...rewardScenario("SG", "Tokyo", "Economy", programme) });
        expect(result.winner).not.toBe("incomplete");
        expect(result.annualMiles).toBeGreaterThan(0);
      }
    }
  });
  it("Citi earns 43,200 reward units and 40,000 transferable miles, with fees deducted once", () => {
    const terms = usableMilesTerms("sg-citi-premiermiles", "SG");
    const result = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7,
      earningRate: terms?.ratePerDollar ?? 0, milesAnnualFee: terms?.annualFee,
      annualTransferFee: terms?.transferFeeAmount,
      transfer: transferForCard("sg-citi-premiermiles", "krisflyer"),
      ...rewardScenario("SG", "Tokyo", "Economy", "krisflyer") });
    expect(result.rawAnnualRewards).toBe(43200);
    expect(result.annualMiles).toBe(40000);
    expect(result.untransferredRewards).toBe(3200);
    expect(result.transferFee).toBe(27.25);
    expect(result.netMilesValue).toBe(560.86);
  });
  it("DBS Altitude prorates 0.65 bank points, not 1.3 points, before 2:1 conversion", () => {
    for (const id of ["sg-dbs-altitude-visa", "sg-dbs-altitude-amex"]) {
      const terms = usableMilesTerms(id, "SG");
      expect(terms?.ratePerDollar).toBe(0.65);
      expect(terms?.annualFee).toBe(196.2);
      const result = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7,
        earningRate: terms?.ratePerDollar ?? 0, milesAnnualFee: terms?.annualFee,
        annualTransferFee: terms?.transferFeeAmount, transfer: transferForCard(id, "krisflyer"),
        ...rewardScenario("SG", "Tokyo", "Economy", "krisflyer") });
      expect(result.rawAnnualRewards).toBe(23400);
      expect(result.annualMiles).toBe(40000);
      expect(result.untransferredRewards).toBe(3400);
      expect(result.netMilesValue).toBe(560.86);
    }
  });
  it("stale terms cannot remain selectable", () => {
    vi.setSystemTime(new Date("2027-05-01T00:00:00Z"));
    expect(usableMilesTerms("sg-citi-premiermiles", "SG")).toBeUndefined();
  });
  it("missing annual fees cannot become zero-fee verified recommendations", () => {
    const terms = milesEarningTerms.find(t => t.cardId === "sg-citi-premiermiles");
    expect(terms).toBeDefined();
    if (!terms) return;
    const saved = terms.annualFee;
    try { terms.annualFee = undefined; expect(usableMilesTerms(terms.cardId, "SG")).toBeUndefined(); }
    finally { terms.annualFee = saved; }
  });
});