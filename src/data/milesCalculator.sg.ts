/**
 * Singapore rewards dataset.
 *
 * This file adds Singapore banks, reward currencies, card groups, conversion
 * rules and cards to the SAME engine used by Malaysia. It deliberately
 * contains data only — no calculation logic — so a future country (HK, AU, UK)
 * can be added as another dataset without touching the engine.
 *
 * Modelling contract (identical to Malaysia):
 *   bank -> reward currency (reward product) -> card group -> conversion rule
 *           -> destination loyalty programme
 *
 * Verification is ROUTE SPECIFIC. A rate is never inherited from another card,
 * another partner, another country, or a miles-per-dollar relationship. Routes
 * that are known to exist but whose current ratio is not confirmed are seeded
 * with status "needs_review" so `isRulePublic()` excludes them from every
 * calculation while the UI can still say "transfer supported — rate awaiting
 * verification".
 */
import type {
  Bank,
  Card,
  ConversionRule,
  EligibleCardGroup,
  RewardProduct,
} from "./milesCalculator";

/** Verification date for the Singapore dataset. */
const V = "2026-08-27";

/** Standard Singapore conversion administrative fee, where the bank charges one. */
const SGD_FEE = 27.25;

/* -------------------- Banks -------------------- */

export const sgBanks: Bank[] = [
  { id: "dbs-sg", name: "DBS", slug: "dbs-singapore", country: "SG", active: true, displayOrder: 1, officialRewardsUrl: "https://www.dbs.com.sg/personal/cards/rewards/dbs-points" },
  { id: "uob-sg", name: "UOB Singapore", slug: "uob-singapore", country: "SG", active: true, displayOrder: 2, officialRewardsUrl: "https://www.uob.com.sg/personal/cards/rewards/unidollars.page" },
  { id: "citi-sg", name: "Citi Singapore", slug: "citi-singapore", country: "SG", active: true, displayOrder: 3, officialRewardsUrl: "https://www.citibank.com.sg/credit-cards/rewards/" },
  { id: "hsbc-sg", name: "HSBC Singapore", slug: "hsbc-singapore", country: "SG", active: true, displayOrder: 4, officialRewardsUrl: "https://www.hsbc.com.sg/credit-cards/rewards/" },
  { id: "ocbc-sg", name: "OCBC", slug: "ocbc-singapore", country: "SG", active: true, displayOrder: 5, officialRewardsUrl: "https://www.ocbc.com/personal-banking/cards/rewards" },
  { id: "amex-sg", name: "American Express Singapore", slug: "american-express-singapore", country: "SG", active: true, displayOrder: 6, officialRewardsUrl: "https://www.americanexpress.com/en-sg/rewards/membership-rewards/" },
  { id: "sc-sg", name: "Standard Chartered Singapore", slug: "standard-chartered-singapore", country: "SG", active: true, displayOrder: 7, officialRewardsUrl: "https://www.sc.com/sg/credit-cards/360-rewards/" },
  { id: "maybank-sg", name: "Maybank Singapore", slug: "maybank-singapore", country: "SG", active: true, displayOrder: 8, officialRewardsUrl: "https://www.maybank2u.com.sg/en/personal/cards/rewards.page" },
  { id: "boc-sg", name: "Bank of China Singapore", slug: "bank-of-china-singapore", country: "SG", active: true, displayOrder: 9, officialRewardsUrl: "https://www.bankofchina.com/sg/bocinfo/" },
];

/* -------------------- Reward products (bank-side currencies) -------------------- */

export const sgRewardProducts: RewardProduct[] = [
  { id: "dbs-sg-points", bankId: "dbs-sg", name: "DBS Points", slug: "dbs-points", rewardCurrencyName: "DBS Points", active: true, displayOrder: 1 },

  { id: "uob-sg-unis", bankId: "uob-sg", name: "UNI$ (UNI$ Rewards)", slug: "uob-sg-unis", rewardCurrencyName: "UNI$", active: true, displayOrder: 1 },
  { id: "uob-sg-krisflyer", bankId: "uob-sg", name: "KrisFlyer UOB Credit Card (direct KrisFlyer earn)", slug: "uob-sg-krisflyer", rewardCurrencyName: "KrisFlyer miles", rewardType: "direct_airline_earn", directProgrammeId: "krisflyer", active: true, displayOrder: 2 },

  { id: "citi-sg-typ", bankId: "citi-sg", name: "Citi ThankYou Points", slug: "citi-thankyou-points", rewardCurrencyName: "Citi ThankYou Points", active: true, displayOrder: 1 },
  { id: "citi-sg-miles", bankId: "citi-sg", name: "Citi Miles (PremierMiles)", slug: "citi-miles", rewardCurrencyName: "Citi Miles", active: true, displayOrder: 2 },

  { id: "hsbc-sg-points", bankId: "hsbc-sg", name: "HSBC Reward Points", slug: "hsbc-sg-reward-points", rewardCurrencyName: "HSBC Reward Points", active: true, displayOrder: 1 },

  { id: "ocbc-sg-dollars", bankId: "ocbc-sg", name: "OCBC$", slug: "ocbc-dollars", rewardCurrencyName: "OCBC$", active: true, displayOrder: 1 },
  { id: "ocbc-sg-90n", bankId: "ocbc-sg", name: "90°N Miles", slug: "ocbc-90n-miles", rewardCurrencyName: "90°N Miles", active: true, displayOrder: 2 },
  { id: "ocbc-sg-voyage", bankId: "ocbc-sg", name: "VOYAGE Miles", slug: "ocbc-voyage-miles", rewardCurrencyName: "VOYAGE Miles", active: true, displayOrder: 3 },

  { id: "amex-sg-mr", bankId: "amex-sg", name: "Membership Rewards", slug: "amex-sg-membership-rewards", rewardCurrencyName: "Membership Rewards points", active: true, displayOrder: 1 },

  { id: "sc-sg-360", bankId: "sc-sg", name: "360° Rewards Points", slug: "sc-sg-360-rewards", rewardCurrencyName: "360° Rewards Points", active: true, displayOrder: 1 },

  { id: "maybank-sg-treats", bankId: "maybank-sg", name: "TREATS Points (Singapore)", slug: "maybank-sg-treats-points", rewardCurrencyName: "TREATS Points", active: true, displayOrder: 1 },

  { id: "boc-sg-bonus", bankId: "boc-sg", name: "BOC Bonus Points", slug: "boc-bonus-points", rewardCurrencyName: "BOC Bonus Points", active: true, displayOrder: 1 },
];

/* -------------------- Card groups -------------------- */

export const sgCardGroups: EligibleCardGroup[] = [
  { id: "cg-dbs-sg-points", rewardProductId: "dbs-sg-points", name: "DBS Points cards", eligibleCards: [], active: true, displayOrder: 1 },

  { id: "cg-uob-sg-unis", rewardProductId: "uob-sg-unis", name: "UNI$ Rewards cards", eligibleCards: [], active: true, displayOrder: 1 },
  {
    id: "cg-uob-sg-krisflyer",
    rewardProductId: "uob-sg-krisflyer",
    name: "KrisFlyer UOB Credit Card",
    rewardType: "direct_airline_earn",
    directProgrammeId: "krisflyer",
    eligibleCards: [],
    active: true,
    displayOrder: 2,
  },

  { id: "cg-citi-sg-typ", rewardProductId: "citi-sg-typ", name: "Citi ThankYou Points cards", eligibleCards: [], active: true, displayOrder: 1 },
  { id: "cg-citi-sg-miles", rewardProductId: "citi-sg-miles", name: "Citi Miles cards", eligibleCards: [], active: true, displayOrder: 2 },

  { id: "cg-hsbc-sg-points", rewardProductId: "hsbc-sg-points", name: "HSBC Reward Points cards", eligibleCards: [], active: true, displayOrder: 1 },

  { id: "cg-ocbc-sg-dollars", rewardProductId: "ocbc-sg-dollars", name: "OCBC$ cards", eligibleCards: [], active: true, displayOrder: 1 },
  {
    id: "cg-ocbc-sg-90n",
    rewardProductId: "ocbc-sg-90n",
    name: "90°N Miles cards",
    unverifiedHeadline: "90°N Miles conversion is pending verification",
    unverifiedNotice:
      "90°N Miles is its own OCBC rewards currency. Its current partner conversion rates are pending verification, so Samral does not calculate them. The OCBC$ rate does not apply here.",
    eligibleCards: [],
    active: true,
    displayOrder: 2,
  },
  { id: "cg-ocbc-sg-voyage", rewardProductId: "ocbc-sg-voyage", name: "VOYAGE Miles cards", eligibleCards: [], active: true, displayOrder: 3 },

  { id: "cg-amex-sg-platinum", rewardProductId: "amex-sg-mr", name: "The Platinum Card (500 MR → 250 miles)", eligibleCards: [], active: true, displayOrder: 1 },
  { id: "cg-amex-sg-standard", rewardProductId: "amex-sg-mr", name: "Other eligible Membership Rewards card (550 MR → 250 miles)", eligibleCards: [], active: true, displayOrder: 2 },

  { id: "cg-sc-sg-360", rewardProductId: "sc-sg-360", name: "360° Rewards Points cards", eligibleCards: [], active: true, displayOrder: 1 },

  {
    id: "cg-maybank-sg-treats",
    rewardProductId: "maybank-sg-treats",
    name: "TREATS Points cards (Singapore)",
    unverifiedHeadline: "Current transfer rate is awaiting verification",
    unverifiedNotice:
      "Maybank Singapore TREATS Points can be redeemed for airline miles, but the exact current transfer block for each programme is awaiting verification. Samral does not estimate a rate. Malaysian Maybank TreatsPoints rules do not apply to Singapore.",
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },

  { id: "cg-boc-sg-elite", rewardProductId: "boc-sg-bonus", name: "BOC Elite Miles World Mastercard (50,000 → 10,000)", eligibleCards: [], active: true, displayOrder: 1 },
  { id: "cg-boc-sg-standard", rewardProductId: "boc-sg-bonus", name: "Other eligible BOC rewards card (60,000 → 10,000)", eligibleCards: [], active: true, displayOrder: 2 },
];

/* -------------------- Rule helper -------------------- */

type SgExtra = Partial<ConversionRule> & { sourceUrl: string; sourceTitle: string };

function sgRule(
  id: string,
  cg: string,
  prog: string,
  block: [number, number],
  extra: SgExtra,
): ConversionRule {
  return {
    id,
    eligibleCardGroupId: cg,
    loyaltyProgrammeId: prog,
    bankPointsPerBlock: block[0],
    partnerPointsPerBlock: block[1],
    verifiedOn: V,
    verifiedAt: V,
    sourceType: "official_bank",
    status: "verified",
    active: true,
    ...extra,
    sourceName: extra.sourceName ?? extra.sourceTitle,
  };
}

/** A route the issuer supports but whose current ratio Samral has not verified. */
function sgUnverifiedRule(id: string, cg: string, prog: string, extra: SgExtra): ConversionRule {
  return sgRule(id, cg, prog, [0, 0], {
    ...extra,
    status: "needs_review",
    notes:
      extra.notes ??
      "Transfer supported — current conversion rate awaiting verification. Not included in any calculation.",
  });
}

/* -------------------- Source metadata -------------------- */

const DBS_SRC = { sourceUrl: "https://www.dbs.com.sg/personal/cards/rewards/dbs-points", sourceTitle: "DBS Points conversion to airline partners", sourcePublisher: "DBS Bank Ltd" };
const UOB_SRC = { sourceUrl: "https://www.uob.com.sg/personal/cards/rewards/unidollars.page", sourceTitle: "UOB Singapore UNI$ Rewards", sourcePublisher: "United Overseas Bank Limited" };
const CITI_TYP_SRC = { sourceUrl: "https://www.citibank.com.sg/credit-cards/rewards/thankyou-rewards/", sourceTitle: "Citi ThankYou Rewards air mile transfers", sourcePublisher: "Citibank Singapore Limited" };
const CITI_MILES_SRC = { sourceUrl: "https://www.citibank.com.sg/credit-cards/rewards/citi-miles/", sourceTitle: "Citi Miles air mile transfers", sourcePublisher: "Citibank Singapore Limited" };
const HSBC_SRC = { sourceUrl: "https://www.hsbc.com.sg/credit-cards/rewards/", sourceTitle: "HSBC Singapore Rewards air mile conversion", sourcePublisher: "HSBC Bank (Singapore) Limited" };
const OCBC_SRC = { sourceUrl: "https://www.ocbc.com/personal-banking/cards/rewards", sourceTitle: "OCBC Rewards conversion partners", sourcePublisher: "Oversea-Chinese Banking Corporation Limited" };
const OCBC_VOYAGE_SRC = { sourceUrl: "https://www.ocbc.com/personal-banking/cards/voyage-card", sourceTitle: "OCBC VOYAGE Miles conversion", sourcePublisher: "Oversea-Chinese Banking Corporation Limited" };
const AMEX_SRC = { sourceUrl: "https://www.americanexpress.com/en-sg/rewards/membership-rewards/", sourceTitle: "Membership Rewards points transfer partners (Singapore)", sourcePublisher: "American Express International, Inc." };
const SC_SRC = { sourceUrl: "https://www.sc.com/sg/credit-cards/360-rewards/", sourceTitle: "360° Rewards Points redemption for KrisFlyer miles", sourcePublisher: "Standard Chartered Bank (Singapore) Limited" };
const MBB_SG_SRC = { sourceUrl: "https://www.maybank2u.com.sg/en/personal/cards/rewards.page", sourceTitle: "Maybank Singapore TREATS Points rewards", sourcePublisher: "Maybank Singapore Limited" };
const BOC_SRC = { sourceUrl: "https://www.bankofchina.com/sg/bocinfo/", sourceTitle: "Bank of China Singapore Bonus Points redemption", sourcePublisher: "Bank of China Limited, Singapore Branch" };

const FEE = { transferFeeAmount: SGD_FEE, transferFeeCurrency: "SGD" as const };
/** UOB Singapore charges S$27 per UNI$ mileage conversion. The fee is waived
 * for UOB Reserve, UOB Privilege Reserve, UOB Solitaire Metal Card, UOB
 * Privilege Banking and UOB Lady's Solitaire cardmembers. */
const UOB_FEE = { transferFeeAmount: 27, transferFeeCurrency: "SGD" as const };
const UOB_FEE_NOTE =
  "A S$27 administrative fee applies per conversion. The fee is waived for UOB Reserve, UOB Privilege Reserve, UOB Solitaire Metal Card, UOB Privilege Banking and UOB Lady's Solitaire cardmembers.";

/** Citi partners sharing one published transfer schedule per currency. */
const CITI_PARTNERS: [string, string][] = [
  ["krisflyer", "krisflyer"],
  ["asia-miles", "asia-miles"],
  ["ba", "ba"],
  ["qatar", "qatar"],
  ["etihad", "etihad"],
  ["eva", "eva"],
  ["flying-blue", "flying-blue"],
  ["qantas", "qantas"],
  ["rop", "rop"],
  ["turkish", "turkish"],
  ["ihg", "ihg"],
];

/** Amex Singapore standard airline group (rates effective 23 February 2026). */
const AMEX_PARTNERS = ["ba", "asia-miles", "eva", "enrich", "qantas", "krisflyer", "rop"];
const AMEX_EFF = "2026-02-23";

/* -------------------- Conversion rules -------------------- */

export const sgConversionRules: ConversionRule[] = [
  /* ---- DBS Points ---- */
  sgRule("sg-dbs-krisflyer", "cg-dbs-sg-points", "krisflyer", [5000, 10000], { ...DBS_SRC, ...FEE }),
  sgRule("sg-dbs-asia-miles", "cg-dbs-sg-points", "asia-miles", [5000, 10000], { ...DBS_SRC, ...FEE }),
  sgRule("sg-dbs-qantas", "cg-dbs-sg-points", "qantas", [5000, 10000], { ...DBS_SRC, ...FEE }),
  sgRule("sg-dbs-airasia", "cg-dbs-sg-points", "airasia", [500, 1500], {
    ...DBS_SRC,
    ...FEE,
    effectiveFrom: "2026-03-01",
    notes:
      "The temporary administrative fee waiver ended on 28 February 2026. From 1 March 2026 the standard S$27.25 fee applies to airasia rewards conversions.",
  }),

  /* ---- UOB UNI$ ---- */
  sgRule("sg-uob-krisflyer", "cg-uob-sg-unis", "krisflyer", [5000, 10000], { ...UOB_SRC, ...UOB_FEE, notes: UOB_FEE_NOTE }),
  sgRule("sg-uob-asia-miles", "cg-uob-sg-unis", "asia-miles", [5000, 10000], { ...UOB_SRC, ...UOB_FEE, notes: UOB_FEE_NOTE }),

  /* ---- Citi ThankYou Points (25,000 → 10,000) ---- */
  ...CITI_PARTNERS.map(([key, prog]) =>
    sgRule(`sg-citi-typ-${key}`, "cg-citi-sg-typ", prog, [25000, 10000], { ...CITI_TYP_SRC }),
  ),

  /* ---- Citi Miles (10,000 → 10,000) ---- */
  ...CITI_PARTNERS.map(([key, prog]) =>
    sgRule(`sg-citi-miles-${key}`, "cg-citi-sg-miles", prog, [10000, 10000], { ...CITI_MILES_SRC }),
  ),

  /* ---- HSBC Reward Points — every route stored independently ---- */
  sgRule("sg-hsbc-flying-blue", "cg-hsbc-sg-points", "flying-blue", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-airasia", "cg-hsbc-sg-points", "airasia", [25000, 20000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-aeroplan", "cg-hsbc-sg-points", "aeroplan", [35000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-ba", "cg-hsbc-sg-points", "ba", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-asia-miles", "cg-hsbc-sg-points", "asia-miles", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-etihad", "cg-hsbc-sg-points", "etihad", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-eva", "cg-hsbc-sg-points", "eva", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-fortune-wings", "cg-hsbc-sg-points", "fortune-wings", [35000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-jal", "cg-hsbc-sg-points", "jal", [50000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-qantas", "cg-hsbc-sg-points", "qantas", [25000, 10000], { ...HSBC_SRC }),
  sgRule("sg-hsbc-krisflyer", "cg-hsbc-sg-points", "krisflyer", [30000, 10000], { ...HSBC_SRC }),
  // Supported partners whose current ratio is not in the verified dataset.
  sgUnverifiedRule("sg-hsbc-qatar", "cg-hsbc-sg-points", "qatar", { ...HSBC_SRC }),
  sgUnverifiedRule("sg-hsbc-rop", "cg-hsbc-sg-points", "rop", { ...HSBC_SRC }),
  sgUnverifiedRule("sg-hsbc-turkish", "cg-hsbc-sg-points", "turkish", { ...HSBC_SRC }),
  sgUnverifiedRule("sg-hsbc-united", "cg-hsbc-sg-points", "united", { ...HSBC_SRC }),
  sgUnverifiedRule("sg-hsbc-vietnam", "cg-hsbc-sg-points", "vietnam", { ...HSBC_SRC }),
  sgUnverifiedRule("sg-hsbc-marriott", "cg-hsbc-sg-points", "marriott", { ...HSBC_SRC }),

  /* ---- OCBC$ ---- */
  sgRule("sg-ocbc-krisflyer", "cg-ocbc-sg-dollars", "krisflyer", [25000, 10000], { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-flying-blue", "cg-ocbc-sg-dollars", "flying-blue", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-ba", "cg-ocbc-sg-dollars", "ba", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-etihad", "cg-ocbc-sg-dollars", "etihad", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-asia-miles", "cg-ocbc-sg-dollars", "asia-miles", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-united", "cg-ocbc-sg-dollars", "united", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-accor", "cg-ocbc-sg-dollars", "accor", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-ihg", "cg-ocbc-sg-dollars", "ihg", { ...OCBC_SRC }),
  sgUnverifiedRule("sg-ocbc-marriott", "cg-ocbc-sg-dollars", "marriott", { ...OCBC_SRC }),

  /* ---- OCBC VOYAGE Miles (1:1) ---- */
  sgRule("sg-ocbc-voyage-krisflyer", "cg-ocbc-sg-voyage", "krisflyer", [1, 1], { ...OCBC_VOYAGE_SRC }),

  /* ---- American Express — The Platinum Card (500 → 250) ---- */
  ...AMEX_PARTNERS.map((prog) =>
    sgRule(`sg-amex-plat-${prog}`, "cg-amex-sg-platinum", prog, [500, 250], {
      ...AMEX_SRC,
      effectiveFrom: AMEX_EFF,
    }),
  ),
  /* ---- American Express — other eligible MR cards (550 → 250) ---- */
  ...AMEX_PARTNERS.map((prog) =>
    sgRule(`sg-amex-std-${prog}`, "cg-amex-sg-standard", prog, [550, 250], {
      ...AMEX_SRC,
      effectiveFrom: AMEX_EFF,
    }),
  ),
  /* Emirates Skywards conversion is suspended until further notice. */
  sgRule("sg-amex-plat-emirates", "cg-amex-sg-platinum", "emirates", [600, 250], {
    ...AMEX_SRC,
    effectiveFrom: AMEX_EFF,
    status: "temporarily_unavailable",
    notes: "American Express states that conversion to Emirates Skywards is unavailable until further notice.",
  }),
  sgRule("sg-amex-std-emirates", "cg-amex-sg-standard", "emirates", [650, 250], {
    ...AMEX_SRC,
    effectiveFrom: AMEX_EFF,
    status: "temporarily_unavailable",
    notes: "American Express states that conversion to Emirates Skywards is unavailable until further notice.",
  }),

  /* ---- Standard Chartered 360° Rewards ---- */
  sgRule("sg-sc-krisflyer", "cg-sc-sg-360", "krisflyer", [25000, 10000], { ...SC_SRC, ...FEE }),

  /* ---- Maybank Singapore TREATS Points — awaiting verification ---- */
  sgUnverifiedRule("sg-mbb-krisflyer", "cg-maybank-sg-treats", "krisflyer", { ...MBB_SG_SRC }),
  sgUnverifiedRule("sg-mbb-asia-miles", "cg-maybank-sg-treats", "asia-miles", { ...MBB_SG_SRC }),
  sgUnverifiedRule("sg-mbb-enrich", "cg-maybank-sg-treats", "enrich", { ...MBB_SG_SRC }),
  sgUnverifiedRule("sg-mbb-airasia", "cg-maybank-sg-treats", "airasia", { ...MBB_SG_SRC }),

  /* ---- Bank of China Singapore ---- */
  sgRule("sg-boc-elite-krisflyer", "cg-boc-sg-elite", "krisflyer", [50000, 10000], { ...BOC_SRC }),
  sgRule("sg-boc-std-krisflyer", "cg-boc-sg-standard", "krisflyer", [60000, 10000], { ...BOC_SRC }),
];

/* -------------------- Cards -------------------- */

const card = (
  id: string,
  bankId: string,
  name: string,
  cardGroupId: string,
  extra: Partial<Card> = {},
): Card => ({
  id,
  bankId,
  name,
  cardGroupId,
  status: "active",
  lastVerifiedDate: V,
  ...extra,
});

export const sgCards: Card[] = [
  // DBS
  card("sg-dbs-altitude-visa", "dbs-sg", "DBS Altitude Visa Signature Card", "cg-dbs-sg-points"),
  card("sg-dbs-altitude-amex", "dbs-sg", "DBS Altitude American Express Card", "cg-dbs-sg-points"),
  card("sg-dbs-vantage", "dbs-sg", "DBS Vantage Visa Infinite Card", "cg-dbs-sg-points"),
  card("sg-dbs-womans-world", "dbs-sg", "DBS Woman's World Card", "cg-dbs-sg-points"),
  card("sg-dbs-womans", "dbs-sg", "DBS Woman's Card", "cg-dbs-sg-points"),
  card("sg-dbs-insignia", "dbs-sg", "DBS Insignia Visa Infinite Card", "cg-dbs-sg-points"),

  // UOB
  card("sg-uob-prvi-visa", "uob-sg", "UOB PRVI Miles Visa Card", "cg-uob-sg-unis"),
  card("sg-uob-prvi-amex", "uob-sg", "UOB PRVI Miles American Express Card", "cg-uob-sg-unis"),
  card("sg-uob-prvi-mc", "uob-sg", "UOB PRVI Miles Mastercard", "cg-uob-sg-unis"),
  card("sg-uob-visa-signature", "uob-sg", "UOB Visa Signature Card", "cg-uob-sg-unis"),
  card("sg-uob-ladys", "uob-sg", "UOB Lady's Card", "cg-uob-sg-unis"),
  card("sg-uob-ladys-solitaire", "uob-sg", "UOB Lady's Solitaire Card", "cg-uob-sg-unis"),
  card("sg-uob-preferred-platinum", "uob-sg", "UOB Preferred Platinum Visa Card", "cg-uob-sg-unis"),
  card("sg-uob-krisflyer", "uob-sg", "KrisFlyer UOB Credit Card", "cg-uob-sg-krisflyer", {
    status: "direct_airline",
    subtitle: "Earns KrisFlyer miles directly",
  }),

  // Citi
  card("sg-citi-rewards", "citi-sg", "Citi Rewards Card", "cg-citi-sg-typ"),
  card("sg-citi-prestige", "citi-sg", "Citi Prestige Card", "cg-citi-sg-typ"),
  card("sg-citi-thankyou", "citi-sg", "Citi ThankYou Preferred Card", "cg-citi-sg-typ"),
  card("sg-citi-premiermiles", "citi-sg", "Citi PremierMiles Card", "cg-citi-sg-miles", { aliases: ["Premier Miles"] }),

  // HSBC
  card("sg-hsbc-revolution", "hsbc-sg", "HSBC Revolution Credit Card", "cg-hsbc-sg-points"),
  card("sg-hsbc-travelone", "hsbc-sg", "HSBC TravelOne Credit Card", "cg-hsbc-sg-points"),
  card("sg-hsbc-visa-infinite", "hsbc-sg", "HSBC Visa Infinite Credit Card", "cg-hsbc-sg-points"),
  card("sg-hsbc-premier-mc", "hsbc-sg", "HSBC Premier Mastercard Credit Card", "cg-hsbc-sg-points"),
  card("sg-hsbc-advance", "hsbc-sg", "HSBC Advance Credit Card", "cg-hsbc-sg-points"),

  // OCBC
  card("sg-ocbc-rewards", "ocbc-sg", "OCBC Rewards Card", "cg-ocbc-sg-dollars"),
  card("sg-ocbc-titanium", "ocbc-sg", "OCBC Titanium Rewards Card", "cg-ocbc-sg-dollars"),
  card("sg-ocbc-90n", "ocbc-sg", "OCBC 90°N Card", "cg-ocbc-sg-90n", {
    status: "rate_pending_verification",
    subtitle: "Earns 90°N Miles",
  }),
  card("sg-ocbc-voyage", "ocbc-sg", "OCBC VOYAGE Card", "cg-ocbc-sg-voyage", { subtitle: "Earns VOYAGE Miles" }),

  // American Express
  card("sg-amex-platinum-charge", "amex-sg", "The American Express Platinum Card", "cg-amex-sg-platinum", {
    subtitle: "Charge card",
    aliases: ["Platinum Charge"],
  }),
  card("sg-amex-platinum-credit", "amex-sg", "American Express Platinum Credit Card", "cg-amex-sg-standard"),
  card("sg-amex-platinum-reserve", "amex-sg", "American Express Platinum Reserve Credit Card", "cg-amex-sg-standard"),
  card("sg-amex-rewards", "amex-sg", "American Express Rewards Card", "cg-amex-sg-standard", {
    subtitle: "A card-specific transfer fee applies to this product",
  }),

  // Standard Chartered
  card("sg-sc-journey", "sc-sg", "Standard Chartered Journey Credit Card", "cg-sc-sg-360"),
  card("sg-sc-visa-infinite", "sc-sg", "Standard Chartered Visa Infinite Credit Card", "cg-sc-sg-360"),
  card("sg-sc-pb-visa-infinite", "sc-sg", "Standard Chartered Priority Banking Visa Infinite Credit Card", "cg-sc-sg-360"),

  // Maybank Singapore
  card("sg-mbb-horizon", "maybank-sg", "Maybank Horizon Visa Signature Card", "cg-maybank-sg-treats", { status: "rate_pending_verification" }),
  card("sg-mbb-world-mc", "maybank-sg", "Maybank World Mastercard", "cg-maybank-sg-treats", { status: "rate_pending_verification" }),
  card("sg-mbb-visa-infinite", "maybank-sg", "Maybank Visa Infinite Card", "cg-maybank-sg-treats", { status: "rate_pending_verification" }),

  // Bank of China
  card("sg-boc-elite-miles", "boc-sg", "BOC Elite Miles World Mastercard", "cg-boc-sg-elite"),
  card("sg-boc-other", "boc-sg", "Other eligible BOC rewards card", "cg-boc-sg-standard"),
];
