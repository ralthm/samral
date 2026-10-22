import { describe, expect, it } from "vitest";
import { annualFlightCoverage, compareFeeScenarios } from "./rewardOutcomes";

const input = { monthlySpend: 3000, cashbackPercent: 1.6, earningRate: 1.4, cashFare: 1100, awardTaxes: 100, awardMiles: 51000, annualTransferFee: 27.25 };
describe("annual fee fairness", () => {
  it("deducts the paid cashback fee from gross rewards once", () => {
    const [s] = compareFeeScenarios(input, { status: "paid", amount: 196.2 }, { status: "paid", amount: 196.2 });
    expect(s.result.grossCashback).toBe(576);
    expect(s.result.netCashback).toBe(379.8);
    expect(s.result.netMilesValue).toBe(764.79);
  });
  it("waives only annual fees, preserving miles earnings and transfer fees", () => {
    const [s] = compareFeeScenarios(input, { status: "waived", amount: 196.2 }, { status: "waived", amount: 196.2 });
    expect(s.result.netCashback).toBe(576);
    expect(s.result.netMilesValue).toBe(960.99);
    expect(s.result.annualMiles).toBe(50400);
    expect(s.result.transferFee).toBe(27.25);
  });
  it("shows all four paid/waived combinations when both statuses are unknown", () => {
    const s = compareFeeScenarios(input, { status: "unknown", amount: 196.2 }, { status: "unknown", amount: 196.2 });
    expect(s.map(x => [x.result.netCashback, x.result.netMilesValue])).toEqual([[379.8, 764.79], [379.8, 960.99], [576, 764.79], [576, 960.99]]);
  });
  it("keeps missing illustrative fees explicitly unresolved rather than inventing paid fees", () => {
    const s = compareFeeScenarios(input, { status: "paid", amount: 196.2 }, { status: "unknown" });
    expect(s).toHaveLength(1);
    expect(s[0].miles.basis).toBe("unresolved");
    expect(s[0].result.netCashback).toBe(379.8);
  });
  it("does not double deduct issuer-evaluated cashback fees", () => {
    const [s] = compareFeeScenarios({ ...input, cashbackGrossAnnualOverride: 444, cashbackAnnualFee: 196.2 }, { status: "waived", amount: 196.2 }, { status: "paid", amount: 196.2 });
    expect(s.result.netCashback).toBe(444);
  });
  it("does not create duplicate zero-fee scenarios", () => {
    expect(compareFeeScenarios(input, { status: "unknown", amount: 0 }, { status: "waived" })).toHaveLength(1);
  });
});
describe("published annual economy flight coverage", () => {
  it("covers zero Tokyo returns with 40,000 new miles and retains all miles", () => {
    expect(annualFlightCoverage(40000, 51000)).toEqual({ completeReturns: 0, remainingMiles: 40000, requiredMiles: 51000 });
  });
  it("covers two whole returns and retains 3,000 miles", () => {
    expect(annualFlightCoverage(105000, 51000)).toEqual({ completeReturns: 2, remainingMiles: 3000, requiredMiles: 51000 });
  });
  it("covers an exact return with no remainder", () => expect(annualFlightCoverage(51000, 51000)?.remainingMiles).toBe(0));
  it("withholds coverage without a published requirement", () => expect(annualFlightCoverage(50400)).toBeNull());
  it("rejects zero and invalid requirements", () => {
    expect(annualFlightCoverage(50400, 0)).toBeNull();
    expect(annualFlightCoverage(50400, NaN)).toBeNull();
  });
});