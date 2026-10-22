import Decimal from "decimal.js";
import { freshnessOf } from "./dataFreshness";
import { CARD_SPECIFIC_CATEGORIES, CASHBACK_CATEGORIES, type CashbackCategory, type CashbackProduct } from "@/data/cashbackCards";

export interface SpendingProfile {
  monthlySpend: number;
  excludedMonthlySpend: number;
  categories: Partial<Record<CashbackCategory, number>>;
  categoriesConfirmed: boolean;
  requirementsConfirmed: boolean;
}
export function completeCashbackTerms(card: CashbackProduct, today?: string) {
  return card.status === "verified" && card.baseRatePercent !== undefined
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
  else if (CARD_SPECIFIC_CATEGORIES.some(c => (profile.categories[c] ?? 0) > 0 && !card.rules.some(r => r.categories.includes(c)))) reason = `${CARD_SPECIFIC_CATEGORIES.filter(c => (profile.categories[c] ?? 0) > 0 && !card.rules.some(r => r.categories.includes(c))).map(c => CASHBACK_CATEGORIES[c]).join(", ")} spending has no verified rule for this card; set it to zero in the breakdown to compare.`;
  else if (card.requirements.length && !profile.requirementsConfirmed) reason = "Confirm the card’s qualification requirements.";
  if (reason) return { card, netAnnual: null, grossAnnual: null, qualified: false, reason };
  const qualified = eligible.gte(card.minimumMonthlySpend ?? 0);
  const base = qualified ? card.baseRatePercent ?? 0 : card.belowMinimumPercent ?? card.baseRatePercent ?? 0;
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
      // Tiered rates follow total eligible spend; a missed category minimum earns nothing for that category.
      const reached = rule.tierRates?.filter(t => eligible.gte(t.minimumMonthlySpend)) ?? [];
      const tier = reached[reached.length - 1];
      const rate = rule.tierRates ? tier?.ratePercent ?? 0 : rule.ratePercent;
      const meetsMinimum = ruleSpend.gte(rule.minimumCategorySpend ?? 0);
      let categoryReward = meetsMinimum ? bonusSpend.mul(rate).div(100) : new Decimal(0);
      if (rule.monthlyCap !== undefined) categoryReward = Decimal.min(categoryReward, rule.monthlyCap);
      if (meetsMinimum) categoryReward = categoryReward.plus(ruleSpend.minus(bonusSpend).mul(rule.fallbackPercent).div(100));
      roundedRules = roundedRules.plus(categoryReward.toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
      reward = reward.minus(ruleSpend.mul(base).div(100)).plus(categoryReward);
    }
    if (card.monthlyCap !== undefined) reward = Decimal.min(reward, card.monthlyCap);
  }
  if (!qualified && card.belowMinimumMonthlyCap !== undefined) reward = Decimal.min(reward, card.belowMinimumMonthlyCap);
  if (qualified && card.rounding === "category_cent_nearest") reward = eligible.minus(ruledSpend).mul(base).div(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).plus(roundedRules);
  reward = card.rounding === "monthly_ringgit_down" ? reward.floor() : reward.toDecimalPlaces(2, card.rounding === "monthly_cent_down" ? Decimal.ROUND_DOWN : Decimal.ROUND_HALF_UP);
  const gross = reward.mul(12);
  return { card, grossAnnual: gross.toNumber(), netAnnual: gross.minus(card.annualFee ?? 0).toDecimalPlaces(2).toNumber(), qualified,
    reason: qualified ? undefined : `Below the ${card.minimumMonthlySpend} monthly minimum; ${card.belowMinimumPercent ?? card.baseRatePercent}% applies.` };
}

export function rankCashback(cards: CashbackProduct[], profile: SpendingProfile, today?: string) {
  return cards.map(card => evaluateCashback(card, profile, today))
    .filter((r): r is typeof r & { netAnnual: number } => r.netAnnual !== null)
    .sort((a, b) => b.netAnnual - a.netAnnual || a.card.id.localeCompare(b.card.id));
}