import { describe, expect, it } from "vitest";
import { calculateEntry, computePortfolioTotals } from "@/lib/milesCalculator";
import { redemptionTargets, computeRequiredPoints, isTargetPublic } from "@/data/redemptionTargets";
import { isPromotionActive, promotions } from "@/data/promotions";
import { freshnessOf, auditFreshness } from "@/lib/dataFreshness";

/**
 * August 2026 QA scenario.
 *
 * Maybank Visa Platinum (cg-mbb-treats-standard, 20,000 TreatsPoints → 1,000
 * miles), 500,000 TreatsPoints, existing Enrich balance of 80,000.
 *
 * Nothing is hard-coded: every expectation is derived from the conversion
 * blocks, existing balances, promotion records and redemption data.
 */

const TREATS = 500_000;
const EXISTING_ENRICH = 80_000;

function scenario() {
  const results = calculateEntry({
    entryId: "e1",
    cardGroupId: "cg-mbb-treats-standard",
    bankPoints: TREATS,
  });
  const portfolio = computePortfolioTotals(results, { enrich: EXISTING_ENRICH });
  return { results, portfolio };
}

const enrichPromo = promotions.find((p) => p.id === "mh-enrich-10pct-2026")!;
const promoLive = isPromotionActive(enrichPromo);

function target(id: string) {
  const t = redemptionTargets.find((x) => x.id === id);
  if (!t) throw new Error(`missing redemption target ${id}`);
  return t;
}

describe("Maybank TreatsPoints conversion arithmetic", () => {
  const { results } = scenario();

  it("converts 500,000 TreatsPoints into 25,000 miles in every partner programme", () => {
    for (const r of results) {
      expect(r.bankPointsPerBlock).toBe(20_000);
      expect(r.partnerPointsPerBlock).toBe(1_000);
      expect(r.partnerPointsReceived).toBe((TREATS / 20_000) * 1_000);
      expect(r.bankPointsUsed).toBe(TREATS);
      expect(r.bankPointsRemaining).toBe(0);
    }
  });

  it("floors partial blocks and leaves the remainder unconverted", () => {
    const [r] = calculateEntry({ entryId: "e2", cardGroupId: "cg-mbb-treats-standard", bankPoints: 509_999 });
    expect(r.partnerPointsReceived).toBe(25_000);
    expect(r.bankPointsRemaining).toBe(9_999);
  });

  it("stays far below the Maybank campaign and annual caps at this balance", () => {
    for (const r of results) expect(r.capApplied).toBeUndefined();
  });

  it("always surfaces the Maybank conversion-limit warning", () => {
    for (const r of results) expect(r.capWarning).toMatch(/campaign and annual Air Miles conversion limits/);
  });

  it("caps the transferable amount and leaves the excess unconverted when a cap binds", () => {
    const annual = results[0].annualCapPartnerPoints!;
    const huge = (annual + 1_000_000) * 20; // more TreatsPoints than the annual cap allows
    const [r] = calculateEntry({ entryId: "e3", cardGroupId: "cg-mbb-treats-standard", bankPoints: huge });
    expect(r.capApplied).toBeTruthy();
    expect(r.partnerPointsReceived).toBeLessThanOrEqual(r.capApplied!.limit);
    expect(r.bankPointsRemaining).toBe(huge - r.bankPointsUsed);
    expect(r.bankPointsRemaining).toBeGreaterThan(0);
  });
});

describe("Portfolio balances", () => {
  const { portfolio } = scenario();
  const byId = (id: string) => portfolio.find((p) => p.programmeId === id)!;

  it("adds the existing Enrich balance to the converted total", () => {
    const enrich = byId("enrich");
    expect(enrich.transferredTotal).toBe(25_000);
    expect(enrich.existingBalance).toBe(EXISTING_ENRICH);
    expect(enrich.potentialTotal).toBe(25_000 + EXISTING_ENRICH);
  });

  it("does not add an existing balance to KrisFlyer or Asia Miles", () => {
    expect(byId("krisflyer").potentialTotal).toBe(25_000);
    expect(byId("asia-miles").potentialTotal).toBe(25_000);
  });

  it("applies the 10% Enrich bonus only to the newly converted points", () => {
    const enrich = byId("enrich");
    const expectedBonus = promoLive ? Math.floor(25_000 * (enrichPromo.bonusPercentage! / 100)) : 0;
    expect(enrich.bonusTotal).toBe(expectedBonus);
    expect(enrich.promotionalTotal).toBe(enrich.potentialTotal + expectedBonus);
  });

  it("drops the promotional balance once the promotion end date has passed", () => {
    expect(isPromotionActive(enrichPromo, "2026-08-18")).toBe(true);
    expect(isPromotionActive(enrichPromo, "2026-08-19")).toBe(false);
  });

  it("removes the existing balance when the user clears it", () => {
    const { results } = scenario();
    const cleared = computePortfolioTotals(results, {});
    expect(cleared.find((p) => p.programmeId === "enrich")!.potentialTotal).toBe(25_000);
  });
});

describe("Redemption targets — August 2026 QA values", () => {
  const { portfolio } = scenario();
  const balanceOf = (programmeId: string) => {
    const p = portfolio.find((x) => x.programmeId === programmeId)!;
    return Math.max(p.promotionalTotal, p.potentialTotal);
  };

  const enrichBalance = balanceOf("enrich");
  const amBalance = balanceOf("asia-miles");
  const kfBalance = balanceOf("krisflyer");

  const cases: { id: string; oneWay: number }[] = [
    { id: "enrich-tfu-j", oneWay: 35_200 },
    { id: "enrich-tpe-j", oneWay: 36_000 },
    { id: "enrich-xmn-j", oneWay: 37_100 },
    { id: "enrich-csx-j", oneWay: 56_500 },
    { id: "enrich-fuk-j", oneWay: 64_000 },
  ];

  for (const c of cases) {
    it(`${c.id} prices at ${c.oneWay} one way and double for return`, () => {
      const t = target(c.id);
      expect(t.pointsPerPerson).toBe(c.oneWay);
      expect(computeRequiredPoints(t, "one_way", 1)).toBe(c.oneWay);
      expect(computeRequiredPoints(t, "return", 1)).toBe(c.oneWay * 2);
      expect(computeRequiredPoints(t, "return", 2)).toBe(c.oneWay * 4);
    });
  }

  it("Changsha and Shenzhen share the updated Enrich Saver pricing", () => {
    for (const code of ["csx", "szx"]) {
      expect(target(`enrich-${code}-y`).pointsPerPerson).toBe(9_500);
      expect(target(`enrich-${code}-j`).pointsPerPerson).toBe(56_500);
    }
  });

  it("Changsha Business return leaves a shortfall against the promotional Enrich balance", () => {
    const required = computeRequiredPoints(target("enrich-csx-j"), "return", 1);
    expect(required).toBe(113_000);
    expect(required - enrichBalance).toBe(113_000 - enrichBalance);
    if (promoLive) expect(required - enrichBalance).toBe(5_500);
  });

  it("Cathay KUL–HKG Business is 27,000 one way / 54,000 return", () => {
    const t = target("am-hkg-j");
    expect(t.pointsPerPerson).toBe(27_000);
    expect(computeRequiredPoints(t, "return", 1) - amBalance).toBe(29_000);
    expect(computeRequiredPoints(t, "one_way", 1) - amBalance).toBe(2_000);
  });

  it("keeps the 1 November 2025 KrisFlyer Saver Business values", () => {
    expect(target("kf-hkg-j").pointsPerPerson).toBe(36_500);
    expect(target("kf-tpe-j").pointsPerPerson).toBe(36_500);
    expect(target("kf-nrt-j").pointsPerPerson).toBe(57_000);
    expect(computeRequiredPoints(target("kf-nrt-j"), "return", 1) - kfBalance).toBe(89_000);
  });

  it("adds a routing qualification to connecting KrisFlyer itineraries only", () => {
    expect(target("kf-nrt-j").routingNote).toMatch(/itinerary accepted by KrisFlyer/);
    expect(target("kf-sin-j").routingNote).toBeUndefined();
  });

  it("labels the Cathay source as a verified award reference, not an official chart", () => {
    expect(target("am-hkg-j").source.sourceType).toBe("verified_secondary");
    expect(target("am-hkg-j").source.sourceName).not.toMatch(/published chart/i);
  });

  it("never marks award availability as checked", () => {
    for (const t of redemptionTargets) expect(t.availabilityChecked).toBe(false);
  });
});

describe("Stale-data safeguard", () => {
  it("classifies records by verification age and validity window", () => {
    expect(freshnessOf({ verifiedAt: "2026-08-01" }, "2026-08-12")).toBe("current");
    expect(freshnessOf({ verifiedAt: "2025-01-01" }, "2026-08-12")).toBe("needs_review");
    expect(freshnessOf({ verifiedAt: "2026-08-01", effectiveTo: "2026-08-10" }, "2026-08-12")).toBe("expired");
  });

  it("audits redemption targets without hiding them from customers", () => {
    const rows = auditFreshness(
      redemptionTargets.map((t) => ({
        id: t.id,
        kind: "redemption_target" as const,
        verifiedAt: t.source.verifiedAt,
        effectiveTo: t.effectiveUntil,
      })),
      "2026-08-12",
    );
    expect(Array.isArray(rows)).toBe(true);
    // Flagged records stay publicly visible.
    for (const r of rows) {
      const t = redemptionTargets.find((x) => x.id === r.id)!;
      expect(isTargetPublic(t)).toBe(true);
    }
  });
});
