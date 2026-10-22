import Decimal from "decimal.js";
import { freshnessOf } from "./dataFreshness";
import type { CashbackCategory, CashbackProduct } from "@/data/cashbackCards";

export interface SpendingProfile {
  monthlySpend: number;
  excludedMonthlySpend: number;
  categories: Partial<Record<CashbackCategory, number>>;
  categoriesConfirmed: boolean;
  requirementsConfirmed: boolean;
}
export function completeCashbackTerms(card: CashbackProduct, today?: string) {
  return card.status === "verified" && card.baseRatePercent !== undefined && card.annualFee !== undefined
    && !!card.verifiedOn && freshnessOf({ verifiedAt: card.verifiedOn }, today) === "current"
    && card.sourceUrls.length > 0 && card.exclusions.length > 0;
}

/** Steady monthly spending; no acquisition bonuses, fee waivers or stacked cards. */
export function evaluateCashback(card: CashbackProduct, profile: SpendingProfile, today?: string) {
  const spend = new Decimal(Math.max(0, profile.monthlySpend));
  const excluded = new Decimal(Math.max(0, profile.excludedMonthlySpend));
  const eligible = Decimal.max(0, spend.minus(excluded));
  const allocated = Object.values(profile.categories).reduce((sum, n) => sum.plus(Math.max(0, n ?? 0)), new Decimal(0));
  let reason: string | undefined;
  if (!completeCashbackTerms(card, today)) reason = "Spending terms are incomplete or awaiting review.";
  else if (excluded.gt(spend) || allocated.gt(eligible)) reason = "Spending amounts exceed your monthly total.";
  else if (card.rules.length && !profile.categoriesConfirmed) reason = "Confirm your eligible spending breakdown.";
  else if ((profile.categories.reduced ?? 0) > 0 && !card.rules.some(r => r.categories.includes("reduced"))) reason = "Reduced-rate transactions need issuer-specific eligibility mapping; this alternative is not ranked.";
  else if (card.requirements.length && !profile.requirementsConfirmed) reason = "Confirm the card’s qualification requirements.";
  if (reason) return { card, netAnnual: null, grossAnnual: null, qualified: false, reason };
  const base = card.baseRatePercent ?? 0;
  const qualified = eligible.gte(card.minimumMonthlySpend ?? 0);
  let reward = eligible.mul(base).div(100);
  let ruledSpend = new Decimal(0);
  let roundedRules = new Decimal(0);
  if (qualified) {
    for (const rule of card.rules) {
      const ruleSpend = rule.categories.reduce((sum, category) => {
        const value = category === "other" ? Decimal.max(0, eligible.minus(allocated)).plus(profile.categories.other ?? 0) : new Decimal(profile.categories[category] ?? 0);
        return sum.plus(value);
      }, new Decimal(0));
      const bonusSpend = rule.monthlySpendCap === undefined ? ruleSpend : Decimal.min(ruleSpend, rule.monthlySpendCap);
      ruledSpend = ruledSpend.plus(ruleSpend);
      let categoryReward = bonusSpend.mul(rule.ratePercent).div(100);
      if (rule.monthlyCap !== undefined) categoryReward = Decimal.min(categoryReward, rule.monthlyCap);
      categoryReward = categoryReward.plus(ruleSpend.minus(bonusSpend).mul(rule.fallbackPercent).div(100));
      roundedRules = roundedRules.plus(categoryReward.toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
      reward = reward.minus(ruleSpend.mul(base).div(100)).plus(categoryReward);
    }
    if (card.monthlyCap !== undefined) reward = Decimal.min(reward, card.monthlyCap);
  }
  if (qualified && card.rounding === "category_cent_nearest") reward = eligible.minus(ruledSpend).mul(base).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).plus(roundedRules);
  reward = reward.toDecimalPlaces(2, card.rounding === "monthly_cent_down" ? Decimal.ROUND_DOWN : Decimal.ROUND_HALF_UP);
  const gross = reward.mul(12);
  return { card, grossAnnual: gross.toNumber(), netAnnual: gross.minus(card.annualFee ?? 0).toDecimalPlaces(2).toNumber(), qualified,
    reason: qualified ? undefined : `Below the ${card.minimumMonthlySpend} monthly minimum; base cashback only.` };
}

export function rankCashback(cards: CashbackProduct[], profile: SpendingProfile, today?: string) {
  return cards.map(card => evaluateCashback(card, profile, today))
    .filter((r): r is typeof r & { netAnnual: number } => r.netAnnual !== null)
    .sort((a, b) => b.netAnnual - a.netAnnual || a.card.id.localeCompare(b.card.id));
}