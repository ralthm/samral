/**
 * Redemption status classification.
 *
 * Single source of truth for whether an award is reachable, close, or a future
 * goal. Classification is purely numeric and runs AFTER traveller count and
 * trip type have been multiplied into `required`.
 *
 * Invariants:
 *  - reachable  <=> potentialBalance >= required. Reports `remaining`, never a shortfall.
 *  - close/future <=> potentialBalance < required. Shortfall is always > 0.
 */

export type RedemptionStatus = "reachable" | "close" | "future";

/** Ratio of the requirement a user must already hold to count as "close". */
export const CLOSE_THRESHOLD = 0.75;

export interface RedemptionClassification {
  status: RedemptionStatus;
  /** Points left over after redeeming. Present only when reachable. */
  remaining?: number;
  /** Points still needed. Present only when not reachable, always > 0. */
  shortfall?: number;
  /** balance / required, 0 when nothing is required. */
  ratio: number;
}

export function classifyRedemption(
  potentialBalance: number,
  required: number,
): RedemptionClassification {
  const balance = Number.isFinite(potentialBalance) ? Math.max(0, potentialBalance) : 0;
  const need = Number.isFinite(required) ? Math.max(0, required) : 0;
  const ratio = need > 0 ? balance / need : 0;

  if (balance >= need) {
    return { status: "reachable", remaining: balance - need, ratio };
  }

  const shortfall = need - balance; // strictly > 0 here
  return { status: ratio >= CLOSE_THRESHOLD ? "close" : "future", shortfall, ratio };
}
