import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectiveEarningRate, initialEarningState, selectEarningCard, setCustomEarning, ILLUSTRATIVE_RATE } from "./earningRateState";
import { usableMilesTerms, transferForCard } from "@/data/rewardComparison";
import { compareRewards } from "./rewardComparison";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-22T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

const SC = "sg-sc-pb-visa-infinite";
const sc = () => usableMilesTerms(SC, "SG")!.ratePerDollar;

describe("earning-rate state", () => {
  it("a fresh page load starts illustrative with no custom override", () => {
    const s = initialEarningState();
    expect(effectiveEarningRate(s, undefined)).toBe(ILLUSTRATIVE_RATE);
    expect(s.useCustom).toBe(false);
  });

  it("selecting SC Priority Banking uses 2.5 even after a stale 60 custom rate", () => {
    let s = setCustomEarning(selectEarningCard("sg-citi-premiermiles"), true);
    s = { ...s, customRate: 60 };
    s = selectEarningCard(SC);
    expect(effectiveEarningRate(s, sc())).toBe(2.5);
    expect(s.customRate).toBeUndefined();
  });

  it("switching between verified cards uses each published rate", () => {
    expect(effectiveEarningRate(selectEarningCard(SC), sc())).toBe(2.5);
    expect(effectiveEarningRate(selectEarningCard("sg-citi-premiermiles"), usableMilesTerms("sg-citi-premiermiles", "SG")!.ratePerDollar)).toBe(1.2);
  });

  it("manual card then verified card drops the manual rate, and back again starts empty", () => {
    let s = { ...selectEarningCard("manual"), manualRate: 60 };
    s = selectEarningCard(SC);
    expect(effectiveEarningRate(s, sc())).toBe(2.5);
    s = selectEarningCard("manual");
    expect(effectiveEarningRate(s, undefined)).toBeUndefined();
  });

  it("changing country resets to the illustrative default", () => {
    const s = selectEarningCard("");
    expect(effectiveEarningRate(s, undefined)).toBe(ILLUSTRATIVE_RATE);
  });

  it("custom rate only applies when activated; it starts empty and clears when turned off", () => {
    let s = setCustomEarning(selectEarningCard(SC), true);
    expect(effectiveEarningRate(s, sc())).toBeUndefined();
    s = { ...s, customRate: 3 };
    expect(effectiveEarningRate(s, sc())).toBe(3);
    s = setCustomEarning(s, false);
    expect(effectiveEarningRate(s, sc())).toBe(2.5);
    expect(setCustomEarning(s, true).customRate).toBeUndefined();
  });

  it("SC S$3,000/month: 90,000 points → 30,000 KrisFlyer miles in 25,000-point blocks", () => {
    const r = compareRewards({
      monthlySpend: 3000, excludedMonthlySpend: 0, cashbackPercent: 1,
      earningRate: effectiveEarningRate(selectEarningCard(SC), sc())!, annualTransferFee: 27.25,
      transfer: transferForCard(SC, "krisflyer"), categories: [], cashFare: 1100, awardMiles: 30000, awardTaxes: 100, existingMiles: 0, assumptionsConfirmed: true,
    } as never);
    expect([r.rawAnnualRewards, r.annualMiles, r.untransferredRewards]).toEqual([90000, 30000, 15000]);
  });
});
