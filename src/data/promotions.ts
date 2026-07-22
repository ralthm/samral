// Promotions layer — INDEPENDENT of base conversion rules.
// Promotions never modify bankPointsPerBlock / partnerPointsPerBlock in
// src/data/milesCalculator.ts. They are applied AFTER the standard transfer
// calculation as an additive bonus in the destination programme currency.
//
// If a promotion ends or is withdrawn, delete or set `active: false` here —
// the underlying conversion database is never touched.

export type BonusType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  /** Destination loyalty programme the bonus is credited in. */
  programmeId: string;
  name: string;
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
  /** Optional cap on the bonus (in destination partner points). */
  maximumBonus?: number;
  registrationRequired: boolean;
  startDate: string; // ISO
  endDate: string;   // ISO
  /** Human copy on when the bonus points post (e.g. "within 6 weeks of transfer"). */
  postingTimeline?: string;
  officialSource: string;
  active: boolean;
}

export const promotions: Promotion[] = [
  {
    id: "mh-enrich-10pct-2026",
    programmeId: "enrich",
    name: "10% Bonus Enrich Points",
    participatingBanks: ["maybank", "cimb", "alliance", "uob", "hsbc", "hongleong", "affin", "ambank", "publicbank", "bankrakyat"],
    bonusType: "percentage",
    bonusPercentage: 10,
    registrationRequired: false,
    startDate: "2026-07-11",
    endDate: "2026-08-18",
    postingTimeline: "Bonus Enrich Points post to the member account after the standard transfer completes.",
    officialSource: "https://www.malaysiaairlines.com/my/en/enrich/enrich-promotions.html",
    active: true,
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

/**
 * Returns the best applicable active promotion for the given (bank, programme).
 * Best = largest bonus percentage / fixed amount if multiple match.
 */
export function findApplicablePromotion(
  bankId: string,
  programmeId: string,
  cardGroupId?: string,
  date = today(),
): Promotion | undefined {
  const candidates = getActivePromotions(date).filter((p) => {
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
