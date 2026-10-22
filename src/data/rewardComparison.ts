import { cards, getCountryForCard, getPublicRulesForCardGroup, isConversionEligibleCard, isDirectEarnCard, getDirectEarnProgrammeId, getRewardCurrencyForCard } from "@/data/milesCalculator";
import { computeRequiredPoints, isTargetVerified, targetsForCountry, type RedemptionTarget } from "@/data/redemptionTargets";

export type ComparisonCountry = "SG" | "MY";
export type SpendingCategory = "general" | "dining" | "groceries" | "online" | "travel";

export interface CategoryRewardTerms {
  category: SpendingCategory;
  rate: number;
  monthlySpendCap?: number;
  monthlyRewardCap?: number;
  fallbackRate?: number;
}

/** Terms reference existing card IDs, not a second card registry. Unknown values
 * are deliberately undefined. A transfer-source date is not an earn-source date. */
export interface CashbackCardTerms {
  cardId: string;
  bankId: string;
  country: ComparisonCountry;
  currency: "SGD" | "MYR";
  baseRatePercent: number;
  categories: CategoryRewardTerms[];
  minimumMonthlySpend?: number;
  monthlyCap?: number;
  quarterlyCap?: number;
  fallbackRatePercent?: number;
  exclusions: string[];
  annualFee?: number;
  sourceUrl: string;
  verifiedOn: string;
  status: "verified" | "needs_review";
}

export interface MilesEarningTerms {
  cardId: string;
  units: "bank_points" | "airline_miles";
  ratePerDollar: number;
  categories: CategoryRewardTerms[];
  annualFee?: number;
  expiryMonths?: number;
  exclusions: string[];
  sourceUrl: string;
  verifiedOn: string;
  status: "verified" | "needs_review";
}

// No comprehensive issuer earning/cashback terms have been verified for this
// comparison. Populate only after checking ALL restrictions at the source.
export const cashbackCardTerms: CashbackCardTerms[] = [];
export const milesEarningTerms: MilesEarningTerms[] = [];

export const DESTINATIONS = [
  { name: "Tokyo", airports: ["NRT", "HND"] },
  { name: "Bangkok", airports: ["BKK"] },
  { name: "Seoul", airports: ["ICN"] },
  { name: "Hong Kong", airports: ["HKG"] },
  { name: "Taipei", airports: ["TPE"] },
  { name: "London", airports: ["LHR"] },
];

export function comparisonCards(country: ComparisonCountry) {
  return cards.filter(c => getCountryForCard(c) === country && (isConversionEligibleCard(c) || isDirectEarnCard(c)));
}

export function cardProgrammes(cardId: string): string[] {
  const card = cards.find(c => c.id === cardId);
  if (!card) return [];
  if (isDirectEarnCard(card)) {
    const programme = getDirectEarnProgrammeId(card.cardGroupId);
    return programme ? [programme] : [];
  }
  return getPublicRulesForCardGroup(card.cardGroupId)
    .filter(r => r.loyaltyProgrammeId !== "marriott" && r.loyaltyProgrammeId !== "hilton")
    .map(r => r.loyaltyProgrammeId);
}

export function transferForCard(cardId: string, programmeId: string) {
  const card = cards.find(c => c.id === cardId);
  if (!card || isDirectEarnCard(card)) return undefined;
  return getPublicRulesForCardGroup(card.cardGroupId).find(r => r.loyaltyProgrammeId === programmeId);
}

export function earningUnit(cardId: string) {
  const card = cards.find(c => c.id === cardId);
  if (!card || isDirectEarnCard(card)) return "airline miles";
  return getRewardCurrencyForCard(card);
}

export function comparisonTargets(country: ComparisonCountry, city: string, cabin: "Economy" | "Business", programmeId: string): RedemptionTarget[] {
  const airports = DESTINATIONS.find(d => d.name === city)?.airports ?? [];
  return targetsForCountry(country).filter(t =>
    airports.includes(t.destination) && t.cabin === cabin && t.programmeId === programmeId && isTargetVerified(t),
  );
}

export function returnMiles(target: RedemptionTarget, passengers: number) {
  return computeRequiredPoints(target, "return", passengers);
}

export const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  general: "Other eligible spending", dining: "Dining", groceries: "Groceries", online: "Online shopping", travel: "Travel",
};