// Promotions layer — INDEPENDENT of base conversion rules.
// Promotions never modify bankPointsPerBlock / partnerPointsPerBlock in
// src/data/milesCalculator.ts. They are applied AFTER the standard transfer
// calculation as an additive bonus in the destination programme currency.
//
// A single transfer route can have multiple simultaneously-active promotions
// (e.g. a bank-funded bonus AND an airline-funded bonus that stack). Each is
// modelled as its own record so we never invent a combined percentage.
//
// If a promotion ends or is withdrawn, delete or set `active: false` here —
// the underlying conversion database is never touched.

export type BonusType = "percentage" | "fixed";
export type PromotionSponsor = "bank" | "airline";

export interface Promotion {
  id: string;
  /** Destination loyalty programme the bonus is credited in. */
  programmeId: string;
  name: string;
  /** Who funds the bonus. Used internally for stacking logic. */
  sponsor: PromotionSponsor;
  /**
   * Customer-facing attribution label (e.g. "Enrich promotion"). Set this
   * whenever "airline-funded"/"bank-funded" would misdescribe the campaign —
   * the Enrich bank-conversion promotion is organised by Enrich in
   * collaboration with participating banks, not "airline-funded".
   */
  sponsorLabel?: string;
  /**
   * Bank ids eligible for the promotion. Use ["*"] to mean "all banks".
   * These match the ids in src/data/milesCalculator.ts banks[].
   */
  participatingBanks: string[];
  /**
   * Optional narrower list of eligible routes. If empty, every verified route
   * from any participating bank to `programmeId` qualifies.
   */
  eligibleTransferRoutes?: { bankId: string; cardGroupId?: string }[];
  bonusType: BonusType;
  /** For bonusType === "percentage". e.g. 10 means +10%. */
  bonusPercentage?: number;
  /** For bonusType === "fixed". Flat partner-points added per transfer. */
  bonusFixed?: number;
  /** Optional per-transaction cap on the bonus (in destination partner points). */
  maximumBonus?: number;
  /**
   * Campaign-wide cap on total bonus miles issued across all participants.
   * Informational — this calculator can't observe live campaign consumption,
   * so we always show the bonus but note it is subject to availability.
   */
  overallBonusCap?: number;
  /**
   * True when the user must complete an off-site registration step BEFORE
   * transferring for the bonus to be credited. UI must gate application of
   * the bonus on an explicit user confirmation.
   */
  registrationRequired: boolean;
  /** Optional registration link surfaced to the user. */
  registrationUrl?: string;
  /** Optional list of eligible residency countries. */
  eligibleResidence?: string[];
  startDate: string; // ISO date, evaluated in Asia/Kuala_Lumpur time
  endDate: string;   // ISO date, evaluated in Asia/Kuala_Lumpur time
  /** Human copy on when the bonus points post (e.g. "within 6 weeks of transfer"). */
  postingTimeline?: string;
  /** Date by which the bonus is expected to be credited. */
  creditBy?: string;
  /** Date by which the user must escalate if the bonus has not posted. */
  claimDeadline?: string;
  officialSource: string;
  /** Provenance of the terms this record was built from. */
  sourceType?: "official_bank" | "official_loyalty_programme" | "official_airline" | "verified_secondary";
  sourceName?: string;
  /** Date the terms were last read end-to-end. */
  verifiedAt?: string;
  /** Validity of the base points credited by the conversion. */
  basePointsValidity?: string;
  /** Validity of the bonus points credited by the promotion. */
  bonusPointsValidity?: string;
  /** Per-member cap on points credited in a single day under the promotion. */
  dailyCapPartnerPoints?: number;
  active: boolean;
  /** Optional additional plain-text terms shown under "See terms". */
  additionalTerms?: string[];
}

export const promotions: Promotion[] = [
  {
    id: "mh-enrich-10pct-2026",
    programmeId: "enrich",
    name: "10% Bonus Enrich Points",
    sponsor: "airline",
    sponsorLabel: "Enrich promotion",
    participatingBanks: ["maybank", "cimb", "alliance", "uob", "hsbc", "hongleong", "affin", "ambank", "publicbank", "bankrakyat", "sc"],
    eligibleTransferRoutes: [
      { bankId: "maybank" },
      { bankId: "cimb" },
      { bankId: "alliance" },
      { bankId: "uob" },
      { bankId: "hsbc" },
      { bankId: "hongleong" },
      { bankId: "affin" },
      { bankId: "ambank" },
      { bankId: "publicbank" },
      { bankId: "bankrakyat" },
      // Standard Chartered: only the Journey/WorldMiles card is eligible for the
      // Enrich Bank Conversion Promotion. 360° Rewards routes are excluded.
      { bankId: "sc", cardGroupId: "cg-sc-journey" },
    ],
    bonusType: "percentage",
    bonusPercentage: 10,
    registrationRequired: false,
    startDate: "2026-07-11",
    endDate: "2026-08-18",
    postingTimeline: "The base and bonus Enrich Points are expected to be credited within 14 working days after the bank submits the conversion. Bonus Enrich Points are valid for one year. Transfers are irreversible. The legal name on the credit-card account and Enrich account must match.",
    officialSource: "https://www.malaysiaairlines.com/my/en/enrich/enrich-promotions.html",
    sourceName: "Enrich Bank Points Conversion Promotion Terms & Conditions",
    sourceType: "official_loyalty_programme",
    verifiedAt: "2026-08-12",
    basePointsValidity: "Base Enrich Points: valid for 3 years from crediting.",
    bonusPointsValidity: "Bonus Enrich Points: valid for 1 year from crediting.",
    dailyCapPartnerPoints: 3_000_000,
    active: true,
  },

  /* -------- CIMB × Cathay "Up to 25% Extra Asia Miles" campaign -------- */
  // Two independent sponsors, different deadlines, one shared conversion.

  {
    id: "cathay-cimb-am-10pct-airline-2026",
    programmeId: "asia-miles",
    name: "Cathay 10% Extra Asia Miles",
    sponsor: "airline",
    participatingBanks: ["cimb"],
    eligibleTransferRoutes: [{ bankId: "cimb", cardGroupId: "cg-cimb-bonus" }],
    bonusType: "percentage",
    bonusPercentage: 10,
    registrationRequired: true,
    registrationUrl: "https://www.cathaypacific.com/",
    eligibleResidence: ["Malaysia", "Singapore", "Philippines", "Thailand", "Indonesia"],
    startDate: "2026-06-25",
    endDate: "2026-07-31",
    creditBy: "2026-10-31",
    claimDeadline: "2026-11-15",
    postingTimeline: "Bonus expected to be credited by 31 October 2026. Contact Cathay by 15 November 2026 if not received. Cathay membership must remain valid when the bonus posts. Non-transferable, non-refundable, non-exchangeable for cash.",
    officialSource: "https://www.cathaypacific.com/",
    sponsorLabel: "Cathay promotion",
    sourceName: "Cathay campaign terms and conditions",
    sourceType: "official_airline",
    verifiedAt: "2026-08-12",
    active: true,
    additionalTerms: [
      "You must hold a Cathay membership with a residential address in Malaysia, Singapore, Philippines, Thailand or Indonesia.",
      "You must register via Cathay's dedicated campaign page BEFORE completing the conversion.",
    ],
  },

  {
    id: "cimb-am-15pct-bank-2026",
    programmeId: "asia-miles",
    name: "CIMB 15% Extra Asia Miles",
    sponsor: "bank",
    participatingBanks: ["cimb"],
    eligibleTransferRoutes: [{ bankId: "cimb", cardGroupId: "cg-cimb-bonus" }],
    bonusType: "percentage",
    bonusPercentage: 15,
    overallBonusCap: 500_000,
    registrationRequired: false,
    startDate: "2026-06-25",
    endDate: "2026-08-31",
    postingTimeline: "Bonus expected to be credited within three weeks after the campaign ends. Subject to a 500,000 Asia Miles overall campaign cap — bonus is not guaranteed once the cap has been exhausted.",
    officialSource: "https://www.cimb.com.my/",
    sponsorLabel: "CIMB promotion",
    sourceName: "CIMB campaign terms and conditions",
    sourceType: "official_bank",
    verifiedAt: "2026-08-12",
    active: true,
    additionalTerms: [
      "Applies to principal cardholders only.",
      "Cathay membership name must match the CIMB principal cardholder's name.",
      "Minimum conversion of 75,000 CIMB Bonus Points (one full 5,000 Asia Miles block).",
      "Overall campaign cap of 500,000 Extra Asia Miles across all participants.",
    ],
  },
];

/* -------------------- Helpers -------------------- */

// Campaign windows are evaluated in Asia/Kuala_Lumpur time so promotions
// activate and expire on the correct local calendar day regardless of the
// viewer's timezone.
const today = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts; // en-CA formats as YYYY-MM-DD
};

export function isPromotionActive(p: Promotion, date = today()): boolean {
  if (!p.active) return false;
  if (p.startDate && p.startDate > date) return false;
  if (p.endDate && p.endDate < date) return false;
  return true;
}

export function getActivePromotions(date = today()): Promotion[] {
  return promotions.filter((p) => isPromotionActive(p, date));
}

/** Returns EVERY active promotion applicable to the given route (may stack). */
export function findApplicablePromotions(
  bankId: string,
  programmeId: string,
  cardGroupId?: string,
  date = today(),
): Promotion[] {
  return getActivePromotions(date).filter((p) => {
    if (p.programmeId !== programmeId) return false;
    const bankOk = p.participatingBanks.includes("*") || p.participatingBanks.includes(bankId);
    if (!bankOk) return false;
    if (p.eligibleTransferRoutes && p.eligibleTransferRoutes.length > 0) {
      return p.eligibleTransferRoutes.some((r) =>
        r.bankId === bankId && (!r.cardGroupId || r.cardGroupId === cardGroupId),
      );
    }
    return true;
  });
}

/**
 * Legacy single-promotion helper. Returns the promotion with the largest
 * percentage / fixed amount if multiple match.
 */
export function findApplicablePromotion(
  bankId: string,
  programmeId: string,
  cardGroupId?: string,
  date = today(),
): Promotion | undefined {
  const candidates = findApplicablePromotions(bankId, programmeId, cardGroupId, date);
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => scoreOf(b) - scoreOf(a))[0];
}

function scoreOf(p: Promotion): number {
  if (p.bonusType === "percentage") return p.bonusPercentage ?? 0;
  return (p.bonusFixed ?? 0) / 1000; // rough ordering
}

/**
 * Compute the bonus (in destination partner points) for a base transfer amount.
 * Base amount MUST come from the standard calculator — this function never
 * changes the base conversion ratio.
 */
export function computeBonus(promo: Promotion, basePartnerPoints: number): number {
  if (basePartnerPoints <= 0) return 0;
  let bonus = 0;
  if (promo.bonusType === "percentage") {
    bonus = Math.floor(basePartnerPoints * ((promo.bonusPercentage ?? 0) / 100));
  } else {
    bonus = Math.floor(promo.bonusFixed ?? 0);
  }
  if (promo.maximumBonus && promo.maximumBonus > 0) {
    bonus = Math.min(bonus, promo.maximumBonus);
  }
  return Math.max(0, bonus);
}
