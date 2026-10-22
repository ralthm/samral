import Decimal from "decimal.js";
import { compareRewards, type RewardComparisonInput } from "./rewardComparison";

export type AnnualFeeStatus = "paid" | "waived" | "unknown";
export interface AnnualFeeChoice { status: AnnualFeeStatus; amount?: number }

/** Missing fees remain unresolved, not verified zeroes. The primary estimate is
 * paid where an amount exists; unknown positive fees also get waived scenarios. */
export function compareFeeScenarios(input: RewardComparisonInput, cashback: AnnualFeeChoice, miles: AnnualFeeChoice) {
  const options = (choice: AnnualFeeChoice) => {
    const known = choice.amount !== undefined && Number.isFinite(choice.amount) && choice.amount >= 0;
    if (choice.status === "waived") return [{ fee: 0, basis: "waived" as const }];
    if (!known) return [{ fee: 0, basis: "unresolved" as const }];
    const paid = { fee: choice.amount ?? 0, basis: "paid" as const };
    return choice.status === "unknown" && paid.fee > 0 ? [paid, { fee: 0, basis: "waived" as const }] : [paid];
  };
  return options(cashback).flatMap(cash => options(miles).map(mile => ({
    cashback: cash, miles: mile,
    result: compareRewards({ ...input, cashbackAnnualFee: cash.fee, milesAnnualFee: mile.fee }),
  })));
}

/** Caller supplies only an exact matching published one-person economy return
 * award. Existing balances, hypothetical awards and fee bonus miles never enter. */
export function annualFlightCoverage(newAnnualMiles: number, publishedReturnMiles?: number) {
  if (!Number.isFinite(newAnnualMiles) || newAnnualMiles < 0 || publishedReturnMiles === undefined
    || !Number.isFinite(publishedReturnMiles) || publishedReturnMiles <= 0) return null;
  const miles = new Decimal(newAnnualMiles);
  const requirement = new Decimal(publishedReturnMiles);
  const returns = miles.div(requirement).floor();
  return { completeReturns: returns.toNumber(), remainingMiles: miles.minus(returns.mul(requirement)).toNumber(), requiredMiles: publishedReturnMiles };
}