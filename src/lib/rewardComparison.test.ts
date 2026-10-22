import { describe, expect, it } from "vitest";
import { compareRewards, type RewardComparisonInput } from "./rewardComparison";

const scenario = (overrides: Partial<RewardComparisonInput> = {}): RewardComparisonInput => ({
  monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4,
  cashFare: 1100, awardMiles: 51000, awardTaxes: 100, ...overrides,
});

describe("cashback vs miles brief scenarios", () => {
  it("earns S$612 at 1.7% of S$36,000", () => expect(compareRewards(scenario()).grossCashback).toBe(612));
  it("never exceeds S$2,160 with a S$180 monthly cap", () => {
    expect(compareRewards(scenario({ monthlySpend: 10000, cashbackPercent: 5, cashbackMonthlyCap: 180 })).grossCashback).toBe(2160);
  });
  it("earns 50,400 miles at 1.4 per S$1", () => expect(compareRewards(scenario()).annualMiles).toBe(50400));
  it("values a S$1,100 fare less S$100 taxes over 51,000 miles at 1.96 cents", () => expect(compareRewards(scenario()).centsPerMile).toBeCloseTo(1.960784, 5));
  it("computes a 2.75% estimated miles return", () => expect(compareRewards(scenario()).milesRate).toBeCloseTo(2.745098, 5));
  it("breaks even at 1.214 cents per mile before fees", () => expect(compareRewards(scenario()).breakEvenCents).toBeCloseTo(1.2142857, 5));
  it("applies monthly caps twelve times, not once annually", () => {
    expect(compareRewards(scenario({ cashbackPercent: 5, cashbackMonthlyCap: 100 })).grossCashback).toBe(1200);
  });
  it("does not inflate annual earnings with existing miles", () => {
    const result = compareRewards(scenario({ existingMiles: 100000 }));
    expect(result.annualMiles).toBe(50400);
    expect(result.netMilesValue).toBe(compareRewards(scenario()).netMilesValue);
    expect(result.monthsNeeded).toBe(0);
  });
  it("recommends cashback for a low-value redemption", () => expect(compareRewards(scenario({ cashFare: 300 })).winner).toBe("cashback"));
  it("does not recommend with missing fare/taxes or unconfirmed card data", () => {
    expect(compareRewards(scenario({ cashFare: undefined })).winner).toBe("incomplete");
    expect(compareRewards(scenario({ awardTaxes: undefined })).centsPerMile).toBeNull();
    expect(compareRewards(scenario({ assumptionsConfirmed: false })).winner).toBe("incomplete");
  });
});

describe("comparison boundaries", () => {
  it("includes annual fees and a single transfer fee in break-even", () => {
    const r = compareRewards(scenario({ cashbackAnnualFee: 100, milesAnnualFee: 200, annualTransferFee: 25 }));
    expect(r.netCashback).toBe(512);
    expect(r.breakEvenCents).toBeCloseTo(737 / 50400 * 100, 8);
    expect(r.breakEvenFare).toBe(845.77);
  });
  it("applies monthly thresholds and excludes ineligible spend", () => {
    expect(compareRewards(scenario({ excludedMonthlySpend: 2000, cashbackMinimumMonthlySpend: 1500 })).grossCashback).toBe(0);
    expect(compareRewards(scenario({ excludedMonthlySpend: 1000 })).grossCashback).toBe(408);
  });
  it("applies quarterly caps per quarter", () => expect(compareRewards(scenario({ cashbackQuarterlyCap: 100 })).grossCashback).toBe(400));
  it("never exceeds the total monthly cap even with a fallback rate", () => {
    expect(compareRewards(scenario({ cashbackPercent: 5, cashbackMonthlyCap: 100, cashbackFallbackPercent: 1 })).grossCashback).toBe(1200);
  });
  it("does not compare when exclusions exceed spending", () => {
    expect(compareRewards(scenario({ excludedMonthlySpend: 4000 })).winner).toBe("incomplete");
  });
  it("caps category bonuses and preserves base cashback beyond the cap", () => {
    const r = compareRewards(scenario({ monthlySpend: 1000, cashbackPercent: 1,
      categories: [{ monthlySpend: 1000, cashbackPercent: 5, cashbackMonthlyCap: 20, cashbackFallbackPercent: 1 }] }));
    expect(r.grossCashback).toBe(312);
  });
  it("caps category miles bonus spending without rounding early", () => {
    const r = compareRewards(scenario({ monthlySpend: 1000, categories: [{ monthlySpend: 1000, milesRate: 4, milesBonusSpendCap: 500, milesFallbackRate: 1 }] }));
    expect(r.annualMiles).toBe(30000);
  });
  it("uses bank-point ratios and whole transfer blocks", () => {
    const r = compareRewards(scenario({ earningRate: 0.7, transfer: { bankPointsPerBlock: 5000, partnerPointsPerBlock: 10000 } }));
    expect(r.rawAnnualRewards).toBe(25200);
    expect(r.annualMiles).toBe(50000);
    expect(r.untransferredRewards).toBe(200);
    expect(r.monthsNeeded).toBe(15);
  });
  it("requires minimum transfers and does not charge a fee when no miles transfer", () => {
    const r = compareRewards(scenario({ monthlySpend: 100, annualTransferFee: 25, transfer: { bankPointsPerBlock: 5000, partnerPointsPerBlock: 10000 } }));
    expect(r.annualMiles).toBe(0);
    expect(r.transferFee).toBe(0);
  });
  it("honours transfer minimums, increments and one-transfer monthly caps", () => {
    const r = compareRewards(scenario({ transfer: { bankPointsPerBlock: 1, partnerPointsPerBlock: 1, minimumTransferPartnerPoints: 10000, transferIncrementPartnerPoints: 5000, monthlyCapPartnerPoints: 30000 } }));
    expect(r.annualMiles).toBe(30000);
    expect(r.monthsNeeded).toBeNull();
  });
  it("computes scheduled transfer fees separately", () => {
    const r = compareRewards(scenario({ transfer: { bankPointsPerBlock: 1, partnerPointsPerBlock: 1, feeSchedule: { blockPartnerPoints: 10000, amountPerBlock: 5, maximum: 25 } } }));
    expect(r.transferFee).toBe(25);
  });
  it("reports close results at the disclosed 0.1-percentage-point tolerance", () => {
    expect(compareRewards(scenario({ cashFare: 720 })).winner).toBe("close");
  });
  it("does not manufacture value when taxes exceed the fare", () => {
    expect(compareRewards(scenario({ cashFare: 50 })).netMilesValue).toBe(0);
    expect(compareRewards(scenario({ cashFare: 50 })).winner).toBe("cashback");
  });
  it("handles zero spending and invalid category allocations", () => {
    expect(compareRewards(scenario({ monthlySpend: 0 })).winner).toBe("incomplete");
    expect(compareRewards(scenario({ categories: [{ monthlySpend: 4000 }] })).invalidCategories).toBe(true);
  });
  it("separates planned trip coverage from new annual earnings", () => {
    expect(compareRewards(scenario({ existingMiles: 50000, plannedMonths: 1 })).readyByTrip).toBe(true);
    expect(compareRewards(scenario({ plannedMonths: 1 })).readyByTrip).toBe(false);
  });
});