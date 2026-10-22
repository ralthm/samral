import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { milesEarningTerms, usableMilesTerms, transferForCard, implausibleEarningRate, impliedMilesPerDollar, MAX_PLAUSIBLE_MILES_PER_DOLLAR } from "./rewardComparison";
import { compareRewards } from "../lib/rewardComparison";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-22T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

const ID = "sg-sc-pb-visa-infinite";

describe("Standard Chartered Priority Banking Visa Infinite", () => {
  it("uses the published 2.5 points per S$1 card rate", () => {
    expect(usableMilesTerms(ID, "SG")?.ratePerDollar).toBe(2.5);
  });

  it("S$3,000 monthly spend earns 90,000 points a year, card spending only", () => {
    const transfer = transferForCard(ID, "krisflyer")!;
    const r = compareRewards({
      monthlySpend: 3000, excludedMonthlySpend: 0, cashbackPercent: 1, earningRate: 2.5, annualTransferFee: 27.25,
      transfer, categories: [], cashFare: 1100, awardMiles: 30000, awardTaxes: 100, existingMiles: 0, assumptionsConfirmed: true,
    } as never);
    expect(r.rawAnnualRewards).toBe(90000);
    // 3 whole 25,000-point blocks → 30,000 KrisFlyer miles; 15,000 points stay untransferred.
    expect(r.annualMiles).toBe(30000);
    expect(r.untransferredRewards).toBe(15000);
  });

  it("transfers 25,000 points to 10,000 KrisFlyer miles", () => {
    const t = transferForCard(ID, "krisflyer")!;
    expect([t.bankPointsPerBlock, t.partnerPointsPerBlock]).toEqual([25000, 10000]);
  });

  it("rejects 60 points per S$1 as unrealistic", () => {
    const t = transferForCard(ID, "krisflyer")!;
    expect(impliedMilesPerDollar(60, t)).toBe(24);
    expect(implausibleEarningRate(60, t)).toBe(true);
    expect(implausibleEarningRate(2.5, t)).toBe(false);
  });

  it("no verified card profile implies more than the plausible miles ceiling", () => {
    for (const terms of milesEarningTerms) {
      for (const p of terms.supportedProgrammes ?? []) {
        const t = terms.units === "airline_miles" ? undefined : transferForCard(terms.cardId, p);
        expect(impliedMilesPerDollar(terms.ratePerDollar, t)).toBeLessThanOrEqual(MAX_PLAUSIBLE_MILES_PER_DOLLAR);
      }
    }
  });
});
