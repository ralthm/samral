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
  availability?: "open" | "existing_cardholders";
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
    "Card annual fees are excluded from this rewards comparison. Spending rewards only: 10,000 renewal miles conditional on fee payment and qualifying retail spend, welcome offers, Agoda and Kaligo bonuses are excluded. It is not a total card-benefits valuation.",
    "One standard points transfer at S$27.25 including GST; no instant-transfer waiver assumed. Transfers may take 14 business days and names must match. Refunds reverse earned miles.",
  ],
}, ...["sg-dbs-altitude-visa", "sg-dbs-altitude-amex"].map((cardId): MilesEarningTerms => ({
  cardId, units: "bank_points", ratePerDollar: 0.65, categories: [], annualFee: 196.2,
  status: "verified", verifiedOn: "2026-10-22", supportedProgrammes: ["krisflyer", "asia-miles"], transferFeeAmount: 27.25,
  sourceUrl: "https://www.dbs.com.sg/personal/cards/credit-cards/dbs-altitude-cards",
  sourceUrls: ["https://www.dbs.com.sg/iwov-resources/pdf/cards/rewards_programme_tnc.pdf", "https://www.dbs.com.sg/personal/support/card-rewards-convert-dbs-points-to-frequent-flyer.html"],
  exclusions: [
    "Instalment-plan payments, interest, finance charges, cash advances/withdrawals, balance transfers, smart cash, AXS, SAM online and internet-banking bill payments, and all DBS fees",
    "Excluded MCCs: 4784, 4829, 4900, 6010, 5047, 5199, 5960, 5993, 6011, 6012, 6050, 6051, 6211, 6300, 6381, 6399, 6513, 6529, 6530, 6534, 6540, 7523, 7349, 7511, 7995, 8062, 8211, 8220, 8241, 8244, 8299, 8398, 8651, 8661, 8699, 8999, 9211, 9222, 9223, 9311, 9399, 9402, 9405",
    "Excluded transaction descriptions include AMAZE*, AXS*, AXS BizPay*, AXS PTE LTD*, BAGUS*, CANTINE*, EZLINK*, EZ-LINK*, PAYPAL *AXS PTE LTD*, RAZERPAY*, SAM -*, SAM PAYMENTS*, SEDAP*, SGEBIZ*, SHOPEEPAY*, SINGAPORE E-BUSINESS*, SINGTEL DASH*, SMOOVPAY*, TRANSIT 3*, YOUTRIP*. DBS’s list is non-exhaustive and subject to change.",
  ],
  assumptions: [
    "Verified nominal local earning: 3.25 DBS Points per S$5 eligible SGD retail spending (up to 1.3 miles per S$1). This estimate prorates monthly eligible spending at 0.65 DBS Points per dollar, then applies published transfer blocks. It is not an exact statement-credit prediction.",
    "Issuer terms award points per transaction, rounded down to whole DBS Points, with S$5 earning units. Monthly totals cannot reproduce individual transaction rounding and may overstate actual earnings. No local base-spending cap or minimum is stated in the checked schedule.",
    "Eligible foreign-currency retail spending: 5.5 DBS Points per S$5 equivalent (up to 2.2 miles per S$1). Not applied to unknown category spending; foreign-currency charges and promotional bonuses are not modelled.",
    "DBS Altitude Points do not expire. Convert 5,000 DBS Points into 10,000 KrisFlyer or Asia Miles, in published blocks, with S$27.25 including GST per redemption.",
    "Card annual fees are excluded from this rewards comparison. Spending rewards only; excludes the 5,000 DBS Points / 10,000 bonus miles associated with the annual fee. It is not a total card-benefits valuation. Confirm current waiver eligibility with DBS; fee waivers reverse the associated bonus points.",
  ],
}))];

// Malaysian eligible-local-spend base profiles. Category bonuses with unconfirmed caps are NOT applied.
const myVerified = "2026-10-22";
milesEarningTerms.push({
  cardId: "hsbc-travelone", units: "bank_points", ratePerDollar: 1, categories: [], status: "verified", verifiedOn: myVerified,
  availability: "open", supportedProgrammes: ["enrich", "krisflyer", "asia-miles"],
  sourceUrl: "https://www.hsbc.com.my/credit-cards/products/travelone/rewards/",
  sourceUrls: ["https://www.hsbc.com.my/content/dam/hsbc/my/docs/TravelOne-rewards-credit-card-terms-and-conditions.pdf"],
  exclusions: ["Cash advances, fees, interest, balance transfers and instalment plans", "HSBC's public terms do not list full utilities, petrol, insurance or e-wallet treatment; check your statement"],
  assumptions: [
    "Base rate: 1 HSBC Reward Point per RM1 of other eligible local spending.",
    "5 points per RM1 on local dining and travel is published, but its monthly cap was not confirmed, so this estimate does not apply it.",
    "Transfer ratios differ by programme: 21 points → 1 Enrich point; 25 points → 1 KrisFlyer mile or Asia Mile. Points expire three years from the end of the month earned.",
    "Decimal points are rounded down to whole points. HSBC does not publish a minimum conversion amount or increment; this estimate converts whole points at the published ratio. No transfer charge is published; it is not included. Enter one in the accuracy section if you know it.",
  ],
}, {
  cardId: "uob-prvi-elite", units: "bank_points", ratePerDollar: 1, categories: [], status: "verified", verifiedOn: myVerified,
  supportedProgrammes: ["enrich", "krisflyer", "asia-miles"],
  sourceUrl: "https://www.uob.com.my/personal/cards/credit-cards/uob-prvi-miles-elite-card.page",
  sourceUrls: ["https://www.uob.com.my/assets/web-resources/personal/pdf/cards/credit-cards/uob-prvi-miles-elite/uob-prvi-miles-elite-tnc-eng.pdf", "https://www.uob.com.my/wealthbanking/banking/card-prvi-miles-elite.page"],
  exclusions: ["Government payments including utility bills and postal services, JomPAY, charity and religious transactions", "Financial services, quasi-cash, gambling, credit-insurance premiums and cash withdrawals", "Specified instalment and credit plans, fees, taxes and reversed, disputed or fraudulent transactions"],
  assumptions: [
    "Card terms effective 1 September 2026. Base rate: 1 UNIRinggit (UNIRM) per RM1 of eligible local spending. Uncapped 5 UNIRM per RM1 on airlines paid in MYR, and 10–12 UNIRM on foreign-currency spending, are not applied to general spending.",
    "12,000 UNIRM → 1,000 Enrich points, KrisFlyer miles or Asia Miles, converted in whole 12,000-point blocks; leftover UNIRM are not counted. Whether 12,000 is the compulsory minimum is not published. UNIRM expire after three years at quarter-end.",
    "No published transfer charge was confirmed; it is not included.",
  ],
}, {
  cardId: "mbb-m2-platinum", units: "bank_points", ratePerDollar: 1, categories: [], status: "verified", verifiedOn: myVerified,
  availability: "open", supportedProgrammes: ["enrich", "asia-miles"],
  sourceUrl: "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit/maybank_2_platinum_card.page",
  sourceUrls: ["https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/announcements/2025/january/airmiles-revision.page", "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/treats_reward/TPoints-Fee-AirMiles.pdf"],
  exclusions: ["MyCDD, government bodies, JomPAY, FPX and e-wallet reloads earn no TreatsPoints", "Utilities, petrol, education, EzyPay and insurance earn the same 1 point per RM1", "Cash advances, fees, interest and balance transfers"],
  assumptions: [
    "Visa/Mastercard component only: 1 TreatsPoint per RM1 of eligible local spending. The American Express component's cashback is a separate card and not included here.",
    "20,000 TreatsPoints → 1,000 Enrich points or Asia Miles, in whole blocks; leftover points are not counted. KrisFlyer is published as 10,000 → 500, a different block from Samral's stored transfer rule, so KrisFlyer is not offered here until that rule is updated. TreatsPoints expire after three years.",
    "No published transfer charge was confirmed; it is not included.",
  ],
}, {
  cardId: "hlb-infinite", units: "airline_miles", ratePerDollar: 1 / 6, categories: [], status: "verified", verifiedOn: myVerified,
  supportedProgrammes: ["enrich"], transferFeeAmount: 0,
  sourceUrl: "https://www.hlb.com.my/en/personal-banking/credit-cards/travel/infinite.html",
  sourceUrls: ["https://www.hlb.com.my/content/dam/hlb/my/docs/pdf/Personal/CreditCard/Infinite/infinite-card-tnc-en.pdf"],
  exclusions: ["Cash and quasi-cash, government payments, JomPAY and FPX", "Balance transfer, Quick Cash, FPP and card-protection plans; HLB Connect QR Pay", "Fees and charges; reversed, refunded, disputed or invalid transactions"],
  assumptions: [
    "Terms updated 23 April 2026. 1 Enrich point per RM6 of other eligible spending, credited directly to Enrich monthly; no bank-points transfer. Points are rounded down per transaction, so many small purchases earn less than this monthly-total estimate.",
    "Uncapped dining (1 per RM1, MCC 5811/5812/5814) and travel/selected retail (1 per RM4) rates are published but not applied unless you enter category earning rates. Enrich only; KrisFlyer and Asia Miles are not available.",
  ],
}, {
  cardId: "mbb-visa-infinite", units: "bank_points", ratePerDollar: 2, categories: [], status: "verified", verifiedOn: myVerified,
  availability: "open", supportedProgrammes: ["enrich", "krisflyer", "asia-miles"],
  sourceUrl: "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit/maybank_visa_infinite.page",
  sourceUrls: ["https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/announcements/2025/january/airmiles-revision.page"],
  exclusions: ["MyCDD, government bodies, JomPAY, FPX and e-wallet reloads earn no TreatsPoints", "Utilities, education, EzyPay and insurance earn only 1 point per RM1; leave them out or lower the rate", "Cash advances, fees, interest and balance transfers"],
  assumptions: [
    "2 TreatsPoints per RM1 of ordinary eligible local spending. Utilities, education, EzyPay and insurance earn 1 point; petrol earns 2 points only up to RM500 per transaction. Overseas 5× is not applied.",
    "12,500 TreatsPoints → 1,000 Enrich points, KrisFlyer miles or Asia Miles, in whole blocks; leftover points are not counted. TreatsPoints expire after three years.",
    "No published transfer charge was confirmed; it is not included.",
  ],
});

export const DESTINATIONS = [
  { name: "Tokyo", airports: ["NRT", "HND"] },
  { name: "Bangkok", airports: ["BKK"] },
  { name: "Seoul", airports: ["ICN"] },
  { name: "Hong Kong", airports: ["HKG"] },
  { name: "Taipei", airports: ["TPE"] },
  { name: "London", airports: ["LHR"] },
  { name: "Singapore", airports: ["SIN"], countries: ["MY"] as ComparisonCountry[] },
];

/** Destinations shown for a market; a home-market city is never a destination. */
export function destinationsFor(country: ComparisonCountry) {
  return DESTINATIONS.filter(d => !("countries" in d) || d.countries?.includes(country));
}

export function comparisonCards(country: ComparisonCountry) {
  return cards.filter(c => getCountryForCard(c) === country && (isConversionEligibleCard(c) || isDirectEarnCard(c)));
}

/** Main choices require a complete earning profile AND a usable transfer path.
 * The original balance converter and its registry remain untouched. */
export function usableMilesTerms(cardId: string, country: ComparisonCountry) {
  const terms = milesEarningTerms.find(t => t.cardId === cardId && t.status === "verified");
  if (!terms || !comparisonCards(country).some(c => c.id === cardId)
    || !Number.isFinite(terms.ratePerDollar) || terms.ratePerDollar <= 0
    || !terms.sourceUrl || !terms.verifiedOn || !terms.exclusions.length || !terms.assumptions?.length) return undefined;
  const age = (Date.now() - Date.parse(`${terms.verifiedOn}T00:00:00Z`)) / 86400000;
  if (!Number.isFinite(age) || age < 0 || age > 180) return undefined;
  const card = cards.find(c => c.id === cardId);
  if (card && isDirectEarnCard(card)) return terms.supportedProgrammes?.includes(getDirectEarnProgrammeId(card.cardGroupId) ?? "") ? terms : undefined;
  return terms.supportedProgrammes?.some(p => {
    const transfer = transferForCard(cardId, p);
    // Transfer charges may be unpublished; the page labels them rather than assuming zero.
    return transfer && transfer.bankPointsPerBlock > 0 && transfer.partnerPointsPerBlock > 0;
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

/** Coverage is narrower than valuation: only an official published economy
 * requirement for the selected itinerary, never a manual or observed quote. */
export function publishedEconomyReturnMiles(target?: RedemptionTarget, hasManualOverride = false) {
  if (!target || hasManualOverride || target.cabin !== "Economy" || !isTargetVerified(target)
    || !["official_airline", "official_loyalty_programme"].includes(target.source.sourceType)
    || target.verificationLevel === "observed-redemption-data") return undefined;
  return returnMiles(target, 1);
}

export const CATEGORY_LABELS: Record<SpendingCategory, string> = {
  general: "Other eligible spending", dining: "Dining", groceries: "Groceries", online: "Online shopping", travel: "Travel",
};