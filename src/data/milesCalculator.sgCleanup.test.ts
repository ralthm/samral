import { describe, expect, it } from "vitest";
import resultsSectionSource from "@/components/milesCalculator/ResultsSection.tsx?raw";
import milesCalculatorPageSource from "@/pages/MilesCalculator.tsx?raw";
import { calculateEntry } from "@/lib/milesCalculator";
import { computeTransferFees } from "@/lib/transferFees";
import { ratesDirectoryCaption, ratesDirectoryHeading } from "@/lib/marketCopy";
import { awardDisclaimersFor, UNIVERSAL_AWARD_DISCLAIMER } from "@/lib/awardDisclaimers";
import { blockExampleFor } from "@/lib/blockExample";
import { getAllianceInfo } from "@/data/alliances";
import { summaryCounters, conversionRules, isRulePublic } from "@/data/milesCalculator";

const SOURCES: Record<string, string> = {
  "src/components/milesCalculator/ResultsSection.tsx": resultsSectionSource,
  "src/pages/MilesCalculator.tsx": milesCalculatorPageSource,
};
const read = (p: string) => SOURCES[p];

/* 1. Country-specific link copy */

describe("rates directory copy is derived from the selected country", () => {
  it("Singapore mode never says Malaysian conversion rates", () => {
    expect(ratesDirectoryHeading("SG")).toBe("Browse all Singapore conversion rates");
    expect(ratesDirectoryHeading("SG")).not.toContain("Malaysian");
    expect(ratesDirectoryCaption("SG")).not.toContain("Malaysian");
  });

  it("Malaysia mode never says Singapore conversion rates", () => {
    expect(ratesDirectoryHeading("MY")).toBe("Browse all Malaysian conversion rates");
    expect(ratesDirectoryHeading("MY")).not.toContain("Singapore");
    expect(ratesDirectoryCaption("MY")).not.toContain("Singapore");
  });

  it("the shared results component hard-codes neither market's wording", () => {
    const src = read("src/components/milesCalculator/ResultsSection.tsx");
    expect(src).not.toContain("Browse all Malaysian conversion rates");
    expect(src).not.toContain("Browse all Singapore conversion rates");
    expect(src).toContain("ratesDirectoryHeading(country)");
  });
});

/* 2. Contextual award disclaimers */

describe("award disclaimers", () => {
  it("shows only KrisFlyer wording when only KrisFlyer redemptions are visible", () => {
    const d = awardDisclaimersFor(["krisflyer"]).join(" ");
    expect(d).toContain("KrisFlyer Saver");
    expect(d).not.toContain("Enrich");
    expect(d).not.toContain("Asia Miles");
  });

  it("adds the Asia Miles disclaimer when Asia Miles opportunities are visible", () => {
    const d = awardDisclaimersFor(["krisflyer", "asia-miles"]).join(" ");
    expect(d).toContain("Asia Miles");
    expect(d).not.toContain("Enrich Saver");
  });

  it("adds the Enrich disclaimer only when Enrich opportunities are visible", () => {
    expect(awardDisclaimersFor(["enrich"]).join(" ")).toContain("Enrich Saver");
    expect(awardDisclaimersFor(["qantas"])).toHaveLength(0);
  });

  it("keeps universal wording independent of programme", () => {
    expect(UNIVERSAL_AWARD_DISCLAIMER).toContain("Award-seat availability has not been checked.");
    expect(UNIVERSAL_AWARD_DISCLAIMER).toContain("Taxes, fees and airline surcharges");
  });
});

/* 3. Transfer fees */

const dbsRows = (points: number) =>
  calculateEntry({ entryId: "dbs", cardGroupId: "cg-dbs-sg-points", bankPoints: points });
const citiRows = (points: number) =>
  calculateEntry({ entryId: "citi", cardGroupId: "cg-citi-sg-typ", bankPoints: points });

const feeContributors = (rows: ReturnType<typeof dbsRows>, programmeId: string) =>
  rows
    .filter((r) => r.programmeId === programmeId)
    .map((r) => ({
      bankId: r.bankId,
      bankName: r.bankName,
      transferFeeAmount: r.transferFeeAmount,
      transferFeeCurrency: r.transferFeeCurrency,
    }));

describe("estimated transfer fees", () => {
  it("DBS + Citi into KrisFlyer totals S$54.50", () => {
    const contributors = [
      ...feeContributors(dbsRows(800_000), "krisflyer"),
      ...feeContributors(citiRows(400_000), "krisflyer"),
    ];
    const fees = computeTransferFees(contributors);
    expect(fees.currency).toBe("SGD");
    expect(fees.total).toBeCloseTo(54.5, 2);
    expect(fees.breakdown.map((b) => b.amount)).toEqual([27.25, 27.25]);
    expect(fees.unknownBanks).toHaveLength(0);
  });

  it("a DBS-only AirAsia scenario charges only the DBS fee", () => {
    const fees = computeTransferFees(feeContributors(dbsRows(800_000), "airasia"));
    expect(fees.total).toBeCloseTo(27.25, 2);
    expect(fees.breakdown).toHaveLength(1);
    expect(fees.breakdown[0].bankName).toMatch(/DBS/);
  });

  it("alternative programme scenarios do not aggregate fees with one another", () => {
    const dbs = dbsRows(800_000);
    const citi = citiRows(400_000);
    const kf = computeTransferFees([
      ...feeContributors(dbs, "krisflyer"),
      ...feeContributors(citi, "krisflyer"),
    ]);
    const am = computeTransferFees([
      ...feeContributors(dbs, "asia-miles"),
      ...feeContributors(citi, "asia-miles"),
    ]);
    expect(kf.total).toBeCloseTo(54.5, 2);
    expect(am.total).toBeCloseTo(54.5, 2);
    // Not 109.00 — each destination programme is priced on its own.
    expect(kf.total + 0).not.toBeCloseTo(109, 2);
  });

  it("charges one fee per bank even when a bank contributes several rules", () => {
    const rows = dbsRows(800_000).filter((r) => r.programmeId === "krisflyer");
    const doubled = [...feeContributors(rows, "krisflyer"), ...feeContributors(rows, "krisflyer")];
    expect(computeTransferFees(doubled).total).toBeCloseTo(27.25, 2);
  });

  it("never guesses a fee that is not on record", () => {
    const fees = computeTransferFees([{ bankId: "x", bankName: "Example Bank" }]);
    expect(fees.total).toBe(0);
    expect(fees.breakdown).toHaveLength(0);
    expect(fees.unknownBanks).toEqual(["Example Bank"]);
  });

  it("does not deduct fees from miles", () => {
    const kf = dbsRows(800_000).filter((r) => r.programmeId === "krisflyer")[0];
    expect(kf.partnerPointsReceived).toBe(1_600_000);
  });
});

/* Existing DBS / Citi conversion mathematics is unchanged */

describe("DBS and Citi conversion mathematics (regression)", () => {
  it("DBS 800,000 + Citi 400,000 still produce 1,760,000 KrisFlyer", () => {
    const dbs = dbsRows(800_000).find((r) => r.programmeId === "krisflyer")!;
    const citi = citiRows(400_000).find((r) => r.programmeId === "krisflyer")!;
    expect(dbs.partnerPointsReceived).toBe(1_600_000);
    expect(citi.partnerPointsReceived).toBe(160_000);
    expect(dbs.partnerPointsReceived + citi.partnerPointsReceived).toBe(1_760_000);
  });

  it("DBS 800,000 still produces 2,400,000 AirAsia points", () => {
    const aa = dbsRows(800_000).find((r) => r.programmeId === "airasia")!;
    expect(aa.partnerPointsReceived).toBe(2_400_000);
  });
});

/* 5. Alliance metadata */

describe("alliance metadata", () => {
  it.each([
    ["krisflyer", "Star Alliance"],
    ["asia-miles", "oneworld"],
    ["eva", "Star Alliance"],
    ["qantas", "oneworld"],
    ["qatar", "oneworld"],
    ["rop", "Star Alliance"],
    ["ba", "oneworld"],
    ["turkish", "Star Alliance"],
  ])("%s displays %s", (programmeId, alliance) => {
    expect(getAllianceInfo(programmeId)?.allianceDisplayName).toBe(alliance);
  });

  it("does not label Etihad Guest or Flying Blue as alliance members", () => {
    expect(getAllianceInfo("etihad")).toBeNull();
    expect(getAllianceInfo("flying-blue")).toBeNull();
  });
});

/* 6. Fixed-block explanation */

describe("fixed-block explanation", () => {
  it("uses a real rate from the user's selected card", () => {
    const ex = blockExampleFor(["cg-dbs-sg-points"], "SG")!;
    expect(ex.fromSelection).toBe(true);
    expect(ex.bankName).toMatch(/DBS/);
    expect(ex.bankPointsPerBlock).toBe(5000);
    expect(ex.partnerPointsPerBlock).toBe(10000);
    expect(ex.leftoverPoints).toBeGreaterThan(0);
    expect(ex.usedPoints + ex.leftoverPoints).toBe(ex.enteredPoints);
  });

  it("falls back to a verified rate in the active market, not an invented one", () => {
    const ex = blockExampleFor([], "SG")!;
    expect(ex.fromSelection).toBe(false);
    const matching = conversionRules.filter(
      (r) => isRulePublic(r)
        && r.bankPointsPerBlock === ex.bankPointsPerBlock
        && r.partnerPointsPerBlock === ex.partnerPointsPerBlock,
    );
    expect(matching.length).toBeGreaterThan(0);
  });

  it("no longer presents 20,000 → 1,000 as a Singapore bank conversion", () => {
    const src = read("src/pages/MilesCalculator.tsx");
    expect(src).not.toContain("20,000 bank points for every 1,000 airline points");
  });
});

/* 7. Headline counters */

describe("headline counters", () => {
  it("the route counter counts verified routes only and is derived from data", () => {
    const sg = summaryCounters("SG");
    const verifiedSgRoutes = conversionRules.filter(isRulePublic).length;
    expect(sg.routes).toBeGreaterThan(0);
    expect(sg.routes).toBeLessThanOrEqual(verifiedSgRoutes);
    const src = read("src/pages/MilesCalculator.tsx");
    expect(src).toContain('label="Verified conversion routes"');
    expect(src).toContain("counters.routes");
  });

  it("supported_unverified routes are excluded from the verified count", () => {
    const unverified = conversionRules.filter((r) => r.status === "supported_unverified");
    expect(unverified.length).toBeGreaterThan(0);
    for (const r of unverified) expect(isRulePublic(r)).toBe(false);
  });
});
