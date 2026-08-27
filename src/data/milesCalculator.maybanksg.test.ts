import { describe, expect, it } from "vitest";
import {
  cards,
  conversionRules,
  getCardGroupById,
  getPublicRulesForCardGroup,
  isRulePublic,
} from "./milesCalculator";
import { calculateConversions } from "@/lib/milesCalculator";

const GROUP = "cg-maybank-sg-treats";
const MBB_SG_RULES = conversionRules.filter((r) => r.eligibleCardGroupId === GROUP);

describe("Maybank Singapore TREATS Points", () => {
  it("stores the four confirmed programmes as supported_unverified", () => {
    expect(MBB_SG_RULES.map((r) => r.loyaltyProgrammeId).sort()).toEqual([
      "airasia",
      "asia-miles",
      "enrich",
      "krisflyer",
    ]);
    for (const r of MBB_SG_RULES) expect(r.status).toBe("supported_unverified");
  });

  it("never exposes a transfer block or a public rule", () => {
    for (const r of MBB_SG_RULES) {
      expect(isRulePublic(r)).toBe(false);
      expect(r.bankPointsPerBlock).toBe(0);
      expect(r.partnerPointsPerBlock).toBe(0);
    }
    expect(getPublicRulesForCardGroup(GROUP)).toHaveLength(0);
  });

  it("contributes no mileage to any calculation", () => {
    const result = calculateConversions({
      entries: [{ cardGroupId: GROUP, bankPoints: 250_000 }],
    } as never);
    const rows = (result as { conversions?: unknown[] }).conversions ?? [];
    expect(rows).toHaveLength(0);
  });

  it("does not reuse Malaysian Maybank rules", () => {
    for (const r of MBB_SG_RULES) {
      expect(r.sourceUrl).toContain("maybank2u.com.sg");
    }
  });

  it("exposes the known details and indicative processing notes", () => {
    const group = getCardGroupById(GROUP)!;
    expect(group.unverifiedHeadline).toBe("Current transfer block awaiting verification");
    expect(group.unverifiedKnownDetails).toEqual([
      "Air-mile redemption supported",
      "Exact current transfer block awaiting verification",
    ]);
    expect(group.processingNotes?.join(" ")).toContain("15 working days");
    expect(group.processingNotes?.join(" ")).toContain("7–14 business days");
  });

  it("stores the S$25 conversion fee on the Maybank Visa Infinite only", () => {
    const vi = cards.find((c) => c.id === "sg-mbb-visa-infinite")!;
    expect(vi.unverifiedKnownDetails?.join(" ")).toContain("S$25 conversion fee");
    expect(vi.unverifiedKnownDetails?.join(" ")).toContain("Diamanté");
    const others = cards.filter(
      (c) => c.cardGroupId === GROUP && c.id !== "sg-mbb-visa-infinite",
    );
    for (const c of others) expect(c.unverifiedKnownDetails).toBeUndefined();
  });
});
