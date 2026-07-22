import { describe, it, expect } from "vitest";
import { calculateEntry } from "@/lib/milesCalculator";
import { cards, getCardGroupById } from "@/data/milesCalculator";

function calc(cardId: string, points: number) {
  const card = cards.find((c) => c.id === cardId);
  if (!card) throw new Error(`Missing card ${cardId}`);
  return calculateEntry({ entryId: "e", cardGroupId: card.cardGroupId, bankPoints: points });
}

describe("Standard Chartered — Enrich conversion", () => {
  it("Journey Credit Card: 163,000 Journey Miles -> 81,000 Enrich, 1,000 remaining", () => {
    const [r] = calc("sc-journey", 163_000);
    expect(r.programmeId).toBe("enrich");
    expect(r.bankPointsPerBlock).toBe(2000);
    expect(r.partnerPointsPerBlock).toBe(1000);
    expect(r.fullBlocks).toBe(81);
    expect(r.partnerPointsReceived).toBe(81_000);
    expect(r.bankPointsUsed).toBe(162_000);
    expect(r.bankPointsRemaining).toBe(1_000);
  });

  it("Priority Banking Visa Infinite: 100,000 -> 14,000 Enrich, 2,000 remaining", () => {
    const [r] = calc("sc-priority-banking-visa-infinite", 100_000);
    expect(r.bankPointsPerBlock).toBe(7000);
    expect(r.fullBlocks).toBe(14);
    expect(r.partnerPointsReceived).toBe(14_000);
    expect(r.bankPointsUsed).toBe(98_000);
    expect(r.bankPointsRemaining).toBe(2_000);
  });

  it("Visa Infinite: 100,000 -> 14,000 Enrich (shares 7,000 profile)", () => {
    const [r] = calc("sc-visa-infinite", 100_000);
    expect(r.bankPointsPerBlock).toBe(7000);
    expect(r.partnerPointsReceived).toBe(14_000);
  });

  it("Visa Platinum: 100,000 -> 2,000 Enrich, 8,000 remaining", () => {
    const [r] = calc("sc-visa-platinum", 100_000);
    expect(r.bankPointsPerBlock).toBe(46_000);
    expect(r.fullBlocks).toBe(2);
    expect(r.partnerPointsReceived).toBe(2_000);
    expect(r.bankPointsUsed).toBe(92_000);
    expect(r.bankPointsRemaining).toBe(8_000);
  });

  it("Never issues partial blocks", () => {
    const [j] = calc("sc-journey", 1_999);
    expect(j.fullBlocks).toBe(0);
    expect(j.partnerPointsReceived).toBe(0);
    const [p] = calc("sc-visa-platinum", 45_999);
    expect(p.fullBlocks).toBe(0);
    expect(p.partnerPointsReceived).toBe(0);
  });

  it("Pending-verification cards do not produce a public rule", () => {
    const results = calc("sc-platinum-mc-basic", 100_000);
    expect(results).toHaveLength(0);
    const beyond = calc("sc-beyond-priority-private", 100_000);
    expect(beyond).toHaveLength(0);
  });

  it("Pending-verification group carries the required notice", () => {
    const g = getCardGroupById("cg-sc-360-unverified");
    expect(g?.unverifiedNotice).toMatch(/pending verification/i);
  });
});
