import Decimal from "decimal.js";
import { evaluateCashback, type SpendingProfile } from "./cashbackStrategy";
import type { CashbackProduct } from "@/data/cashbackCards";

/** Presentation allocation guard; issuer and comparison engines remain unchanged. */
export function spendingAllocation(monthlySpend: number, excluded: number, amounts: (number | undefined)[]) {
  const eligible = Decimal.max(0, new Decimal(monthlySpend).minus(excluded));
  const allocated = amounts.reduce<Decimal>((sum, value) => sum.plus(Math.max(0, value ?? 0)), new Decimal(0));
  return { eligible: eligible.toNumber(), allocated: allocated.toNumber(), unallocated: Decimal.max(0, eligible.minus(allocated)).toNumber(), invalid: excluded > monthlySpend || allocated.gt(eligible) };
}

export function boundedCategoryAmount(requested: number, eligible: number, otherAmounts: (number | undefined)[]) {
  const remaining = spendingAllocation(eligible, 0, otherAmounts).unallocated;
  return Decimal.min(Math.max(0, requested), remaining).toNumber();
}

/** Only category-dependent records need the explicit all-other provisional assumption. */
export function comparisonCashbackEstimate(card: CashbackProduct, profile: SpendingProfile, today?: string) {
  return evaluateCashback(card, card.rules.length && !profile.categoriesConfirmed
    ? { ...profile, categoriesConfirmed: true } : profile, today);
}