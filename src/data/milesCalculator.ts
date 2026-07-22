// Miles calculator data — hand-curated from official bank sources.
// Editing this file is the only way to change conversion rules
// (no backend is currently enabled for this project).

export type ProgrammeType =
  | "airline_miles"
  | "airline_points"
  | "hotel_points"
  | "other_travel_points";

export type RuleStatus =
  | "verified"
  | "needs_review"
  | "expired"
  | "temporarily_unavailable";

export interface Bank {
  id: string;
  name: string;
  slug: string;
  country: string;
  active: boolean;
  displayOrder: number;
  officialRewardsUrl: string;
}

export interface RewardProduct {
  id: string;
  bankId: string;
  name: string;
  slug: string;
  rewardCurrencyName: string;
  description?: string;
  active: boolean;
  displayOrder: number;
}

export interface EligibleCardGroup {
  id: string;
  rewardProductId: string;
  name: string;
  description?: string;
  eligibleCards: string[];
  active: boolean;
  displayOrder: number;
}

export interface LoyaltyProgramme {
  id: string;
  name: string;
  slug: string;
  programmeType: ProgrammeType;
  airlineName?: string;
  active: boolean;
  displayOrder: number;
}

export interface ConversionRule {
  id: string;
  eligibleCardGroupId: string;
  loyaltyProgrammeId: string;
  bankPointsPerBlock: number;
  partnerPointsPerBlock: number;
  effectiveFrom?: string; // ISO date
  effectiveUntil?: string;
  verifiedOn: string; // ISO date
  sourceUrl: string;
  sourceTitle: string;
  feeType?: "none" | "cash" | "points" | "informational";
  feeAmountMyr?: number;
  feePaymentMethod?: string;
  processingTimeMinDays?: number;
  processingTimeMaxDays?: number;
  processingTimeBasis?: string;
  annualCapPartnerPoints?: number;
  campaignCapPartnerPoints?: number;
  notes?: string;
  status: RuleStatus;
  active: boolean;
}

/* -------------------- Banks -------------------- */

export const banks: Bank[] = [
  {
    id: "maybank",
    name: "Maybank",
    slug: "maybank",
    country: "MY",
    active: true,
    displayOrder: 1,
    officialRewardsUrl:
      "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/rewards/treatspoints.page",
  },
  {
    id: "cimb",
    name: "CIMB",
    slug: "cimb",
    country: "MY",
    active: true,
    displayOrder: 2,
    officialRewardsUrl:
      "https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-cards/bonus-points.html",
  },
  {
    id: "alliance",
    name: "Alliance Bank",
    slug: "alliance-bank",
    country: "MY",
    active: true,
    displayOrder: 3,
    officialRewardsUrl:
      "https://www.alliancebank.com.my/Personal/Cards/Rewards.aspx",
  },
  {
    id: "uob",
    name: "UOB Malaysia",
    slug: "uob-malaysia",
    country: "MY",
    active: true,
    displayOrder: 4,
    officialRewardsUrl:
      "https://www.uob.com.my/personal/cards/rewards/uniringgit.page",
  },
];

/* -------------------- Loyalty programmes -------------------- */

export const loyaltyProgrammes: LoyaltyProgramme[] = [
  { id: "enrich", name: "Enrich", slug: "enrich", programmeType: "airline_miles", airlineName: "Malaysia Airlines", active: true, displayOrder: 1 },
  { id: "krisflyer", name: "KrisFlyer", slug: "krisflyer", programmeType: "airline_miles", airlineName: "Singapore Airlines", active: true, displayOrder: 2 },
  { id: "asia-miles", name: "Cathay", slug: "cathay", programmeType: "airline_miles", airlineName: "Cathay Pacific", active: true, displayOrder: 3 },
  { id: "airasia", name: "AirAsia rewards", slug: "airasia-rewards", programmeType: "airline_points", airlineName: "AirAsia", active: true, displayOrder: 4 },
  { id: "batik", name: "Batik Air Club", slug: "batik-air-club", programmeType: "other_travel_points", airlineName: "Batik Air", active: true, displayOrder: 5 },
  { id: "delta", name: "Delta SkyMiles", slug: "delta-skymiles", programmeType: "airline_miles", airlineName: "Delta Air Lines", active: true, displayOrder: 6 },
  { id: "rop", name: "Royal Orchid Plus", slug: "royal-orchid-plus", programmeType: "airline_miles", airlineName: "Thai Airways", active: true, displayOrder: 7 },
  { id: "etihad", name: "Etihad Guest", slug: "etihad-guest", programmeType: "airline_miles", airlineName: "Etihad Airways", active: true, displayOrder: 8 },
  { id: "emirates", name: "Emirates Skywards", slug: "emirates-skywards", programmeType: "airline_miles", airlineName: "Emirates", active: true, displayOrder: 9 },
  { id: "flying-blue", name: "Flying Blue", slug: "flying-blue", programmeType: "airline_miles", airlineName: "Air France / KLM", active: true, displayOrder: 10 },
  { id: "eva", name: "EVA Infinity MileageLands", slug: "eva-infinity", programmeType: "airline_miles", airlineName: "EVA Air", active: true, displayOrder: 11 },
  { id: "ba", name: "British Airways Club", slug: "british-airways-club", programmeType: "airline_miles", airlineName: "British Airways", active: true, displayOrder: 12 },
  { id: "qatar", name: "Qatar Airways Privilege Club", slug: "qatar-privilege-club", programmeType: "airline_miles", airlineName: "Qatar Airways", active: true, displayOrder: 13 },
  { id: "jal", name: "JAL Mileage Bank", slug: "jal-mileage-bank", programmeType: "airline_miles", airlineName: "Japan Airlines", active: true, displayOrder: 14 },
  { id: "turkish", name: "Turkish Airlines Miles&Smiles", slug: "turkish-miles-smiles", programmeType: "airline_miles", airlineName: "Turkish Airlines", active: true, displayOrder: 15 },
  { id: "ihg", name: "IHG One Rewards", slug: "ihg-one-rewards", programmeType: "hotel_points", active: true, displayOrder: 16 },
  { id: "marriott", name: "Marriott Bonvoy", slug: "marriott-bonvoy", programmeType: "hotel_points", active: true, displayOrder: 17 },
  { id: "accor", name: "ALL Accor", slug: "all-accor", programmeType: "hotel_points", active: true, displayOrder: 18 },
];

/* -------------------- Reward products & card groups -------------------- */

export const rewardProducts: RewardProduct[] = [
  // Maybank
  { id: "mbb-treats-premium", bankId: "maybank", name: "TreatsPoints — Premium Cards", slug: "mbb-treats-premium", rewardCurrencyName: "TreatsPoints", active: true, displayOrder: 1 },
  { id: "mbb-mr-selected-amex", bankId: "maybank", name: "Membership Rewards — Selected Amex", slug: "mbb-mr-selected-amex", rewardCurrencyName: "Membership Rewards Points", active: true, displayOrder: 2 },
  { id: "mbb-mr-plat-charge", bankId: "maybank", name: "Membership Rewards — Amex Platinum Charge", slug: "mbb-mr-plat-charge", rewardCurrencyName: "Membership Rewards Points", active: true, displayOrder: 3 },
  { id: "mbb-mr-other", bankId: "maybank", name: "Membership Rewards — Other Travel Partners (all Amex)", slug: "mbb-mr-other", rewardCurrencyName: "Membership Rewards Points", active: true, displayOrder: 4 },
  { id: "mbb-treats-standard", bankId: "maybank", name: "TreatsPoints — Classic / Gold / Platinum / Visa Signature", slug: "mbb-treats-standard", rewardCurrencyName: "TreatsPoints", active: true, displayOrder: 5 },
  { id: "mbb-all-cards-lowtier", bankId: "maybank", name: "TreatsPoints — All Maybank Credit Cards (AirAsia / Batik)", slug: "mbb-all-cards-lowtier", rewardCurrencyName: "TreatsPoints", active: true, displayOrder: 6 },
  // CIMB
  { id: "cimb-bonus", bankId: "cimb", name: "CIMB Bonus Points", slug: "cimb-bonus", rewardCurrencyName: "Bonus Points", active: true, displayOrder: 1 },
  // Alliance
  { id: "alliance-timeless", bankId: "alliance", name: "Timeless Bonus Points", slug: "alliance-timeless", rewardCurrencyName: "Timeless Bonus Points", active: true, displayOrder: 1 },
  // UOB
  { id: "uob-unirm", bankId: "uob", name: "UNIRinggit (UNIRM)", slug: "uob-unirm", rewardCurrencyName: "UNIRM", active: true, displayOrder: 1 },
];

export const eligibleCardGroups: EligibleCardGroup[] = [
  {
    id: "cg-mbb-treats-premium",
    rewardProductId: "mbb-treats-premium",
    name: "Maybank Premium Cards (TreatsPoints)",
    eligibleCards: [
      "Visa Infinite Diamanté",
      "Visa Infinite (conventional and Islamic)",
      "Visa Infinite Manchester United",
      "Mercedes-Benz Card",
      "Maybank 2 Cards Premier",
      "World Elite Mastercard (conventional and Islamic)",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-mr-selected-amex",
    rewardProductId: "mbb-mr-selected-amex",
    name: "Maybank Amex Platinum Credit, Amex Charge, Amex Gold Charge",
    eligibleCards: [
      "American Express Platinum Credit Card",
      "American Express Charge Card",
      "American Express Gold Charge Card",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-mr-plat-charge",
    rewardProductId: "mbb-mr-plat-charge",
    name: "Maybank Amex Platinum Charge Card",
    eligibleCards: ["American Express Platinum Charge Card"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-mr-other",
    rewardProductId: "mbb-mr-other",
    name: "All Maybank Amex credit & charge cards",
    eligibleCards: ["All Maybank American Express credit and charge cards"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-treats-standard",
    rewardProductId: "mbb-treats-standard",
    name: "Maybank Classic / Gold / Platinum / Visa Signature",
    eligibleCards: [
      "All Maybank Classic, Gold, Platinum and Visa Signature cards not in the premium group",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-all-cards-lowtier",
    rewardProductId: "mbb-all-cards-lowtier",
    name: "All Maybank Credit Cards (AirAsia / Batik route)",
    eligibleCards: ["All Maybank credit cards"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-cimb-bonus",
    rewardProductId: "cimb-bonus",
    name: "CIMB Credit Cards (Bonus Points)",
    eligibleCards: ["All CIMB credit cards earning Bonus Points"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-alliance-timeless",
    rewardProductId: "alliance-timeless",
    name: "Alliance Bank Credit Cards (Timeless Bonus Points)",
    eligibleCards: ["Alliance Bank credit cards earning Timeless Bonus Points"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-uob-unirm",
    rewardProductId: "uob-unirm",
    name: "UOB Malaysia Credit Cards (UNIRM)",
    eligibleCards: ["UOB Malaysia credit cards earning UNIRinggit"],
    active: true,
    displayOrder: 1,
  },
];

/* -------------------- Conversion rules -------------------- */

const MBB_SRC =
  "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/rewards/treatspoints.page";
const MBB_TITLE = "Maybank Service Tax Redemption and Air Miles Conversion Rate";
const CIMB_SRC =
  "https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-cards/bonus-points.html";
const CIMB_TITLE = "CIMB Bonus Points Redemption";
const ALLIANCE_SRC =
  "https://www.alliancebank.com.my/Personal/Cards/Rewards.aspx";
const ALLIANCE_TITLE = "Alliance Bank Timeless Bonus Points Redemption";
const UOB_SRC =
  "https://www.uob.com.my/personal/cards/rewards/uniringgit.page";
const UOB_TITLE = "UOB Malaysia UNIRinggit Rewards";

const V = "2026-03-01"; // verification date used by every seeded rule
const MBB_EFF = "2025-02-22";

const MBB_ANNUAL_CAP = 2_000_000;
const MBB_ANNUAL_NOTE =
  "Maybank states a maximum of 2,000,000 Air Miles per customer per calendar year, across all Maybank products and airlines. A separate bonus-miles campaign may impose a limit of 250,000 Air Miles per campaign.";

function rule(
  id: string,
  cg: string,
  prog: string,
  block: [number, number],
  extra: Partial<ConversionRule> = {},
): ConversionRule {
  return {
    id,
    eligibleCardGroupId: cg,
    loyaltyProgrammeId: prog,
    bankPointsPerBlock: block[0],
    partnerPointsPerBlock: block[1],
    verifiedOn: V,
    sourceUrl: MBB_SRC,
    sourceTitle: MBB_TITLE,
    status: "verified",
    active: true,
    ...extra,
  };
}

export const conversionRules: ConversionRule[] = [
  // Maybank — Premium TreatsPoints (12,500 → 1,000) to Enrich, KrisFlyer, Cathay
  rule("mbb-prem-enrich", "cg-mbb-treats-premium", "enrich", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-prem-krisflyer", "cg-mbb-treats-premium", "krisflyer", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-prem-cathay", "cg-mbb-treats-premium", "asia-miles", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // Maybank — Selected Amex MR (12,500 → 1,000) to Enrich / KrisFlyer / Cathay
  rule("mbb-selamex-enrich", "cg-mbb-mr-selected-amex", "enrich", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-selamex-krisflyer", "cg-mbb-mr-selected-amex", "krisflyer", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-selamex-cathay", "cg-mbb-mr-selected-amex", "asia-miles", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // Maybank — Amex Platinum Charge MR (7,000 → 1,000)
  rule("mbb-platch-enrich", "cg-mbb-mr-plat-charge", "enrich", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-platch-krisflyer", "cg-mbb-mr-plat-charge", "krisflyer", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-platch-cathay", "cg-mbb-mr-plat-charge", "asia-miles", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // Maybank — MR Other Travel Partners (5,600 → 1,000)
  rule("mbb-mrother-airasia", "cg-mbb-mr-other", "airasia", [5600, 1000]),
  rule("mbb-mrother-delta", "cg-mbb-mr-other", "delta", [5600, 1000]),
  rule("mbb-mrother-rop", "cg-mbb-mr-other", "rop", [5600, 1000]),
  rule("mbb-mrother-etihad", "cg-mbb-mr-other", "etihad", [5600, 1000]),
  rule("mbb-mrother-emirates", "cg-mbb-mr-other", "emirates", [5600, 1000]),
  // Batik Air Club — units, not miles
  rule("mbb-mrother-batik", "cg-mbb-mr-other", "batik", [7000, 10], {
    notes: "Batik Air Club units are not airline miles. Do not add them to any airline-miles total.",
  }),

  // Maybank — Standard TreatsPoints (Classic/Gold/Platinum/Visa Signature)
  rule("mbb-std-enrich", "cg-mbb-treats-standard", "enrich", [20000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-std-cathay", "cg-mbb-treats-standard", "asia-miles", [20000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  // KrisFlyer displayed at official block 10,000 → 500 (mathematically same as 20k → 1k)
  rule("mbb-std-krisflyer", "cg-mbb-treats-standard", "krisflyer", [10000, 500], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP,
    notes:
      "Maybank's official displayed block for standard TreatsPoints to KrisFlyer is 10,000 → 500 miles. " +
      MBB_ANNUAL_NOTE,
  }),

  // Maybank — All cards → AirAsia / Batik
  rule("mbb-all-airasia", "cg-mbb-all-cards-lowtier", "airasia", [7000, 1000]),
  rule("mbb-all-batik", "cg-mbb-all-cards-lowtier", "batik", [7000, 10], {
    notes: "Batik Air Club units are not airline miles.",
  }),

  // ---- CIMB ----
  rule("cimb-airasia", "cg-cimb-bonus", "airasia", [40000, 5000], {
    sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE,
    notes: "Redemptions require the principal cardholder's name and loyalty membership details to match.",
  }),
  rule("cimb-enrich", "cg-cimb-bonus", "enrich", [62500, 5000], {
    sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE,
  }),
  rule("cimb-krisflyer", "cg-cimb-bonus", "krisflyer", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-flyingblue", "cg-cimb-bonus", "flying-blue", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-eva", "cg-cimb-bonus", "eva", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-ba", "cg-cimb-bonus", "ba", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-etihad", "cg-cimb-bonus", "etihad", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-cathay", "cg-cimb-bonus", "asia-miles", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-qatar", "cg-cimb-bonus", "qatar", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-emirates", "cg-cimb-bonus", "emirates", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-jal", "cg-cimb-bonus", "jal", [100000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-turkish", "cg-cimb-bonus", "turkish", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-ihg", "cg-cimb-bonus", "ihg", [50000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-marriott", "cg-cimb-bonus", "marriott", [50000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),
  rule("cimb-accor", "cg-cimb-bonus", "accor", [125000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE }),

  // ---- Alliance ----
  rule("alliance-enrich", "cg-alliance-timeless", "enrich", [75000, 5000], {
    sourceUrl: ALLIANCE_SRC, sourceTitle: ALLIANCE_TITLE,
    notes:
      "Alliance's November 2025 announcement states redemptions are in multiples of 5,000 partner points with no redemption cap. Older website copy referencing a 20,000-point monthly cap is superseded.",
  }),
  rule("alliance-airasia", "cg-alliance-timeless", "airasia", [30000, 5000], {
    sourceUrl: ALLIANCE_SRC, sourceTitle: ALLIANCE_TITLE,
    notes:
      "Alliance's November 2025 announcement states redemptions are in multiples of 5,000 partner points with no redemption cap.",
  }),

  // ---- UOB ----
  rule("uob-enrich", "cg-uob-unirm", "enrich", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-krisflyer", "cg-uob-unirm", "krisflyer", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-cathay", "cg-uob-unirm", "asia-miles", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
];

/* -------------------- Helpers -------------------- */

const today = () => new Date().toISOString().slice(0, 10);

export function isRulePublic(r: ConversionRule): boolean {
  if (!r.active) return false;
  if (r.status !== "verified") return false;
  if (!r.sourceUrl || !r.verifiedOn) return false;
  const t = today();
  if (r.effectiveFrom && r.effectiveFrom > t) return false;
  if (r.effectiveUntil && r.effectiveUntil < t) return false;
  return true;
}

export function getPublicRulesForCardGroup(cardGroupId: string): ConversionRule[] {
  return conversionRules.filter((r) => r.eligibleCardGroupId === cardGroupId && isRulePublic(r));
}

export function getBankById(id: string) {
  return banks.find((b) => b.id === id);
}
export function getRewardProductById(id: string) {
  return rewardProducts.find((p) => p.id === id);
}
export function getCardGroupById(id: string) {
  return eligibleCardGroups.find((g) => g.id === id);
}
export function getProgrammeById(id: string) {
  return loyaltyProgrammes.find((p) => p.id === id);
}

export function getRewardProductsByBank(bankId: string) {
  return rewardProducts
    .filter((p) => p.bankId === bankId && p.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
export function getCardGroupsByRewardProduct(rewardProductId: string) {
  return eligibleCardGroups
    .filter((g) => g.rewardProductId === rewardProductId && g.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Summary counters for the hero. */
export function summaryCounters() {
  const publicRules = conversionRules.filter(isRulePublic);
  const activeBankIds = new Set(
    publicRules
      .map((r) => getCardGroupById(r.eligibleCardGroupId))
      .map((g) => (g ? getRewardProductById(g.rewardProductId) : undefined))
      .map((p) => p?.bankId)
      .filter(Boolean) as string[],
  );
  const activeProductIds = new Set(
    publicRules
      .map((r) => getCardGroupById(r.eligibleCardGroupId)?.rewardProductId)
      .filter(Boolean) as string[],
  );
  const activeProgrammeIds = new Set(publicRules.map((r) => r.loyaltyProgrammeId));
  return {
    banks: activeBankIds.size,
    cardProgrammes: activeProductIds.size,
    partners: activeProgrammeIds.size,
    routes: publicRules.length,
  };
}
