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
  | "partially_verified"
  | "announced_rate_unverified"
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
  sourcePublisher?: string;
  redemptionChannel?: string;
  processingTime?: string;
  reviewNotes?: string;
  status: RuleStatus;
  active: boolean;
}

export type CardStatus =
  | "active"
  | "legacy"
  | "discontinued"
  | "cashback_only"
  | "direct_airline"
  | "rate_unconfirmed";

export interface Card {
  id: string;
  bankId: string;
  /** Official card name as printed on the card. */
  name: string;
  /** Alternative names/spellings to match in search. */
  aliases?: string[];
  /** Card-group id that acts as the reusable conversion profile. */
  cardGroupId: string;
  status: CardStatus;
  officialSourceUrl?: string;
  lastVerifiedDate?: string;
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
  {
    id: "hsbc",
    name: "HSBC Malaysia",
    slug: "hsbc-malaysia",
    country: "MY",
    active: true,
    displayOrder: 5,
    officialRewardsUrl: "https://www.hsbc.com.my/credit-cards/offers/travelone/",
  },
  {
    id: "hongleong",
    name: "Hong Leong Bank",
    slug: "hong-leong-bank",
    country: "MY",
    active: true,
    displayOrder: 6,
    officialRewardsUrl: "https://www.hlb.com.my/en/personal-banking/help-support/rewards.html",
  },
  {
    id: "affin",
    name: "AFFIN Bank",
    slug: "affin-bank",
    country: "MY",
    active: true,
    displayOrder: 7,
    officialRewardsUrl: "https://www.affinalways.com/en/personal/cards/rewards",
  },
  {
    id: "ambank",
    name: "AmBank",
    slug: "ambank",
    country: "MY",
    active: true,
    displayOrder: 8,
    officialRewardsUrl: "https://www.ambank.com.my/eng/cards/credit-cards/ambonus-points",
  },
  {
    id: "publicbank",
    name: "Public Bank",
    slug: "public-bank",
    country: "MY",
    active: true,
    displayOrder: 9,
    officialRewardsUrl: "https://www.pbebank.com/Personal/Cards/Rewards.aspx",
  },
  {
    id: "bankrakyat",
    name: "Bank Rakyat",
    slug: "bank-rakyat",
    country: "MY",
    active: true,
    displayOrder: 10,
    officialRewardsUrl: "https://www.bankrakyat.com.my/",
  },
  {
    id: "sc",
    name: "Standard Chartered",
    slug: "standard-chartered",
    country: "MY",
    active: true,
    displayOrder: 11,
    officialRewardsUrl: "https://www.sc.com/my/credit-cards/journey/",
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
  { id: "aeroplan", name: "Aeroplan", slug: "aeroplan", programmeType: "airline_miles", airlineName: "Air Canada", active: true, displayOrder: 19 },
  { id: "qantas", name: "Qantas Frequent Flyer", slug: "qantas-frequent-flyer", programmeType: "airline_miles", airlineName: "Qantas", active: true, displayOrder: 20 },
  { id: "fortune-wings", name: "Fortune Wings Club", slug: "fortune-wings-club", programmeType: "airline_miles", airlineName: "Hainan Airlines", active: true, displayOrder: 21 },
  { id: "vietnam", name: "Vietnam Airlines Lotusmiles", slug: "vietnam-lotusmiles", programmeType: "airline_miles", airlineName: "Vietnam Airlines", active: true, displayOrder: 22 },
  { id: "united", name: "United MileagePlus", slug: "united-mileageplus", programmeType: "airline_miles", airlineName: "United Airlines", active: true, displayOrder: 23 },
  { id: "wyndham", name: "Wyndham Rewards", slug: "wyndham-rewards", programmeType: "hotel_points", active: true, displayOrder: 24 },
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
  // HSBC
  { id: "hsbc-rewards", bankId: "hsbc", name: "HSBC Reward Points — TravelOne", slug: "hsbc-rewards", rewardCurrencyName: "HSBC Reward Points", active: true, displayOrder: 1 },
  // Hong Leong
  { id: "hlb-rewards", bankId: "hongleong", name: "HLB Reward Points", slug: "hlb-rewards", rewardCurrencyName: "HLB Reward Points", active: true, displayOrder: 1 },
  { id: "hlb-direct", bankId: "hongleong", name: "HLB direct Enrich earning cards", slug: "hlb-direct", rewardCurrencyName: "Enrich Points (earned directly)", active: true, displayOrder: 2 },
  // AFFIN
  { id: "affin-rewards", bankId: "affin", name: "AFFIN Rewards Points", slug: "affin-rewards", rewardCurrencyName: "AFFIN Rewards Points", active: true, displayOrder: 1 },
  // AmBank
  { id: "ambank-bonus", bankId: "ambank", name: "AmBonus Points", slug: "ambank-bonus", rewardCurrencyName: "AmBonus Points", active: true, displayOrder: 1 },
  { id: "ambank-direct", bankId: "ambank", name: "AmBank direct Enrich earning cards", slug: "ambank-direct", rewardCurrencyName: "Enrich Points (earned directly)", active: true, displayOrder: 2 },
  // Public Bank
  { id: "pb-points", bankId: "publicbank", name: "PB Points", slug: "pb-points", rewardCurrencyName: "PB Points", active: true, displayOrder: 1 },
  // Bank Rakyat
  { id: "rakyat-points", bankId: "bankrakyat", name: "Rakyat Reward Points", slug: "rakyat-points", rewardCurrencyName: "Rakyat Reward Points", active: true, displayOrder: 1 },
  // Standard Chartered
  { id: "sc-journey", bankId: "sc", name: "SC Journey Miles", slug: "sc-journey", rewardCurrencyName: "Journey Miles", active: true, displayOrder: 1 },
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

  // ------- HSBC -------
  {
    id: "cg-hsbc-travelone",
    rewardProductId: "hsbc-rewards",
    name: "HSBC TravelOne Credit Card",
    description:
      "HSBC Reward Points earned on the HSBC TravelOne Credit Card. Airline, hotel and lifestyle transfers use the block ratios published on the HSBC Malaysia TravelOne partner table.",
    eligibleCards: ["HSBC TravelOne Credit Card"],
    active: true,
    displayOrder: 1,
  },

  // ------- Hong Leong -------
  {
    id: "cg-hlb-sutera",
    rewardProductId: "hlb-rewards",
    name: "HLB Sutera Platinum — 24,000 HLB Points per 1,000 Enrich (online)",
    description:
      "Hong Leong Sutera Platinum online redemption route. Contact-centre route (28,800 HLB Points per 1,000 Enrich) is documented but not used as the default calculation.",
    eligibleCards: ["HLB Sutera Platinum"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-hlb-direct-enrich",
    rewardProductId: "hlb-direct",
    name: "HLB Infinite / Infinite P / Infinite Doctor's Edition — direct Enrich earning",
    description:
      "These cards earn Enrich Points directly. There is no HLB Reward Points balance to convert.",
    eligibleCards: [
      "HLB Infinite P",
      "HLB Infinite",
      "HLB Infinite Doctor's Edition",
    ],
    unverifiedNotice:
      "This card earns Enrich Points directly. Enter your accumulated Enrich balance under Step 2 (Existing airline or hotel balances). Current earn rates — HLB Infinite P: RM1 = 1 Enrich (dining), RM3 = 1 (travel & retail), RM5 = 1 (other). HLB Infinite and Infinite Doctor's Edition: RM1 = 1 (dining), RM4 = 1 (travel & retail), RM6 = 1 (other).",
    active: true,
    displayOrder: 2,
  },

  // ------- AFFIN -------
  {
    id: "cg-affin-p1",
    rewardProductId: "affin-rewards",
    name: "AFFIN INVIKTA / DIVENTIUM — 8,000 AFFIN Rewards Points per 1,000 Enrich",
    eligibleCards: [
      "AFFIN INVIKTA Visa Infinite",
      "AFFIN INVIKTA Visa Infinite-i",
      "AFFIN INVIKTA World Mastercard",
      "AFFIN INVIKTA World Mastercard-i",
      "AFFIN DIVENTIUM",
      "AFFIN DIVENTIUM-i",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-affin-p2",
    rewardProductId: "affin-rewards",
    name: "AFFIN World Mastercard / UKM Alumni Premier World — 15,000 AFFIN Rewards Points per 1,000 Enrich",
    description:
      "The UKM/UTM Alumni card naming across AFFIN pages is inconsistent and requires manual confirmation before splitting into separate records.",
    eligibleCards: [
      "AFFIN World Mastercard",
      "AFFIN World Mastercard-i",
      "AFFIN UKM Alumni Premier World Mastercard",
      "AFFIN UKM Alumni Premier World Mastercard-i",
    ],
    active: true,
    displayOrder: 2,
  },
  {
    id: "cg-affin-p3",
    rewardProductId: "affin-rewards",
    name: "Other AFFIN Rewards Points cards — 20,000 AFFIN Rewards Points per 1,000 Enrich",
    eligibleCards: ["Other current AFFIN cards that issue AFFIN Rewards Points"],
    active: true,
    displayOrder: 3,
  },

  // ------- AmBank -------
  {
    id: "cg-ambank-p1",
    rewardProductId: "ambank-bonus",
    name: "AmBank SIGNATURE Priority Banking / Visa Infinite — 12,000 AmBonus per 1,000 Enrich",
    description:
      "Effective 1 April 2026. Previous 10,000 / 12,000 / 15,000 rates are no longer applied.",
    eligibleCards: [
      "AmBank SIGNATURE Priority Banking — The Metal Visa Infinite",
      "AmBank SIGNATURE Priority Banking Visa Infinite",
      "AmBank SIGNATURE Priority Banking World Mastercard",
      "AmBank Islamic SIGNATURE Priority Banking World Mastercard-i",
      "AmBank Visa Infinite",
      "AmBank Islamic Visa Infinite-i",
    ],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-ambank-p2",
    rewardProductId: "ambank-bonus",
    name: "AmBank World / Signature / Platinum / Gold — 18,000 AmBonus per 1,000 Enrich",
    description: "Effective 1 April 2026.",
    eligibleCards: [
      "AmBank World Mastercard",
      "AmBank Islamic World Mastercard-i",
      "AmBank Visa Signature",
      "AmBank Islamic Visa Signature-i",
      "AmBank Visa Platinum",
      "AmBank Islamic Visa Platinum-i",
      "AmBank Visa Platinum Business",
      "AmBank Visa Gold",
      "AmBank Islamic Visa Gold-i",
    ],
    active: true,
    displayOrder: 2,
  },
  {
    id: "cg-ambank-direct-enrich",
    rewardProductId: "ambank-direct",
    name: "AmBank Enrich Visa Infinite / Platinum — direct Enrich earning",
    eligibleCards: [
      "AmBank Enrich Visa Infinite",
      "AmBank Enrich Visa Platinum",
    ],
    unverifiedNotice:
      "This card earns Enrich Points directly. Do not enter an AmBonus balance. Enter your accumulated Enrich balance under Step 2 (Existing airline or hotel balances).",
    active: true,
    displayOrder: 3,
  },

  // ------- Public Bank -------
  {
    id: "cg-pb-standard",
    rewardProductId: "pb-points",
    name: "Public Bank credit cards — 12,500 PB Points per 1,000 Enrich / 2,000 AirAsia",
    description:
      "Effective 1 May 2026. Transfers in complete 12,500 PB Point blocks.",
    eligibleCards: [
      "PB World Mastercard",
      "PB Visa Signature",
      "PB Platinum Mastercard",
      "PB Quantum Visa",
      "PB Quantum Mastercard",
      "PB RCB Gold",
      "PB RCB Elite",
    ],
    active: true,
    displayOrder: 1,
  },

  // ------- Bank Rakyat -------
  {
    id: "cg-rakyat",
    rewardProductId: "rakyat-points",
    name: "Bank Rakyat credit cards — 5,500 Rakyat Reward Points per 1,000 Enrich",
    eligibleCards: ["Bank Rakyat credit cards that issue Rakyat Reward Points"],
    active: true,
    displayOrder: 1,
  },

  // ------- Standard Chartered (partially verified) -------
  {
    id: "cg-sc-journey",
    rewardProductId: "sc-journey",
    name: "SC Journey Credit Card — programme-level transfer requires verification",
    description:
      "Partially verified. Headline earn ratio: 2 Journey Miles = 1 AirMile. Per-partner conversion denominations, minimum transfers and increments still need confirmation from the current Journey catalogue.",
    eligibleCards: ["Standard Chartered Journey Credit Card"],
    unverifiedNotice:
      "Programme-level transfer details for SC Journey Miles require verification. The headline earn ratio (2 Journey Miles = 1 AirMile) is documented, but per-partner conversion denominations, minimum transfer sizes and increments are not currently confirmed. Balances cannot be converted until the catalogue is verified.",
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

  // ---- HSBC TravelOne — 21 verified partner routes ----
  ...(([
    ["enrich", 21],
    ["airasia", 12],
    ["krisflyer", 25],
    ["asia-miles", 25],
    ["aeroplan", 55],
    ["flying-blue", 35],
    ["ba", 30],
    ["etihad", 35],
    ["eva", 40],
    ["fortune-wings", 45],
    ["jal", 60],
    ["qantas", 35],
    ["qatar", 45],
    ["rop", 45],
    ["turkish", 45],
    ["united", 50],
    ["vietnam", 35],
    ["marriott", 25],
    ["ihg", 25],
    ["wyndham", 40],
    ["accor", 70],
  ] as [string, number][]).map(([prog, hsbc]): ConversionRule => ({
    id: `hsbc-travelone-${prog}`,
    eligibleCardGroupId: "cg-hsbc-travelone",
    loyaltyProgrammeId: prog,
    bankPointsPerBlock: hsbc,
    partnerPointsPerBlock: 1,
    verifiedOn: "2026-07-01",
    sourceUrl: "https://www.hsbc.com.my/credit-cards/offers/travelone/",
    sourceTitle: "HSBC Malaysia TravelOne — Reward Points partner conversion table",
    sourcePublisher: "HSBC Bank Malaysia Berhad",
    status: "verified",
    active: true,
    reviewNotes:
      "Emirates Skywards deliberately not added — not listed on the current HSBC Malaysia TravelOne partner table.",
  })),

  // ---- Hong Leong Sutera Platinum (online default) ----
  rule("hlb-sutera-enrich-online", "cg-hlb-sutera", "enrich", [24000, 1000], {
    sourceUrl: "https://www.hlb.com.my/en/personal-banking/help-support/rewards.html",
    sourceTitle: "Hong Leong Bank Rewards — Sutera Platinum Enrich conversion",
    sourcePublisher: "Hong Leong Bank Berhad",
    verifiedOn: "2026-07-01",
    redemptionChannel: "Online (HLB Connect). Alternative contact-centre route: 28,800 HLB Points = 1,000 Enrich Points.",
    reviewNotes: "Online rate used as default. Contact-centre rate documented but not applied automatically.",
  }),

  // ---- AFFIN — three profiles, Enrich only ----
  rule("affin-p1-enrich", "cg-affin-p1", "enrich", [8000, 1000], {
    sourceUrl: "https://www.affinalways.com/en/personal/cards/rewards",
    sourceTitle: "AFFIN Rewards Points redemption",
    sourcePublisher: "AFFIN Bank Berhad",
    verifiedOn: "2026-07-01",
    reviewNotes:
      "Expired 2024 promotional rates are not used. AirAsia and Batik Air Club routes intentionally not enabled until a current official conversion block is recorded.",
  }),
  rule("affin-p2-enrich", "cg-affin-p2", "enrich", [15000, 1000], {
    sourceUrl: "https://www.affinalways.com/en/personal/cards/rewards",
    sourceTitle: "AFFIN Rewards Points redemption",
    sourcePublisher: "AFFIN Bank Berhad",
    verifiedOn: "2026-07-01",
    reviewNotes:
      "AFFIN UKM / UTM Alumni Premier World card naming discrepancy flagged for manual confirmation. Single card group used to avoid duplicate records.",
  }),
  rule("affin-p3-enrich", "cg-affin-p3", "enrich", [20000, 1000], {
    sourceUrl: "https://www.affinalways.com/en/personal/cards/rewards",
    sourceTitle: "AFFIN Rewards Points redemption",
    sourcePublisher: "AFFIN Bank Berhad",
    verifiedOn: "2026-07-01",
  }),

  // ---- AmBank AmBonus (effective 1 April 2026) — Enrich only ----
  rule("ambank-p1-enrich", "cg-ambank-p1", "enrich", [12000, 1000], {
    sourceUrl: "https://www.ambank.com.my/eng/cards/credit-cards/ambonus-points",
    sourceTitle: "AmBank AmBonus Points redemption",
    sourcePublisher: "AmBank (M) Berhad",
    verifiedOn: "2026-07-01",
    effectiveFrom: "2026-04-01",
    reviewNotes:
      "Previous 10,000 / 12,000 / 15,000 AmBonus rates are no longer applied. Do not reuse this Enrich ratio for KrisFlyer, Asia Miles or AirAsia unless separate current rates are verified.",
  }),
  rule("ambank-p2-enrich", "cg-ambank-p2", "enrich", [18000, 1000], {
    sourceUrl: "https://www.ambank.com.my/eng/cards/credit-cards/ambonus-points",
    sourceTitle: "AmBank AmBonus Points redemption",
    sourcePublisher: "AmBank (M) Berhad",
    verifiedOn: "2026-07-01",
    effectiveFrom: "2026-04-01",
  }),

  // ---- Public Bank PB Points (effective 1 May 2026) ----
  rule("pb-enrich", "cg-pb-standard", "enrich", [12500, 1000], {
    sourceUrl: "https://www.pbebank.com/Personal/Cards/Rewards.aspx",
    sourceTitle: "Public Bank PB Points redemption",
    sourcePublisher: "Public Bank Berhad",
    verifiedOn: "2026-07-01",
    effectiveFrom: "2026-05-01",
    reviewNotes: "Enforced in complete 12,500 PB Point blocks.",
  }),
  rule("pb-airasia", "cg-pb-standard", "airasia", [12500, 2000], {
    sourceUrl: "https://www.pbebank.com/Personal/Cards/Rewards.aspx",
    sourceTitle: "Public Bank PB Points redemption",
    sourcePublisher: "Public Bank Berhad",
    verifiedOn: "2026-07-01",
    effectiveFrom: "2026-05-01",
    reviewNotes: "AirAsia appears under transfer balances only — no fixed-price destination card is generated for AirAsia points.",
  }),

  // ---- Bank Rakyat ----
  rule("rakyat-enrich", "cg-rakyat", "enrich", [5500, 1000], {
    sourceUrl: "https://www.bankrakyat.com.my/",
    sourceTitle: "Bank Rakyat Rakyat Reward Points",
    sourcePublisher: "Bank Rakyat",
    verifiedOn: "2026-07-01",
    reviewNotes: "Only attach this profile to cards that currently issue Rakyat Reward Points.",
  }),
];

/* -------------------- Cards (searchable) -------------------- */

const mkCard = (
  id: string,
  bankId: string,
  name: string,
  cardGroupId: string,
  extra: Partial<Card> = {},
): Card => ({
  id, bankId, name, cardGroupId, status: "active", ...extra,
});

export const cards: Card[] = [
  // ---------- Maybank — Profile A: 12,500 TP → 1,000 miles ----------
  mkCard("mbb-visa-infinite", "maybank", "Maybank Visa Infinite", "cg-mbb-treats-premium"),
  mkCard("mbb-islamic-visa-infinite", "maybank", "Maybank Islamic Ikhwan Visa Infinite Card-i", "cg-mbb-treats-premium", { aliases: ["Ikhwan Visa Infinite", "Islamic Visa Infinite"] }),
  mkCard("mbb-mu-visa-infinite", "maybank", "Maybank Manchester United Visa Infinite", "cg-mbb-treats-premium", { aliases: ["MU Visa Infinite"] }),
  mkCard("mbb-visa-infinite-diamante", "maybank", "Maybank Visa Infinite Diamanté", "cg-mbb-treats-premium", { aliases: ["Diamante"] }),
  mkCard("mbb-mercedes", "maybank", "Maybank Mercedes-Benz Card", "cg-mbb-treats-premium"),
  mkCard("mbb-m2-premier-amex", "maybank", "Maybank 2 Cards Premier — American Express Reserve", "cg-mbb-treats-premium", { aliases: ["M2 Premier Amex Reserve"] }),
  mkCard("mbb-m2-premier-visa", "maybank", "Maybank 2 Cards Premier — Visa Infinite", "cg-mbb-treats-premium", { aliases: ["M2 Premier Visa Infinite"] }),
  mkCard("mbb-world-elite", "maybank", "Maybank World Elite Mastercard", "cg-mbb-treats-premium"),
  mkCard("mbb-islamic-world-elite", "maybank", "Maybank Islamic World Elite Mastercard-i", "cg-mbb-treats-premium"),

  // ---------- Maybank — Profile B: 12,500 MR → 1,000 miles ----------
  mkCard("mbb-amex-plat-credit", "maybank", "American Express Platinum Credit Card", "cg-mbb-mr-selected-amex", { aliases: ["Amex Platinum Credit"] }),
  mkCard("mbb-amex-charge", "maybank", "American Express Charge Card", "cg-mbb-mr-selected-amex", { aliases: ["Amex Green Charge"] }),
  mkCard("mbb-amex-gold-charge", "maybank", "American Express Gold Charge Card", "cg-mbb-mr-selected-amex", { aliases: ["Amex Gold Charge"] }),

  // ---------- Maybank — Profile C: 7,000 MR → 1,000 miles ----------
  mkCard("mbb-amex-plat-charge", "maybank", "American Express Platinum Charge Card", "cg-mbb-mr-plat-charge", { aliases: ["Amex Platinum Charge"] }),

  // ---------- Maybank — Profile D: 20,000 TP → 1,000 miles ----------
  mkCard("mbb-m2-platinum", "maybank", "Maybank 2 Platinum Cards", "cg-mbb-treats-standard", { aliases: ["M2 Platinum", "Maybank 2 Platinum"] }),
  mkCard("mbb-m2-gold", "maybank", "Maybank 2 Gold Cards", "cg-mbb-treats-standard"),
  mkCard("mbb-visa-platinum", "maybank", "Maybank Visa Platinum", "cg-mbb-treats-standard"),
  mkCard("mbb-mc-platinum", "maybank", "Maybank Mastercard Platinum", "cg-mbb-treats-standard"),
  mkCard("mbb-visa-gold", "maybank", "Maybank Visa Gold", "cg-mbb-treats-standard"),
  mkCard("mbb-mc-gold", "maybank", "Maybank Mastercard Gold", "cg-mbb-treats-standard"),
  mkCard("mbb-visa-classic", "maybank", "Maybank Visa Classic", "cg-mbb-treats-standard"),
  mkCard("mbb-mc-classic", "maybank", "Maybank Mastercard Classic", "cg-mbb-treats-standard"),
  mkCard("mbb-visa-signature", "maybank", "Maybank Visa Signature", "cg-mbb-treats-standard"),
  mkCard("mbb-mu-visa", "maybank", "Maybank Manchester United Visa", "cg-mbb-treats-standard"),
  mkCard("mbb-petronas-visa-gold", "maybank", "PETRONAS Maybank Visa Gold", "cg-mbb-treats-standard"),
  mkCard("mbb-petronas-ikhwan", "maybank", "PETRONAS Ikhwan Visa Platinum Card-i", "cg-mbb-treats-standard"),
  mkCard("mbb-ikhwan-amex-plat", "maybank", "Ikhwan American Express Platinum Card-i", "cg-mbb-treats-standard"),

  // ---------- UOB ----------
  mkCard("uob-metal", "uob", "UOB Visa Infinite Metal", "cg-uob-metal", { aliases: ["Visa Infinite Metal"] }),
  mkCard("uob-privilege-vi", "uob", "UOB Privilege Banking Visa Infinite", "cg-uob-privilege"),
  mkCard("uob-visa-infinite", "uob", "UOB Visa Infinite", "cg-uob-vi-prvi"),
  mkCard("uob-prvi-elite", "uob", "UOB PRVI Miles Elite", "cg-uob-vi-prvi", { aliases: ["PRVI Elite"] }),
  mkCard("uob-world-mc", "uob", "UOB World Mastercard", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-zenith", "uob", "UOB Zenith Mastercard", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-prvi", "uob", "UOB PRVI Miles", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-one", "uob", "UOB ONE Card", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-evol", "uob", "UOB EVOL Card", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-ladys", "uob", "UOB Lady's Card", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-preferred", "uob", "UOB Preferred Platinum Visa", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-lazada", "uob", "UOB Lazada Card", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-simple", "uob", "UOB YOLO / Simple Card", "cg-uob-other", { status: "rate_unconfirmed" }),
  mkCard("uob-basic", "uob", "UOB Basic Card", "cg-uob-other", { status: "rate_unconfirmed" }),

  // ---------- Alliance Bank ----------
  mkCard("alliance-visa-infinite", "alliance", "Alliance Bank Visa Infinite", "cg-alliance-tbp"),
  mkCard("alliance-visa-platinum", "alliance", "Alliance Bank Visa Platinum", "cg-alliance-tbp"),
  mkCard("alliance-visa-signature", "alliance", "Alliance Bank Visa Signature", "cg-alliance-tbp"),
  mkCard("alliance-virtual", "alliance", "Alliance Bank Virtual Credit Card", "cg-alliance-tbp", { aliases: ["Alliance Virtual"] }),

  // ---------- CIMB ----------
  mkCard("cimb-travel-world-elite", "cimb", "CIMB Travel World Elite", "cg-cimb-bonus"),
  mkCard("cimb-travel-world", "cimb", "CIMB Travel World", "cg-cimb-bonus"),
  mkCard("cimb-travel-platinum", "cimb", "CIMB Travel Platinum", "cg-cimb-bonus"),
  mkCard("cimb-preferred-vi", "cimb", "CIMB Preferred Visa Infinite", "cg-cimb-bonus"),
  mkCard("cimb-preferred-vi-i", "cimb", "CIMB Preferred Visa Infinite-i", "cg-cimb-bonus"),
  mkCard("cimb-visa-infinite", "cimb", "CIMB Visa Infinite", "cg-cimb-bonus"),
  mkCard("cimb-visa-signature", "cimb", "CIMB Visa Signature", "cg-cimb-bonus"),
  mkCard("cimb-petronas-vi-i", "cimb", "CIMB PETRONAS Visa Infinite-i", "cg-cimb-bonus"),

  // ---------- HSBC ----------
  mkCard("hsbc-travelone", "hsbc", "HSBC TravelOne Credit Card", "cg-hsbc-travelone"),

  // ---------- Hong Leong ----------
  mkCard("hlb-sutera-platinum", "hongleong", "HLB Sutera Platinum", "cg-hlb-sutera"),
  mkCard("hlb-infinite-p", "hongleong", "HLB Infinite P", "cg-hlb-direct-enrich", { status: "direct_airline" }),
  mkCard("hlb-infinite", "hongleong", "HLB Infinite", "cg-hlb-direct-enrich", { status: "direct_airline" }),
  mkCard("hlb-infinite-doctor", "hongleong", "HLB Infinite Doctor's Edition", "cg-hlb-direct-enrich", { status: "direct_airline", aliases: ["Doctors Edition", "Doctor Edition"] }),

  // ---------- AFFIN ----------
  mkCard("affin-invikta-vi", "affin", "AFFIN INVIKTA Visa Infinite", "cg-affin-p1"),
  mkCard("affin-invikta-vi-i", "affin", "AFFIN INVIKTA Visa Infinite-i", "cg-affin-p1"),
  mkCard("affin-invikta-world", "affin", "AFFIN INVIKTA World Mastercard", "cg-affin-p1"),
  mkCard("affin-invikta-world-i", "affin", "AFFIN INVIKTA World Mastercard-i", "cg-affin-p1"),
  mkCard("affin-diventium", "affin", "AFFIN DIVENTIUM", "cg-affin-p1"),
  mkCard("affin-diventium-i", "affin", "AFFIN DIVENTIUM-i", "cg-affin-p1"),
  mkCard("affin-world", "affin", "AFFIN World Mastercard", "cg-affin-p2"),
  mkCard("affin-world-i", "affin", "AFFIN World Mastercard-i", "cg-affin-p2"),
  mkCard("affin-ukm", "affin", "AFFIN UKM Alumni Premier World Mastercard", "cg-affin-p2", { aliases: ["UTM Alumni Premier World", "UKM Alumni"] }),
  mkCard("affin-ukm-i", "affin", "AFFIN UKM Alumni Premier World Mastercard-i", "cg-affin-p2", { aliases: ["UTM Alumni Premier World-i"] }),
  mkCard("affin-other", "affin", "Other AFFIN card earning Rewards Points", "cg-affin-p3"),

  // ---------- AmBank ----------
  mkCard("ambank-sig-metal", "ambank", "AmBank SIGNATURE Priority Banking — The Metal Visa Infinite", "cg-ambank-p1", { aliases: ["Metal Visa Infinite"] }),
  mkCard("ambank-sig-vi", "ambank", "AmBank SIGNATURE Priority Banking Visa Infinite", "cg-ambank-p1"),
  mkCard("ambank-sig-world", "ambank", "AmBank SIGNATURE Priority Banking World Mastercard", "cg-ambank-p1"),
  mkCard("ambank-islamic-sig-world", "ambank", "AmBank Islamic SIGNATURE Priority Banking World Mastercard-i", "cg-ambank-p1"),
  mkCard("ambank-vi", "ambank", "AmBank Visa Infinite", "cg-ambank-p1"),
  mkCard("ambank-islamic-vi", "ambank", "AmBank Islamic Visa Infinite-i", "cg-ambank-p1"),
  mkCard("ambank-world", "ambank", "AmBank World Mastercard", "cg-ambank-p2"),
  mkCard("ambank-islamic-world", "ambank", "AmBank Islamic World Mastercard-i", "cg-ambank-p2"),
  mkCard("ambank-vsig", "ambank", "AmBank Visa Signature", "cg-ambank-p2"),
  mkCard("ambank-islamic-vsig", "ambank", "AmBank Islamic Visa Signature-i", "cg-ambank-p2"),
  mkCard("ambank-vplat", "ambank", "AmBank Visa Platinum", "cg-ambank-p2"),
  mkCard("ambank-islamic-vplat", "ambank", "AmBank Islamic Visa Platinum-i", "cg-ambank-p2"),
  mkCard("ambank-vplat-biz", "ambank", "AmBank Visa Platinum Business", "cg-ambank-p2"),
  mkCard("ambank-vgold", "ambank", "AmBank Visa Gold", "cg-ambank-p2"),
  mkCard("ambank-islamic-vgold", "ambank", "AmBank Islamic Visa Gold-i", "cg-ambank-p2"),
  mkCard("ambank-enrich-vi", "ambank", "AmBank Enrich Visa Infinite", "cg-ambank-direct-enrich", { status: "direct_airline" }),
  mkCard("ambank-enrich-vplat", "ambank", "AmBank Enrich Visa Platinum", "cg-ambank-direct-enrich", { status: "direct_airline" }),

  // ---------- Public Bank ----------
  mkCard("pb-world", "publicbank", "PB World Mastercard", "cg-pb-standard"),
  mkCard("pb-vsig", "publicbank", "PB Visa Signature", "cg-pb-standard"),
  mkCard("pb-plat", "publicbank", "PB Platinum Mastercard", "cg-pb-standard"),
  mkCard("pb-quantum-visa", "publicbank", "PB Quantum Visa", "cg-pb-standard"),
  mkCard("pb-quantum-mc", "publicbank", "PB Quantum Mastercard", "cg-pb-standard"),
  mkCard("pb-rcb-gold", "publicbank", "PB RCB Gold", "cg-pb-standard"),
  mkCard("pb-rcb-elite", "publicbank", "PB RCB Elite", "cg-pb-standard"),

  // ---------- Bank Rakyat ----------
  mkCard("rakyat-card", "bankrakyat", "Bank Rakyat credit card (Rakyat Reward Points)", "cg-rakyat"),

  // ---------- Standard Chartered ----------
  mkCard("sc-journey", "sc", "Standard Chartered Journey Credit Card", "cg-sc-journey", { status: "rate_unconfirmed" }),
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

/* -------------------- Card helpers -------------------- */

export function getCardById(id: string): Card | undefined {
  return cards.find((c) => c.id === id);
}

export function getCardsByBank(bankId: string): Card[] {
  return cards
    .filter((c) => c.bankId === bankId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Rewards currency (bank-side) for a given card. Derived from the card group. */
export function getRewardCurrencyForCard(card: Card): { productId: string; currencyName: string } | undefined {
  const group = getCardGroupById(card.cardGroupId);
  const product = group ? getRewardProductById(group.rewardProductId) : undefined;
  if (!product) return undefined;
  return { productId: product.id, currencyName: product.rewardCurrencyName };
}

/** Simple case-insensitive search across name + aliases. Empty query returns all bank cards. */
export function searchCardsInBank(bankId: string, query: string): Card[] {
  const list = getCardsByBank(bankId);
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    return (c.aliases ?? []).some((a) => a.toLowerCase().includes(q));
  });
}
