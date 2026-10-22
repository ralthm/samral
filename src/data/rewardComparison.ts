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

// Scoped ongoing eligible-local-spend profiles; never annualise promotions.
export const cashbackCardTerms: CashbackCardTerms[] = [];
export const milesEarningTerms: MilesEarningTerms[] = [{
  cardId: "sg-citi-premiermiles", units: "bank_points", ratePerDollar: 1.2,
  categories: [], annualFee: 196.2, status: "verified", verifiedOn: "2026-10-22",
  sourceUrl: "https://www.citibank.com.sg/credit-cards/travel/premiermiles-card",
  sourceUrls: [
    "https://www.citibank.com.sg/credit-cards/travel/premiermiles-card/pdf/citi-premiermiles-card-members-agreement.pdf",
    "https://www.citibank.com.sg/global_docs/pdf/Rewards_Exclusion_List.pdf",
    "https://www.citibank.com.sg/credit-cards/privileges-programs/credit-card-rewards-redemption/points-transfer.html",
  ],
  supportedProgrammes: ["krisflyer", "asia-miles"], transferFeeAmount: 27.25,
  exclusions: ["Fees, interest and GST charges; cash advances, instalment plans, balance/funds transfers and quasi-cash", "Bill payments, education, government, insurance, financial institutions, charities and gambling", "Payment-provider and prepaid top-ups, transit, utilities, hospitals, rentals, parking, cleaning, nondurable goods and cigar stores", "Excluded merchants, descriptions and MCCs in Citi’s non-exhaustive official exclusion list"],
  assumptions: [
    "Eligible SGD retail spending: 1.2 Citi Miles per S$1, uncapped, no stated base-earning minimum. Each transaction is rounded down to a whole Citi Mile; monthly-total estimates can overstate actual credits.",
    "Eligible foreign-currency retail spending earns 2.2 Citi Miles per S$1 equivalent. Not applied to this local-spending estimate; foreign-currency charges are not modelled. No ordinary dining, grocery or online category bonus assumed.",
    "Citi Miles do not expire; they are bank rewards, not airline miles until transferred. Published schedule: 10,000 Citi Miles to 10,000 KrisFlyer or Asia Miles. This comparison uses existing transfer blocks; confirm current partner-specific minimums and increments in the Citi app.",
    "Standard principal annual fee S$196.20 including GST is deducted once, with no waiver assumed. This compares new spending rewards only: 10,000 renewal miles conditional on fee payment and qualifying retail spend, welcome offers, Agoda and Kaligo bonuses are excluded. It is not a total card-benefits valuation.",
    "One standard points transfer at S$27.25 including GST; no instant-transfer waiver assumed. Transfers may take 14 business days and names must match. Refunds reverse earned miles.",
  ],
}];

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
    || !terms.sourceUrl || !terms.verifiedOn || !terms.exclusions.length || !terms.assumptions?.length) return undefined;
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