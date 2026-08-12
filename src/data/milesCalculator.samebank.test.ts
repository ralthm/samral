import { describe, expect, it } from "vitest";
import { calculateEntry, computePortfolioTotals } from "@/lib/milesCalculator";

/**
 * Two entries from the SAME bank using the SAME rewards currency (UOB UNIRM).
 * Conversion blocks are modelled per card entry, so each entry must floor its
 * own balance and keep its own leftover. The aggregate figures shown in the UI
 * must be exact sums of those per-entry numbers — never an aggregated
 * conversion whose remainder is split back across cards.
 */
describe("same bank, same rewards currency — per-entry blocks and leftovers", () => {
  const entered = { elite: 40_758, infinite: 34_000 }; // awkward, non-divisible combined total

  const results = [
    ...calculateEntry({ entryId: "elite", cardGroupId: "cg-uob-prvi-elite", bankPoints: entered.elite }),
    ...calculateEntry({ entryId: "infinite", cardGroupId: "cg-uob-visa-infinite", bankPoints: entered.infinite }),
  ].filter((r) => r.programmeId === "enrich");

  const elite = results.find((r) => r.entryId === "elite")!;
  const infinite = results.find((r) => r.entryId === "infinite")!;

  it("floors each card independently at 12,000 UNIRM per block", () => {
    expect(elite.bankPointsPerBlock).toBe(12_000);
    expect(elite.fullBlocks).toBe(3);
    expect(elite.bankPointsUsed).toBe(36_000);
    expect(elite.bankPointsRemaining).toBe(4_758);

    expect(infinite.fullBlocks).toBe(2);
    expect(infinite.bankPointsUsed).toBe(24_000);
    expect(infinite.bankPointsRemaining).toBe(10_000);
  });

  it("aggregate used and remaining are exact sums of the per-entry figures", () => {
    const totalEntered = entered.elite + entered.infinite;
    const used = elite.bankPointsUsed + infinite.bankPointsUsed;
    const remaining = elite.bankPointsRemaining + infinite.bankPointsRemaining;

    expect(used).toBe(60_000);
    expect(remaining).toBe(14_758);
    expect(used + remaining).toBe(totalEntered);
  });

  it("does not pool balances: pooled conversion would yield one extra block", () => {
    const pooledBlocks = Math.floor((entered.elite + entered.infinite) / 12_000);
    expect(pooledBlocks).toBe(6);
    expect(elite.fullBlocks + infinite.fullBlocks).toBe(5);
  });

  it("programme total equals the sum of per-entry partner points", () => {
    const totals = computePortfolioTotals(results, {});
    const enrich = totals.find((t) => t.programmeId === "enrich")!;
    expect(enrich.transferredTotal).toBe(elite.partnerPointsReceived + infinite.partnerPointsReceived);
    expect(enrich.transferredFromEntries).toHaveLength(2);
  });
});
