// Internal stale-data safeguard.
//
// Conversion rates and award pricing change without notice. Records are never
// hidden from customers just because they are old — instead they are flagged
// so we can re-check them. Use `auditFreshness` in tests or the admin view to
// list everything that needs a fresh verification pass.

export type FreshnessState = "current" | "needs_review" | "expired";

/** A record is "needs review" once it has not been verified for this long. */
export const REVIEW_AFTER_DAYS = 120;

const DAY_MS = 86_400_000;

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function daysSince(isoDate: string, today = todayIso()): number {
  const a = Date.parse(`${isoDate}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY;
  return Math.floor((b - a) / DAY_MS);
}

export interface FreshnessInput {
  verifiedAt: string;
  /** Optional end of the record's validity window (chart or promotion end). */
  effectiveTo?: string;
  reviewAfterDays?: number;
}

/** Classify a single record. Superseded/expired always wins over age. */
export function freshnessOf(input: FreshnessInput, today = todayIso()): FreshnessState {
  if (input.effectiveTo && input.effectiveTo < today) return "expired";
  const age = daysSince(input.verifiedAt, today);
  return age > (input.reviewAfterDays ?? REVIEW_AFTER_DAYS) ? "needs_review" : "current";
}

export interface FreshnessRow {
  id: string;
  kind: "conversion_route" | "redemption_target" | "promotion";
  verifiedAt: string;
  effectiveTo?: string;
  state: FreshnessState;
  ageInDays: number;
}

/** Audit a list of records and return only those that are not "current". */
export function auditFreshness(rows: Omit<FreshnessRow, "state" | "ageInDays">[], today = todayIso()): FreshnessRow[] {
  return rows
    .map((r) => ({
      ...r,
      state: freshnessOf({ verifiedAt: r.verifiedAt, effectiveTo: r.effectiveTo }, today),
      ageInDays: daysSince(r.verifiedAt, today),
    }))
    .filter((r) => r.state !== "current")
    .sort((a, b) => b.ageInDays - a.ageInDays);
}
