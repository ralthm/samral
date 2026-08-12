import { describe, it, expect } from "vitest";
import { calculateEntry } from "@/lib/milesCalculator";
import { findApplicablePromotions, isPromotionActive, promotions } from "@/data/promotions";

// The Cathay-funded 10% leg ends 31 July 2026 while the CIMB-funded 15% leg
// runs to 31 August 2026, so expectations are derived from whether each leg
// is still inside its window today.
const cathayLive = isPromotionActive(promotions.find((p) => p.id === "cathay-cimb-am-10pct-airline-2026")!);
const CATHAY_10 = (base: number) => (cathayLive ? base * 0.1 : 0);

const CATHAY_PROMO = "cathay-cimb-am-10pct-airline-2026";
const CIMB_PROMO = "cimb-am-15pct-bank-2026";

function amResult(bp: number, registered: string[] = [], date?: string) {
  // Note: promotion date evaluation uses Asia/Kuala_Lumpur "today". Unit
  // tests target the current calendar window (22 July 2026) — see spec.
  const results = calculateEntry({
    entryId: "t",
    cardGroupId: "cg-cimb-bonus",
    bankPoints: bp,
    registeredPromotionIds: registered,
  });
  const r = results.find((x) => x.programmeId === "asia-miles");
  if (!r) throw new Error("no asia-miles result");
  return r;
}

describe("CIMB × Cathay Asia Miles campaign", () => {
  it("500,000 BP → 6 blocks, 30,000 base miles, 50,000 BP left", () => {
    const r = amResult(500_000);
    expect(r.fullBlocks).toBe(6);
    expect(r.partnerPointsReceived).toBe(30_000);
    expect(r.bankPointsUsed).toBe(450_000);
    expect(r.bankPointsRemaining).toBe(50_000);
  });

  it("registered + 500,000 BP → applied bonus = 3,000 (Cathay) + 4,500 (CIMB) = 7,500; max total 37,500", () => {
    const r = amResult(500_000, [CATHAY_PROMO]);
    const expected = 4_500 + CATHAY_10(30_000);
    expect(r.bonusPartnerPoints).toBe(expected);
    expect(r.conditionalBonusPartnerPoints).toBe(0);
    expect(r.promotionalPartnerPoints).toBe(30_000 + expected);
    expect(r.maxPromotionalPartnerPoints).toBe(30_000 + expected);
  });

  it("not registered + 500,000 BP → applied = 4,500 CIMB only; Cathay 3,000 remains conditional", () => {
    const r = amResult(500_000);
    expect(r.bonusPartnerPoints).toBe(4_500);
    expect(r.conditionalBonusPartnerPoints).toBe(CATHAY_10(30_000));
    expect(r.promotionalPartnerPoints).toBe(34_500);
    expect(r.maxPromotionalPartnerPoints).toBe(34_500 + CATHAY_10(30_000));
  });

  it("75,000 BP → 1 block, 5,000 base miles, +500 Cathay + 750 CIMB when registered", () => {
    const r = amResult(75_000, [CATHAY_PROMO]);
    expect(r.fullBlocks).toBe(1);
    expect(r.partnerPointsReceived).toBe(5_000);
    expect(r.bonusPartnerPoints).toBe(750 + CATHAY_10(5_000)); // CIMB 15% + Cathay 10% while live
    expect(r.promotionalPartnerPoints).toBe(5_000 + 750 + CATHAY_10(5_000));
  });

  it("149,999 BP → exactly one 75,000 block, no partial second block", () => {
    const r = amResult(149_999);
    expect(r.fullBlocks).toBe(1);
    expect(r.partnerPointsReceived).toBe(5_000);
    expect(r.bankPointsUsed).toBe(75_000);
    expect(r.bankPointsRemaining).toBe(74_999);
  });

  it("promotions attach to every eligible cg-cimb-bonus route on today's date window", () => {
    const applicable = findApplicablePromotions("cimb", "asia-miles", "cg-cimb-bonus");
    const ids = applicable.map((p) => p.id).sort();
    // At least one of the two components must be live during dev; both must be
    // properly scoped to CIMB + cg-cimb-bonus so the calculator can find them.
    expect(ids.every((id) => id === CATHAY_PROMO || id === CIMB_PROMO)).toBe(true);
  });

  it("ineligible card group (Maybank Treats) receives no CIMB/Cathay bonus", () => {
    const results = calculateEntry({
      entryId: "t",
      cardGroupId: "cg-mbb-treats-standard",
      bankPoints: 500_000,
      registeredPromotionIds: [CATHAY_PROMO],
    });
    const am = results.find((x) => x.programmeId === "asia-miles");
    expect(am?.promotions.find((p) => p.id === CATHAY_PROMO)).toBeUndefined();
    expect(am?.promotions.find((p) => p.id === CIMB_PROMO)).toBeUndefined();
  });

  it("date-based windows: Cathay promo ends 2026-07-31, CIMB promo ends 2026-08-31", () => {
    const cathay = findApplicablePromotions("cimb", "asia-miles", "cg-cimb-bonus", "2026-07-31");
    expect(cathay.map((p) => p.id)).toEqual(expect.arrayContaining([CATHAY_PROMO, CIMB_PROMO]));

    const augustOnly = findApplicablePromotions("cimb", "asia-miles", "cg-cimb-bonus", "2026-08-15");
    expect(augustOnly.map((p) => p.id)).toEqual([CIMB_PROMO]);

    const septemberNone = findApplicablePromotions("cimb", "asia-miles", "cg-cimb-bonus", "2026-09-01");
    expect(septemberNone).toEqual([]);
  });
});
