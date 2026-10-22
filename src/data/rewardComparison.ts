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
  sourceUrls?: string[];
  assumptions?: string[];
  supportedProgrammes?: string[];
  transferFeeAmount?: number;
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

/** Main choices require a complete earning profile AND a usable transfer path.
 * The original balance converter and its registry remain untouched. */
export function usableMilesTerms(cardId: string, country: ComparisonCountry) {
  const terms = milesEarningTerms.find(t => t.cardId === cardId && t.status === "verified");
  if (!terms || !comparisonCards(country).some(c => c.id === cardId)
    || !Number.isFinite(terms.ratePerDollar) || terms.ratePerDollar <= 0
    || terms.annualFee === undefined || !Number.isFinite(terms.annualFee)
    || !terms.sourceUrl || !terms.verifiedOn) return undefined;
  const age = (Date.now() - Date.parse(`${terms.verifiedOn}T00:00:00Z`)) / 86400000;
  if (!Number.isFinite(age) || age < 0 || age > 180) return undefined;
  return terms.supportedProgrammes?.some(p => {
    const transfer = transferForCard(cardId, p);
    return transfer && transfer.bankPointsPerBlock > 0 && transfer.partnerPointsPerBlock > 0
      && (terms.transferFeeAmount !== undefined || transfer.transferFeeCurrency === (country === "SG" ? "SGD" : "MYR") && transfer.transferFeeAmount !== undefined);
  }) ? terms : undefined;
}

export function usableMilesCards(country: ComparisonCountry) {
  return comparisonCards(country).filter(c => usableMilesTerms(c.id, country));
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
  return getRewardCurrencyForCard(card)?.currencyName ?? "bank points";
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