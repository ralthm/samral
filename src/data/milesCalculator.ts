// Miles calculator data — hand-curated from official bank sources.
// Editing this file is the only way to change conversion rules
// (no backend is currently enabled for this project).
//
// Design principle (see /miles-calculator spec): the user picks the exact
// rewards entitlement, not merely the bank. Card groups are separated only
// when the transfer rate, available partners, minimum block or cap differs.

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
  /** The bank-side points currency users type into the calculator. */
  rewardCurrencyName: string;
  description?: string;
  active: boolean;
  displayOrder: number;
}

export interface EligibleCardGroup {
  id: string;
  rewardProductId: string;
  /** Selector label. Must reflect the exact eligibility test, never a marketing tier. */
  name: string;
  description?: string;
  eligibleCards: string[];
  /** Optional message shown when a group is intentionally seeded with no rules. */
  unverifiedNotice?: string;
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
  /** Minimum partner points redeemable in one transaction (if defined by the bank). */
  minimumTransferPartnerPoints?: number;
  /** Increment above the minimum, in partner points. */
  transferIncrementPartnerPoints?: number;
  /** Per-cardholder cap of partner points per calendar month (if any). */
  monthlyCapPartnerPoints?: number;
  effectiveFrom?: string; // ISO date
  effectiveUntil?: string;
  verifiedOn: string; // ISO date
  sourceUrl: string;
  sourceTitle: string;
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
  { id: "asia-miles", name: "Cathay — Asia Miles", slug: "cathay-asia-miles", programmeType: "airline_miles", airlineName: "Cathay Pacific", active: true, displayOrder: 3 },
  { id: "airasia", name: "AirAsia points", slug: "airasia-points", programmeType: "airline_points", airlineName: "AirAsia", active: true, displayOrder: 4 },
  { id: "batik", name: "Batik Air Club", slug: "batik-air-club", programmeType: "other_travel_points", airlineName: "Batik Air", active: true, displayOrder: 5 },
  { id: "delta", name: "Delta SkyMiles", slug: "delta-skymiles", programmeType: "airline_miles", airlineName: "Delta Air Lines", active: true, displayOrder: 6 },
  { id: "rop", name: "Royal Orchid Plus", slug: "royal-orchid-plus", programmeType: "airline_miles", airlineName: "Thai Airways", active: true, displayOrder: 7 },
  { id: "etihad", name: "Etihad Guest", slug: "etihad-guest", programmeType: "airline_miles", airlineName: "Etihad Airways", active: true, displayOrder: 8 },
  { id: "emirates", name: "Emirates Skywards", slug: "emirates-skywards", programmeType: "airline_miles", airlineName: "Emirates", active: true, displayOrder: 9 },
  { id: "flying-blue", name: "Flying Blue", slug: "flying-blue", programmeType: "airline_miles", airlineName: "Air France / KLM", active: true, displayOrder: 10 },
  { id: "eva", name: "EVA Air Infinity MileageLands", slug: "eva-infinity", programmeType: "airline_miles", airlineName: "EVA Air", active: true, displayOrder: 11 },
  { id: "ba", name: "The British Airways Club", slug: "british-airways-club", programmeType: "airline_miles", airlineName: "British Airways", active: true, displayOrder: 12 },
  { id: "qatar", name: "Qatar Airways Privilege Club", slug: "qatar-privilege-club", programmeType: "airline_miles", airlineName: "Qatar Airways", active: true, displayOrder: 13 },
  { id: "jal", name: "JAL Mileage Bank", slug: "jal-mileage-bank", programmeType: "airline_miles", airlineName: "Japan Airlines", active: true, displayOrder: 14 },
  { id: "turkish", name: "Turkish Airlines Miles&Smiles", slug: "turkish-miles-smiles", programmeType: "airline_miles", airlineName: "Turkish Airlines", active: true, displayOrder: 15 },
  { id: "ihg", name: "IHG One Rewards", slug: "ihg-one-rewards", programmeType: "hotel_points", active: true, displayOrder: 16 },
  { id: "marriott", name: "Marriott Bonvoy", slug: "marriott-bonvoy", programmeType: "hotel_points", active: true, displayOrder: 17 },
  { id: "accor", name: "ALL Accor", slug: "all-accor", programmeType: "hotel_points", active: true, displayOrder: 18 },
];

/* -------------------- Reward products (bank-side currencies) -------------------- */

export const rewardProducts: RewardProduct[] = [
  // Maybank has two distinct bank-side currencies — TreatsPoints and Membership Rewards —
  // and multiple entitlement tiers within each.
  { id: "mbb-treats-premium", bankId: "maybank", name: "Maybank TreatsPoints — Selected Visa Infinite / World Elite / M2 Premier", slug: "mbb-treats-premium", rewardCurrencyName: "TreatsPoints", active: true, displayOrder: 1 },
  { id: "mbb-mr-selected-amex", bankId: "maybank", name: "Maybank Membership Rewards — Selected Amex Credit & Charge", slug: "mbb-mr-selected-amex", rewardCurrencyName: "Membership Rewards", active: true, displayOrder: 2 },
  { id: "mbb-mr-plat-charge", bankId: "maybank", name: "Maybank Membership Rewards — Amex Platinum Charge", slug: "mbb-mr-plat-charge", rewardCurrencyName: "Membership Rewards", active: true, displayOrder: 3 },
  { id: "mbb-treats-standard", bankId: "maybank", name: "Maybank TreatsPoints — Classic / Gold / Platinum / Visa Signature", slug: "mbb-treats-standard", rewardCurrencyName: "TreatsPoints", active: true, displayOrder: 5 },
  // CIMB
  { id: "cimb-bonus", bankId: "cimb", name: "CIMB Bonus Points", slug: "cimb-bonus", rewardCurrencyName: "Bonus Points", active: true, displayOrder: 1 },
  // Alliance
  { id: "alliance-tbp", bankId: "alliance", name: "Alliance Three-year Bonus Points (TBP)", slug: "alliance-tbp", rewardCurrencyName: "TBP", active: true, displayOrder: 1 },
  // UOB — one currency (UNIRM), multiple entitlement tiers by card.
  { id: "uob-unirm", bankId: "uob", name: "UOB UNIRinggit (UNIRM)", slug: "uob-unirm", rewardCurrencyName: "UNIRM", active: true, displayOrder: 1 },
];

/* -------------------- Card groups (entitlement tiers) -------------------- */

export const eligibleCardGroups: EligibleCardGroup[] = [
  // ------- Maybank -------
  {
    id: "cg-mbb-treats-premium",
    rewardProductId: "mbb-treats-premium",
    name: "Selected Visa Infinite / World Elite / Maybank 2 Cards Premier — 12,500 TP per 1,000 miles",
    description:
      "Preferential Maybank TreatsPoints tier officially listed by Maybank. Not to be confused with the standard TreatsPoints tier.",
    eligibleCards: [
      "Visa Infinite Card (conventional and Islamic)",
      "Visa Infinite Manchester United",
      "Visa Infinite Diamanté",
      "Mercedes-Benz Card",
      "Maybank 2 Cards Premier — American Express Reserve",
      "Maybank 2 Cards Premier — Visa Infinite",
      "World Elite Mastercard (conventional and Islamic)",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-mr-selected-amex",
    rewardProductId: "mbb-mr-selected-amex",
    name: "Selected Amex Credit and Charge Cards — 12,500 MR per 1,000 miles",
    description: "Maybank Membership Rewards preferential tier.",
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
    name: "American Express Platinum Charge Card — 7,000 MR per 1,000 miles",
    description:
      "Maybank explicitly maintains a separate, more favourable Membership Rewards rate for the Platinum Charge Card.",
    eligibleCards: ["American Express Platinum Charge Card"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-mbb-treats-standard",
    rewardProductId: "mbb-treats-standard",
    name: "Classic / Gold / Platinum / Visa Signature — 20,000 TP per 1,000 miles",
    description:
      "Standard Maybank TreatsPoints tier for all Classic, Gold, Platinum and Visa Signature cards not included in the preferential Visa Infinite / World Elite / Maybank 2 Cards Premier tier. Includes Maybank 2 Platinum Cards (note: not the same product as Maybank 2 Cards Premier).",
    eligibleCards: [
      "All Maybank Classic, Gold, Platinum and Visa Signature cards not in the preferential tier",
      "Maybank 2 Platinum Cards",
    ],
    active: true,
    displayOrder: 1,
  },

  // ------- CIMB -------
  {
    id: "cg-cimb-bonus",
    rewardProductId: "cimb-bonus",
    name: "CIMB Bonus Points — all eligible credit cards",
    description:
      "CIMB Bonus Points transfers are available to twelve airline partners at published ratios. Earning rates differ by card, but the conversion route does not.",
    eligibleCards: [
      "CIMB Travel World Elite",
      "CIMB Travel World",
      "CIMB Travel Platinum",
      "CIMB Preferred Visa Infinite / Visa Infinite-i",
      "CIMB Visa Infinite",
      "CIMB Visa Signature",
      "CIMB PETRONAS Visa Infinite-i",
      "Other CIMB credit cards earning Bonus Points",
    ],
    active: true,
    displayOrder: 1,
  },

  // ------- Alliance -------
  {
    id: "cg-alliance-tbp",
    rewardProductId: "alliance-tbp",
    name: "Alliance Bank credit cards — Three-year Bonus Points (TBP)",
    description:
      "Effective 1 December 2025, Alliance TBP redemptions are in compulsory 5,000 partner-point blocks.",
    eligibleCards: [
      "Alliance Bank Visa Infinite",
      "Alliance Bank Visa Platinum",
      "Alliance Bank Visa Signature",
      "Other Alliance Bank credit cards earning TBP",
    ],
    active: true,
    displayOrder: 1,
  },

  // ------- UOB — separate tiers by card -------
  {
    id: "cg-uob-metal",
    rewardProductId: "uob-unirm",
    name: "UOB Visa Infinite Metal — 5,000 UNIRM per 1,000 miles",
    description: "Currently UOB Malaysia's strongest publicly confirmed UNIRM conversion rate.",
    eligibleCards: ["UOB Visa Infinite Metal Card"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-uob-privilege",
    rewardProductId: "uob-unirm",
    name: "UOB Privilege Banking Visa Infinite — 10,000 UNIRM per 1,000 miles",
    description: "Rate published on UOB's Privilege Banking Visa Infinite card page.",
    eligibleCards: ["UOB Privilege Banking Visa Infinite"],
    active: true,
    displayOrder: 2,
  },
  {
    id: "cg-uob-vi-prvi",
    rewardProductId: "uob-unirm",
    name: "UOB Visa Infinite / PRVI Miles Elite — 12,000 UNIRM per 1,000 miles",
    description:
      "Same conversion rate for two cards. Keep both searchable so cardholders can find their exact product.",
    eligibleCards: ["UOB Visa Infinite", "UOB PRVI Miles Elite"],
    active: true,
    displayOrder: 3,
  },
  {
    id: "cg-uob-other",
    rewardProductId: "uob-unirm",
    name: "Other UOB card — rate requires confirmation",
    description:
      "For UOB World, PRVI Miles (non-Elite), Zenith, ONE, Preferred, EVOL, Lady's, Lazada, Simple, Basic and similar. No conversion is calculated until an official card-specific rate is recorded.",
    eligibleCards: [
      "UOB World Mastercard",
      "UOB PRVI Miles (non-Elite)",
      "UOB Zenith",
      "UOB ONE",
      "UOB Preferred",
      "UOB EVOL",
      "UOB Lady's",
      "UOB Lazada",
      "UOB Simple",
      "UOB Basic",
    ],
    unverifiedNotice:
      "We cannot confirm a preferential UNIRM conversion rate for this card from the currently recorded official source. Check the Air Miles section in UOB TMRW, or select another UOB card you hold.",
    active: true,
    displayOrder: 9,
  },
];

/* -------------------- Conversion rules -------------------- */

const MBB_SRC =
  "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/rewards/treatspoints.page";
const MBB_TITLE = "Maybank Service Tax Redemption and Air Miles Conversion Rate";
const CIMB_SRC =
  "https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-cards/bonus-points.html";
const CIMB_TITLE = "CIMB Bonus Points Redemption";
const ALLIANCE_SRC = "https://www.alliancebank.com.my/Personal/Cards/Rewards.aspx";
const ALLIANCE_TITLE =
  "Alliance Bank Three-year Bonus Points (TBP) Redemption";
const UOB_SRC = "https://www.uob.com.my/personal/cards/rewards/uniringgit.page";
const UOB_TITLE = "UOB Malaysia UNIRinggit Rewards";

const V = "2026-03-01"; // verification date used by every seeded rule
const MBB_EFF = "2025-02-22";
const ALLIANCE_EFF = "2025-12-01";

const MBB_ANNUAL_CAP = 2_000_000;
const MBB_ANNUAL_NOTE =
  "Transfer fulfilment remains subject to Maybank's applicable individual, campaign and collective monthly conversion limits. Maybank states a maximum of 2,000,000 Air Miles per customer per calendar year and a separate 250,000 Air Mile limit during a particular bonus campaign.";

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
  // ---- Maybank — Preferential TreatsPoints (12,500 → 1,000) ----
  rule("mbb-prem-enrich", "cg-mbb-treats-premium", "enrich", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-prem-krisflyer", "cg-mbb-treats-premium", "krisflyer", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-prem-cathay", "cg-mbb-treats-premium", "asia-miles", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // ---- Maybank — Selected Amex MR (12,500 → 1,000) ----
  rule("mbb-selamex-enrich", "cg-mbb-mr-selected-amex", "enrich", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-selamex-krisflyer", "cg-mbb-mr-selected-amex", "krisflyer", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-selamex-cathay", "cg-mbb-mr-selected-amex", "asia-miles", [12500, 1000], {
    effectiveFrom: MBB_EFF, annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // ---- Maybank — Amex Platinum Charge MR (7,000 → 1,000) ----
  rule("mbb-platch-enrich", "cg-mbb-mr-plat-charge", "enrich", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-platch-krisflyer", "cg-mbb-mr-plat-charge", "krisflyer", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-platch-cathay", "cg-mbb-mr-plat-charge", "asia-miles", [7000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // ---- Maybank — MR other travel partners ----
  rule("mbb-mrother-airasia", "cg-mbb-mr-other", "airasia", [5600, 1000]),
  rule("mbb-mrother-delta", "cg-mbb-mr-other", "delta", [5600, 1000]),
  rule("mbb-mrother-rop", "cg-mbb-mr-other", "rop", [5600, 1000]),
  rule("mbb-mrother-etihad", "cg-mbb-mr-other", "etihad", [5600, 1000]),
  rule("mbb-mrother-emirates", "cg-mbb-mr-other", "emirates", [5600, 1000]),
  rule("mbb-mrother-batik", "cg-mbb-mr-other", "batik", [7000, 10], {
    notes: "Batik Air Club units are not airline miles. Do not add them to any airline-miles total.",
  }),

  // ---- Maybank — Standard TreatsPoints (20,000 → 1,000) ----
  rule("mbb-std-enrich", "cg-mbb-treats-standard", "enrich", [20000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-std-krisflyer", "cg-mbb-treats-standard", "krisflyer", [20000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),
  rule("mbb-std-cathay", "cg-mbb-treats-standard", "asia-miles", [20000, 1000], {
    annualCapPartnerPoints: MBB_ANNUAL_CAP, notes: MBB_ANNUAL_NOTE,
  }),

  // ---- Maybank — All cards → AirAsia / Batik ----
  rule("mbb-all-airasia", "cg-mbb-all-cards-lowtier", "airasia", [7000, 1000]),
  rule("mbb-all-batik", "cg-mbb-all-cards-lowtier", "batik", [7000, 10], {
    notes: "Batik Air Club units are not airline miles.",
  }),

  // ---- CIMB ----
  rule("cimb-airasia", "cg-cimb-bonus", "airasia", [40000, 5000], {
    sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE,
    minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000,
    notes: "Transfers must be made by the principal cardholder into a matching-name loyalty account, in multiples of 5,000 partner points.",
  }),
  rule("cimb-enrich", "cg-cimb-bonus", "enrich", [62500, 5000], {
    sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE,
    minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000,
  }),
  rule("cimb-krisflyer", "cg-cimb-bonus", "krisflyer", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-flyingblue", "cg-cimb-bonus", "flying-blue", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-eva", "cg-cimb-bonus", "eva", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-ba", "cg-cimb-bonus", "ba", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-etihad", "cg-cimb-bonus", "etihad", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-cathay", "cg-cimb-bonus", "asia-miles", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-qatar", "cg-cimb-bonus", "qatar", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-emirates", "cg-cimb-bonus", "emirates", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-jal", "cg-cimb-bonus", "jal", [100000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-turkish", "cg-cimb-bonus", "turkish", [75000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-ihg", "cg-cimb-bonus", "ihg", [50000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-marriott", "cg-cimb-bonus", "marriott", [50000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),
  rule("cimb-accor", "cg-cimb-bonus", "accor", [125000, 5000], { sourceUrl: CIMB_SRC, sourceTitle: CIMB_TITLE, minimumTransferPartnerPoints: 5000, transferIncrementPartnerPoints: 5000 }),

  // ---- Alliance TBP (75,000 → 5,000 Enrich, cap 20,000 Enrich/month) ----
  rule("alliance-enrich", "cg-alliance-tbp", "enrich", [75000, 5000], {
    sourceUrl: ALLIANCE_SRC, sourceTitle: ALLIANCE_TITLE,
    effectiveFrom: ALLIANCE_EFF,
    minimumTransferPartnerPoints: 5000,
    transferIncrementPartnerPoints: 5000,
    monthlyCapPartnerPoints: 20000,
    notes:
      "Effective 1 December 2025, Alliance changed transfers from 1,000-point ratios to compulsory 5,000 partner-point blocks. Maximum 20,000 Enrich per cardholder per month (equivalent to 300,000 TBP).",
  }),
  rule("alliance-airasia", "cg-alliance-tbp", "airasia", [30000, 5000], {
    sourceUrl: ALLIANCE_SRC, sourceTitle: ALLIANCE_TITLE,
    effectiveFrom: ALLIANCE_EFF,
    minimumTransferPartnerPoints: 5000,
    transferIncrementPartnerPoints: 5000,
    monthlyCapPartnerPoints: 20000,
    notes:
      "Effective 1 December 2025, compulsory 5,000-point transfer blocks. Maximum 20,000 AirAsia points per cardholder per month (equivalent to 120,000 TBP).",
  }),

  // ---- UOB — three verified card tiers ----
  rule("uob-metal-enrich", "cg-uob-metal", "enrich", [5000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-metal-krisflyer", "cg-uob-metal", "krisflyer", [5000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-metal-cathay", "cg-uob-metal", "asia-miles", [5000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),

  rule("uob-privilege-enrich", "cg-uob-privilege", "enrich", [10000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-privilege-krisflyer", "cg-uob-privilege", "krisflyer", [10000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-privilege-cathay", "cg-uob-privilege", "asia-miles", [10000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),

  rule("uob-vi-prvi-enrich", "cg-uob-vi-prvi", "enrich", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-vi-prvi-krisflyer", "cg-uob-vi-prvi", "krisflyer", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
  rule("uob-vi-prvi-cathay", "cg-uob-vi-prvi", "asia-miles", [12000, 1000], { sourceUrl: UOB_SRC, sourceTitle: UOB_TITLE }),
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
export function getCardGroupsByBank(bankId: string) {
  const productIds = new Set(getRewardProductsByBank(bankId).map((p) => p.id));
  return eligibleCardGroups
    .filter((g) => productIds.has(g.rewardProductId) && g.active)
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
