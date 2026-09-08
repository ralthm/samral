/**
 * Hong Kong rewards dataset.
 *
 * Same modelling contract as Malaysia and Singapore:
 *   bank -> reward currency (reward product) -> card group -> conversion rule
 *           -> destination loyalty programme
 *
 * Every value in this file comes from the verified Hong Kong launch brief.
 * Nothing is inferred: where an issuer does not publish a minimum, increment,
 * fee or processing time, the field is left unset and the caveat is written
 * into `notes` so the UI can say "Confirm with bank before transferring"
 * instead of showing an invented number.
 *
 * Deliberate exclusions:
 * - Standard Chartered Cathay Mastercard and other direct Asia Miles earners
 *   are NOT modelled as transferable bank-point currencies.
 * - Emirates Skywards is not seeded for American Express Hong Kong: Amex
 *   states transfers/registration are unavailable until further notice.
 * - Only the HSBC EveryMile Credit Card is seeded for HSBC RewardCash. Other
 *   RewardCash cards can carry different rates and partner eligibility.
 */
import type {
  Bank,
  Card,
  ConversionRule,
  EligibleCardGroup,
  RewardProduct,
} from "./milesCalculator";

/** Verification date for the Hong Kong dataset. */
const V = "2026-09-08";

const CONFIRM = "Confirm with bank before transferring.";

/* -------------------- Banks -------------------- */

export const hkBanks: Bank[] = [
  { id: "hsbc-hk", name: "HSBC Hong Kong", slug: "hsbc-hong-kong", country: "HK", active: true, displayOrder: 1, officialRewardsUrl: "https://www.hsbc.com.hk/credit-cards/products/everymile/" },
  { id: "amex-hk", name: "American Express Hong Kong", slug: "american-express-hong-kong", country: "HK", active: true, displayOrder: 2, officialRewardsUrl: "https://www.americanexpress.com/en-hk/rewards/membership-rewards/travel/all" },
  { id: "citi-hk", name: "Citi Hong Kong", slug: "citi-hong-kong", country: "HK", active: true, displayOrder: 3, officialRewardsUrl: "https://www.citibank.com.hk/english/credit-cards/thankyou-rewards/" },
  { id: "dbs-hk", name: "DBS Hong Kong", slug: "dbs-hong-kong", country: "HK", active: true, displayOrder: 4, officialRewardsUrl: "https://www.dbs.com.hk/personal/credit-cards/rewards/dbs-mileage" },
  { id: "sc-hk", name: "Standard Chartered Hong Kong", slug: "standard-chartered-hong-kong", country: "HK", active: true, displayOrder: 5, officialRewardsUrl: "https://www.sc.com/hk/credit-cards/360rewards/" },
  { id: "bea-hk", name: "BEA", slug: "bea-hong-kong", country: "HK", active: true, displayOrder: 6, officialRewardsUrl: "https://www.hkbea.com/html/en/bea-rewards.html" },
  { id: "boc-hk", name: "Bank of China (Hong Kong)", slug: "bank-of-china-hong-kong", country: "HK", active: true, displayOrder: 7, officialRewardsUrl: "https://www.bochk.com/en/creditcard/rewards/mileage.html" },
];

/* -------------------- Reward products (bank-side currencies) -------------------- */

export const hkRewardProducts: RewardProduct[] = [
  { id: "hsbc-hk-rc", bankId: "hsbc-hk", name: "HSBC RewardCash", slug: "hsbc-hk-rewardcash", rewardCurrencyName: "HSBC RewardCash", active: true, displayOrder: 1 },
  { id: "amex-hk-mr", bankId: "amex-hk", name: "Membership Rewards", slug: "amex-hk-membership-rewards", rewardCurrencyName: "Membership Rewards points", active: true, displayOrder: 1 },
  { id: "citi-hk-points", bankId: "citi-hk", name: "Citi Points", slug: "citi-hk-points", rewardCurrencyName: "Citi Points", active: true, displayOrder: 1 },
  { id: "dbs-hk-dollars", bankId: "dbs-hk", name: "DBS$", slug: "dbs-hk-dollars", rewardCurrencyName: "DBS$", active: true, displayOrder: 1 },
  { id: "sc-hk-360", bankId: "sc-hk", name: "360° Rewards Points", slug: "sc-hk-360-rewards", rewardCurrencyName: "360° Rewards Points", active: true, displayOrder: 1 },
  { id: "bea-hk-bonus", bankId: "bea-hk", name: "BEA Bonus Points", slug: "bea-hk-bonus-points", rewardCurrencyName: "BEA Bonus Points", active: true, displayOrder: 1 },
  { id: "boc-hk-gift", bankId: "boc-hk", name: "BOCHK Gift Points", slug: "boc-hk-gift-points", rewardCurrencyName: "BOCHK Gift Points", active: true, displayOrder: 1 },
];

/* -------------------- Processing notes -------------------- */

const HSBC_TIME =
  "Instant for most programmes. The British Airways Club Avios, EVA Air Infinity MileageLands, Singapore Airlines KrisFlyer and Fortune Wings Club may take up to 2 weeks.";
const AMEX_AIR_TIME =
  "About 48 hours for Cathay, Qantas, British Airways and Virgin Atlantic. Up to 10 days for Enrich and EVA Air. Up to 15 days for KrisFlyer.";
const AMEX_HOTEL_TIME = "About 24 hours for ALL Accor. About 48 hours for Hilton Honors and Marriott Bonvoy.";
const CITI_TIME =
  "Cathay instant. Most other programmes about 5 working days. KrisFlyer, Etihad Guest and Thai Royal Orchid Plus up to 14 working days.";
const DBS_TIME =
  "Asia Miles is instant when the membership details are correct. Avios and KrisFlyer take about 3–8 working days.";
const BEA_TIME = "Instant via BEA Mall when the loyalty account details are valid.";
const BOC_TIME = "Up to 2 to 3 weeks.";

/* -------------------- Card groups -------------------- */

export const hkCardGroups: EligibleCardGroup[] = [
  {
    id: "cg-hsbc-hk-everymile",
    rewardProductId: "hsbc-hk-rc",
    name: "HSBC EveryMile Credit Card (HK$1 RewardCash → 20 miles/points)",
    description:
      "Only the EveryMile Credit Card is covered at launch. Other HSBC RewardCash cards can carry a different rate and different partner eligibility.",
    processingNotes: [HSBC_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-amex-hk-turbo",
    rewardProductId: "amex-hk-mr",
    name: "Eligible Membership Rewards card enrolled in Turbo",
    processingNotes: [AMEX_AIR_TIME, AMEX_HOTEL_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-citi-hk-premium",
    rewardProductId: "citi-hk-points",
    name: "Citi ULTIMA / Prestige / PremierMiles (12 Citi Points → 1)",
    processingNotes: [CITI_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-citi-hk-standard",
    rewardProductId: "citi-hk-points",
    name: "Citi Plus / Rewards / HKTVmall / Gold / Classic (15 Citi Points → 1)",
    processingNotes: [CITI_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 2,
  },
  {
    id: "cg-dbs-hk-black-world",
    rewardProductId: "dbs-hk-dollars",
    name: "DBS Black World Mastercard (DBS$48 → 1,000 miles)",
    processingNotes: [DBS_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-dbs-hk-black-amex",
    rewardProductId: "dbs-hk-dollars",
    name: "DBS Black American Express / other eligible DBS cards (DBS$72 → 1,000 miles)",
    processingNotes: [DBS_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 2,
  },
  {
    id: "cg-dbs-hk-compass",
    rewardProductId: "dbs-hk-dollars",
    name: "DBS COMPASS VISA (DBS$100 → 1,000 miles)",
    processingNotes: [DBS_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 3,
  },
  {
    id: "cg-dbs-hk-phoenixmiles",
    rewardProductId: "dbs-hk-dollars",
    name: "Air China PhoenixMiles conversion — eligible DBS mileage cards (DBS$32 → 1,000 miles)",
    description:
      "The cited page publishes this ratio for eligible DBS mileage cards without separating card tiers. Fee and processing time are not published for this route.",
    eligibleCards: [],
    active: true,
    displayOrder: 4,
  },
  {
    id: "cg-sc-hk-360",
    rewardProductId: "sc-hk-360",
    name: "Eligible 360° Rewards cards (25,000 points → 1,000 Asia Miles)",
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-bea-hk-mileage",
    rewardProductId: "bea-hk-bonus",
    name: "BEA CENTENNIAL World Elite Mastercard / BEA World Mastercard registered for Mileage Reward",
    processingNotes: [BEA_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-boc-hk-gift",
    rewardProductId: "boc-hk-gift",
    name: "Eligible BOCHK credit card in the Gift Point Rewards Programme",
    description:
      "Gift Points earned on eligible Hong Kong-issued BOC credit cards. Certain card types are excluded under BOCHK's programme terms.",
    processingNotes: [BOC_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 1,
  },
  {
    id: "cg-boc-hk-gift-waived",
    rewardProductId: "boc-hk-gift",
    name: "BOC Private Card / BOC Cheers Card (no mileage handling fee)",
    processingNotes: [BOC_TIME],
    eligibleCards: [],
    active: true,
    displayOrder: 2,
  },
];

/* -------------------- Rule helper -------------------- */

type HkExtra = Partial<ConversionRule> & { sourceUrl: string; sourceTitle: string };

function hkRule(
  id: string,
  cg: string,
  prog: string,
  block: [number, number],
  extra: HkExtra,
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

/* -------------------- Source metadata -------------------- */

const HSBC_SRC = {
  sourceUrl: "https://www.hsbc.com.hk/credit-cards/products/everymile/",
  sourceTitle: "HSBC EveryMile Credit Card — RewardCash conversion partners",
  sourcePublisher: "The Hongkong and Shanghai Banking Corporation Limited",
};
const AMEX_SRC = {
  sourceUrl: "https://www.americanexpress.com/en-hk/rewards/membership-rewards/travel/all",
  sourceTitle: "Membership Rewards transfer partners and ratios (Hong Kong)",
  sourcePublisher: "American Express International, Inc.",
};
const CITI_SRC = {
  sourceUrl: "https://www.citibank.com.hk/english/credit-cards/thankyou-rewards/",
  sourceTitle: "Citi Hong Kong ThankYou Rewards — mileage transfer partners",
  sourcePublisher: "Citibank (Hong Kong) Limited",
};
const DBS_SRC = {
  sourceUrl: "https://www.dbs.com.hk/personal/credit-cards/rewards/dbs-mileage",
  sourceTitle: "DBS Hong Kong Flying Miles Redemption",
  sourcePublisher: "DBS Bank (Hong Kong) Limited",
};
const SC_SRC = {
  sourceUrl: "https://www.sc.com/hk/credit-cards/360rewards/",
  sourceTitle: "Standard Chartered Hong Kong 360° Rewards redemption",
  sourcePublisher: "Standard Chartered Bank (Hong Kong) Limited",
};
const BEA_SRC = {
  sourceUrl: "https://www.hkbea.com/html/en/bea-rewards.html",
  sourceTitle: "BEA Rewards Redemption Program — Mileage Reward",
  sourcePublisher: "The Bank of East Asia, Limited",
};

const BOC_SRC = {
  sourceUrl: "https://www.bochk.com/en/creditcard/rewards/mileage.html",
  sourceTitle: "Bank of China (Hong Kong) Mileage Awards — Gift Point conversion",
  sourcePublisher: "Bank of China (Hong Kong) Limited",
};

const HKD = "HKD" as const;

/* -------------------- Partner lists -------------------- */

/** Every partner published on the cited HSBC EveryMile page. */
const HSBC_PARTNERS = [
  "aeroplan",
  "asia-miles",
  "ba",
  "etihad",
  "emirates",
  "finnair",
  "flying-blue",
  "eva",
  "vietnam",
  "turkish",
  "qantas",
  "qatar",
  "krisflyer",
  "china-southern",
  "fortune-wings",
  "accor",
  "ihg",
  "marriott",
  "hilton",
];

/** Amex Hong Kong air-mile partners. Emirates is deliberately excluded. */
const AMEX_AIR_PARTNERS = ["asia-miles", "enrich", "eva", "qantas", "krisflyer", "ba", "virgin-atlantic"];

/** Citi Hong Kong partners sharing one published transfer schedule. */
const CITI_PARTNERS = [
  "ba",
  "asia-miles",
  "etihad",
  "eva",
  "flying-blue",
  "ihg",
  "qantas",
  "qatar",
  "krisflyer",
  "rop",
  "virgin-atlantic",
];

const DBS_PARTNERS = ["asia-miles", "ba", "krisflyer"];

/* -------------------- Notes -------------------- */

const HSBC_NOTE = `HK$1 RewardCash converts to 20 miles or points. HSBC does not publish a minimum or increment for this route on the cited EveryMile page, and no conversion fee is stated there. ${CONFIRM}`;
const AMEX_AIR_NOTE =
  "Minimum 18,000 Membership Rewards points, then increments of 9,000 points. An HK$400 air-mile conversion administrative fee generally applies; American Express lists exemptions including Centurion, Explorer, Gold Corporate and Corporate Cards.";
const AMEX_HOTEL_NOTE =
  "No air-mile conversion fee applies to hotel transfers. Route-specific official terms apply.";
const CITI_PREMIUM_NOTE = `Minimum 18,000 Citi Points, in multiples of 18,000. Citi ULTIMA is fee-exempt. Citi's current published pages conflict on whether Prestige and PremierMiles pay the HK$200 transfer fee, so Samral does not state a fee for this group. ${CONFIRM}`;
const CITI_STANDARD_NOTE =
  "Minimum 18,000 Citi Points, in multiples of 18,000. An HK$200 fee applies per transfer redemption.";
const DBS_UNIT_NOTE = "Conversions are made in whole 1,000-mile units.";
const DBS_BLACK_WORLD_NOTE = `${DBS_UNIT_NOTE} The handling fee is waived for this card.`;
const DBS_BLACK_AMEX_NOTE = `${DBS_UNIT_NOTE} The fee is waived on the DBS Black American Express Card. Other eligible DBS cards are charged HK$100 per 5,000 miles or part thereof, so Samral does not show a single flat fee for this group. ${CONFIRM}`;
const DBS_COMPASS_NOTE = `${DBS_UNIT_NOTE} A handling fee of HK$100 per 5,000 miles or part thereof applies, so the cash cost depends on how many miles are converted. ${CONFIRM}`;
const DBS_PHOENIX_NOTE = `${DBS_UNIT_NOTE} The cited page does not publish a handling fee or processing time for this route. ${CONFIRM}`;
const SC_NOTE = `25,000 360° Rewards Points convert to 1,000 Asia Miles, in whole 25,000-point blocks. The public redemption page does not clearly state a fee or a processing time. ${CONFIRM}`;
const BOC_FEE_NOTE =
  "Handling fee is HK$50 for every 5,000 miles or part thereof, with a minimum of HK$100 and a maximum of HK$300 per transaction. The fee shown is calculated from the miles you would actually convert.";
const BOC_AM_NOTE = `15 Gift Points convert to 1 Asia Mile. First transfer is 15,000 Gift Points (1,000 Asia Miles), then increments of 7,500 Gift Points (500 Asia Miles). ${BOC_FEE_NOTE}`;
const BOC_AM_WAIVED_NOTE =
  "15 Gift Points convert to 1 Asia Mile. First transfer is 15,000 Gift Points (1,000 Asia Miles), then increments of 7,500 Gift Points (500 Asia Miles). No mileage-redemption handling fee applies to the BOC Private Card and BOC Cheers Card.";
const BOC_PM_NOTE = `8 Gift Points convert to 1 PhoenixMiles km. First transfer is 8,000 Gift Points (1,000 km), then increments of 4,000 Gift Points (500 km). ${BOC_FEE_NOTE}`;
const BOC_PM_WAIVED_NOTE =
  "8 Gift Points convert to 1 PhoenixMiles km. First transfer is 8,000 Gift Points (1,000 km), then increments of 4,000 Gift Points (500 km). No mileage-redemption handling fee applies to the BOC Private Card and BOC Cheers Card.";
const BEA_NOTE =
  "Minimum 50,000 Bonus Points (5,000 Asia Miles), then multiples of 10,000 Bonus Points. A fee of HK$300 applies per conversion.";

/* -------------------- Conversion rules -------------------- */

export const hkConversionRules: ConversionRule[] = [
  /* ---- HSBC EveryMile — HK$1 RewardCash = 20 miles/points ---- */
  ...HSBC_PARTNERS.map((prog) =>
    hkRule(`hk-hsbc-everymile-${prog}`, "cg-hsbc-hk-everymile", prog, [1, 20], {
      ...HSBC_SRC,
      notes: HSBC_NOTE,
      processingTime: HSBC_TIME,
    }),
  ),

  /* ---- American Express — air miles (18,000 min, 9,000 increments) ---- */
  ...AMEX_AIR_PARTNERS.map((prog) =>
    hkRule(`hk-amex-${prog}`, "cg-amex-hk-turbo", prog, [9000, 500], {
      ...AMEX_SRC,
      minimumBankPointsPerTransfer: 18000,
      transferFeeAmount: 400,
      transferFeeCurrency: HKD,
      notes: AMEX_AIR_NOTE,
      processingTime: AMEX_AIR_TIME,
    }),
  ),
  /* ---- American Express — hotel partners ---- */
  hkRule("hk-amex-accor", "cg-amex-hk-turbo", "accor", [12500, 500], {
    ...AMEX_SRC,
    minimumBankPointsPerTransfer: 25000,
    notes: `25 Membership Rewards points convert to 1 ALL Accor point. Minimum 25,000 points, then increments of 12,500. ${AMEX_HOTEL_NOTE}`,
    processingTime: AMEX_HOTEL_TIME,
  }),
  hkRule("hk-amex-hilton", "cg-amex-hk-turbo", "hilton", [8000, 1250], {
    ...AMEX_SRC,
    minimumBankPointsPerTransfer: 8000,
    notes: `64 Membership Rewards points convert to 10 Hilton Honors points. Minimum and increment 8,000 points. ${AMEX_HOTEL_NOTE}`,
    processingTime: AMEX_HOTEL_TIME,
  }),
  hkRule("hk-amex-marriott", "cg-amex-hk-turbo", "marriott", [9000, 1000], {
    ...AMEX_SRC,
    minimumBankPointsPerTransfer: 9000,
    notes: `9 Membership Rewards points convert to 1 Marriott Bonvoy point. Minimum and increment 9,000 points. ${AMEX_HOTEL_NOTE}`,
    processingTime: AMEX_HOTEL_TIME,
  }),

  /* ---- Citi Hong Kong — premium group (12 : 1) ---- */
  ...CITI_PARTNERS.map((prog) =>
    hkRule(`hk-citi-premium-${prog}`, "cg-citi-hk-premium", prog, [18000, 1500], {
      ...CITI_SRC,
      minimumBankPointsPerTransfer: 18000,
      notes: CITI_PREMIUM_NOTE,
      processingTime: CITI_TIME,
    }),
  ),

  /* ---- Citi Hong Kong — standard group (15 : 1) ---- */
  ...CITI_PARTNERS.map((prog) =>
    hkRule(`hk-citi-standard-${prog}`, "cg-citi-hk-standard", prog, [18000, 1200], {
      ...CITI_SRC,
      minimumBankPointsPerTransfer: 18000,
      transferFeeAmount: 200,
      transferFeeCurrency: HKD,
      notes: CITI_STANDARD_NOTE,
      processingTime: CITI_TIME,
    }),
  ),

  /* ---- DBS Black World Mastercard ---- */
  ...DBS_PARTNERS.map((prog) =>
    hkRule(`hk-dbs-black-world-${prog}`, "cg-dbs-hk-black-world", prog, [48, 1000], {
      ...DBS_SRC,
      transferFeeAmount: 0,
      transferFeeCurrency: HKD,
      notes: DBS_BLACK_WORLD_NOTE,
      processingTime: DBS_TIME,
    }),
  ),

  /* ---- DBS Black American Express / other eligible DBS cards ---- */
  ...DBS_PARTNERS.map((prog) =>
    hkRule(`hk-dbs-black-amex-${prog}`, "cg-dbs-hk-black-amex", prog, [72, 1000], {
      ...DBS_SRC,
      notes: DBS_BLACK_AMEX_NOTE,
      processingTime: DBS_TIME,
    }),
  ),

  /* ---- DBS COMPASS VISA ---- */
  ...DBS_PARTNERS.map((prog) =>
    hkRule(`hk-dbs-compass-${prog}`, "cg-dbs-hk-compass", prog, [100, 1000], {
      ...DBS_SRC,
      notes: DBS_COMPASS_NOTE,
      processingTime: DBS_TIME,
    }),
  ),

  /* ---- DBS eligible mileage cards → Air China PhoenixMiles ---- */
  hkRule("hk-dbs-phoenixmiles", "cg-dbs-hk-phoenixmiles", "phoenixmiles", [32, 1000], {
    ...DBS_SRC,
    notes: DBS_PHOENIX_NOTE,
  }),

  /* ---- Standard Chartered 360° Rewards ---- */
  hkRule("hk-sc-asia-miles", "cg-sc-hk-360", "asia-miles", [25000, 1000], {
    ...SC_SRC,
    notes: SC_NOTE,
  }),

  /* ---- BEA Bonus Points ---- */
  hkRule("hk-bea-asia-miles", "cg-bea-hk-mileage", "asia-miles", [10000, 1000], {
    ...BEA_SRC,
    minimumBankPointsPerTransfer: 50000,
    transferFeeAmount: 300,
    transferFeeCurrency: HKD,
    notes: BEA_NOTE,
    processingTime: BEA_TIME,
  }),

  /* ---- BOCHK Gift Points. Eastern Miles is suspended and deliberately excluded. ---- */
  hkRule("hk-boc-asia-miles", "cg-boc-hk-gift", "asia-miles", [7500, 500], {
    ...BOC_SRC,
    minimumBankPointsPerTransfer: 15000,
    transferFeeSchedule: BOC_FEE_SCHEDULE,
    notes: BOC_AM_NOTE,
    processingTime: BOC_TIME,
  }),
  hkRule("hk-boc-phoenixmiles", "cg-boc-hk-gift", "phoenixmiles", [4000, 500], {
    ...BOC_SRC,
    minimumBankPointsPerTransfer: 8000,
    transferFeeSchedule: BOC_FEE_SCHEDULE,
    notes: BOC_PM_NOTE,
    processingTime: BOC_TIME,
  }),
  hkRule("hk-boc-waived-asia-miles", "cg-boc-hk-gift-waived", "asia-miles", [7500, 500], {
    ...BOC_SRC,
    minimumBankPointsPerTransfer: 15000,
    transferFeeAmount: 0,
    transferFeeCurrency: HKD,
    notes: BOC_AM_WAIVED_NOTE,
    processingTime: BOC_TIME,
  }),
  hkRule("hk-boc-waived-phoenixmiles", "cg-boc-hk-gift-waived", "phoenixmiles", [4000, 500], {
    ...BOC_SRC,
    minimumBankPointsPerTransfer: 8000,
    transferFeeAmount: 0,
    transferFeeCurrency: HKD,
    notes: BOC_PM_WAIVED_NOTE,
    processingTime: BOC_TIME,
  }),
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

export const hkCards: Card[] = [
  // HSBC
  card("hk-hsbc-everymile", "hsbc-hk", "HSBC EveryMile Credit Card", "cg-hsbc-hk-everymile", {
    aliases: ["EveryMile"],
    officialSourceUrl: "https://www.hsbc.com.hk/credit-cards/products/everymile/",
  }),

  // American Express
  card("hk-amex-turbo", "amex-hk", "Eligible Membership Rewards card enrolled in Turbo", "cg-amex-hk-turbo", {
    subtitle: "Membership Rewards points",
    aliases: ["Turbo", "Membership Rewards"],
  }),

  // Citi
  card("hk-citi-ultima", "citi-hk", "Citi ULTIMA", "cg-citi-hk-premium"),
  card("hk-citi-prestige", "citi-hk", "Citi Prestige Card", "cg-citi-hk-premium"),
  card("hk-citi-premiermiles", "citi-hk", "Citi PremierMiles Card", "cg-citi-hk-premium", { aliases: ["Premier Miles"] }),
  card("hk-citi-plus", "citi-hk", "Citi Plus Credit Card", "cg-citi-hk-standard"),
  card("hk-citi-rewards", "citi-hk", "Citi Rewards Card", "cg-citi-hk-standard"),
  card("hk-citi-hktvmall", "citi-hk", "Citi HKTVmall Credit Card", "cg-citi-hk-standard"),
  card("hk-citi-gold", "citi-hk", "Citi Gold Credit Card", "cg-citi-hk-standard"),
  card("hk-citi-classic", "citi-hk", "Citi Classic Credit Card", "cg-citi-hk-standard"),

  // DBS
  card("hk-dbs-black-world", "dbs-hk", "DBS Black World Mastercard", "cg-dbs-hk-black-world"),
  card("hk-dbs-black-amex", "dbs-hk", "DBS Black American Express Card", "cg-dbs-hk-black-amex"),
  card("hk-dbs-other-eligible", "dbs-hk", "Other eligible DBS credit card", "cg-dbs-hk-black-amex", {
    subtitle: "HK$100 per 5,000 miles or part thereof",
  }),
  card("hk-dbs-compass", "dbs-hk", "DBS COMPASS VISA", "cg-dbs-hk-compass"),
  card("hk-dbs-phoenixmiles", "dbs-hk", "Eligible DBS mileage card — Air China PhoenixMiles", "cg-dbs-hk-phoenixmiles", {
    subtitle: "PhoenixMiles conversion only",
  }),

  // Standard Chartered
  card("hk-sc-360", "sc-hk", "Eligible Standard Chartered 360° Rewards card", "cg-sc-hk-360"),

  // BEA
  card("hk-bea-centennial", "bea-hk", "BEA CENTENNIAL World Elite Mastercard", "cg-bea-hk-mileage", {
    subtitle: "Registered for Mileage Reward",
  }),
  card("hk-bea-world", "bea-hk", "BEA World Mastercard", "cg-bea-hk-mileage", {
    subtitle: "Registered for Mileage Reward",
  }),

  // Bank of China (Hong Kong)
  card("hk-boc-eligible", "boc-hk", "Eligible BOCHK credit card", "cg-boc-hk-gift", {
    subtitle: "BOCHK Gift Points",
    aliases: ["Bank of China", "BOCHK", "Gift Points"],
  }),
  card("hk-boc-private", "boc-hk", "BOC Private Card", "cg-boc-hk-gift-waived", {
    subtitle: "No mileage handling fee",
  }),
  card("hk-boc-cheers", "boc-hk", "BOC Cheers Card", "cg-boc-hk-gift-waived", {
    subtitle: "No mileage handling fee",
  }),
];
