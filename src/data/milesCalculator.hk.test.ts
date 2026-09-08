import { describe, expect, it } from "vitest";
import {
  COUNTRIES,
  cards,
  conversionRules,
  getBanksByCountry,
  getCardById,
  getCardGroupById,
  getCountryForCard,
  getProgrammeById,
  getPublicRulesForCardGroup,
  isRulePublic,
} from "./milesCalculator";
import { calculateEntry } from "@/lib/milesCalculator";
import { COUNTRY_ORIGINS, targetsForCountry } from "./redemptionTargets";

const hkRules = conversionRules.filter((r) => r.id.startsWith("hk-"));

describe("Hong Kong market registration", () => {
  it("offers Hong Kong in the country selector", () => {
    const hk = COUNTRIES.find((c) => c.code === "HK");
    expect(hk?.name).toBe("Hong Kong");
    expect(hk?.flag).toBe("🇭🇰");
  });

  it("covers the six launch issuers in dropdown order", () => {
    expect(getBanksByCountry("HK").map((b) => b.id)).toEqual([
      "hsbc-hk",
      "amex-hk",
      "citi-hk",
      "dbs-hk",
      "sc-hk",
      "bea-hk",
    ]);
  });

  it("defaults the Hong Kong departure airport to HKG", () => {
    expect(COUNTRY_ORIGINS.HK.map((o) => o.airport)).toEqual(["HKG"]);
  });

  it("never mixes Hong Kong cards into another market", () => {
    expect(getCountryForCard(getCardById("hk-hsbc-everymile"))).toBe("HK");
    const hkBankIds = new Set(getBanksByCountry("HK").map((b) => b.id));
    expect(getBanksByCountry("MY").some((b) => hkBankIds.has(b.id))).toBe(false);
    expect(getBanksByCountry("SG").some((b) => hkBankIds.has(b.id))).toBe(false);
  });

  it("stamps every Hong Kong route with a source and last-verified date", () => {
    expect(hkRules.length).toBeGreaterThan(0);
    for (const r of hkRules) {
      expect(r.sourceUrl).toMatch(/^https:\/\//);
      expect(r.verifiedOn).toBe("2026-09-08");
    }
  });
});

describe("Hong Kong conversion arithmetic", () => {
  const calc = (cardGroupId: string, points: number, programmeId: string) =>
    calculateEntry({ entryId: "e", cardGroupId, bankPoints: points }).find(
      (r) => r.programmeId === programmeId,
    );

  it("HSBC EveryMile converts HK$1 RewardCash into 20 Asia Miles", () => {
    const r = calc("cg-hsbc-hk-everymile", 1_500, "asia-miles")!;
    expect(r.bankPointsPerBlock).toBe(1);
    expect(r.partnerPointsPerBlock).toBe(20);
    expect(r.partnerPointsReceived).toBe(30_000);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("Amex Turbo enforces the 18,000 minimum and 9,000 increments", () => {
    expect(calc("cg-amex-hk-turbo", 17_999, "krisflyer")!.partnerPointsReceived).toBe(0);
    const r = calc("cg-amex-hk-turbo", 30_000, "krisflyer")!;
    expect(r.fullBlocks).toBe(3);
    expect(r.partnerPointsReceived).toBe(1_500);
    expect(r.bankPointsRemaining).toBe(3_000);
    expect(r.transferFeeAmount).toBe(400);
    expect(r.transferFeeCurrency).toBe("HKD");
  });

  it("does not offer Emirates Skywards on Amex Hong Kong", () => {
    const progs = getPublicRulesForCardGroup("cg-amex-hk-turbo").map((r) => r.loyaltyProgrammeId);
    expect(progs).not.toContain("emirates");
  });

  it("Citi premium and standard groups use their own published ratios", () => {
    expect(calc("cg-citi-hk-premium", 36_000, "asia-miles")!.partnerPointsReceived).toBe(3_000);
    expect(calc("cg-citi-hk-standard", 36_000, "asia-miles")!.partnerPointsReceived).toBe(2_400);
  });

  it("leaves the Citi premium fee unstated while Citi's pages conflict", () => {
    const r = calc("cg-citi-hk-premium", 36_000, "asia-miles")!;
    expect(r.transferFeeAmount).toBeUndefined();
    expect(r.notes).toContain("conflict");
    expect(calc("cg-citi-hk-standard", 36_000, "asia-miles")!.transferFeeAmount).toBe(200);
  });

  it("prices the three DBS groups separately", () => {
    expect(calc("cg-dbs-hk-black-world", 100, "asia-miles")!.partnerPointsReceived).toBe(2_000);
    expect(calc("cg-dbs-hk-black-amex", 100, "asia-miles")!.partnerPointsReceived).toBe(1_000);
    expect(calc("cg-dbs-hk-compass", 100, "asia-miles")!.partnerPointsReceived).toBe(1_000);
  });

  it("BEA requires 50,000 Bonus Points before any conversion", () => {
    expect(calc("cg-bea-hk-mileage", 49_000, "asia-miles")!.partnerPointsReceived).toBe(0);
    const r = calc("cg-bea-hk-mileage", 65_000, "asia-miles")!;
    expect(r.partnerPointsReceived).toBe(6_000);
    expect(r.bankPointsRemaining).toBe(5_000);
    expect(r.transferFeeAmount).toBe(300);
  });

  it("Standard Chartered converts 25,000 points into 1,000 Asia Miles", () => {
    expect(calc("cg-sc-hk-360", 60_000, "asia-miles")!.partnerPointsReceived).toBe(2_000);
  });
});

describe("Hong Kong exclusions", () => {
  it("adds no direct-earn Cathay card as a transferable currency", () => {
    const hkCardIds = cards.filter((c) => c.id.startsWith("hk-")).map((c) => c.name.toLowerCase());
    expect(hkCardIds.some((n) => n.includes("cathay"))).toBe(false);
  });

  it("keeps HSBC RewardCash to the EveryMile card only", () => {
    const group = getCardGroupById("cg-hsbc-hk-everymile");
    expect(group).toBeTruthy();
    const hsbcHkCards = cards.filter((c) => c.bankId === "hsbc-hk");
    expect(hsbcHkCards).toHaveLength(1);
    expect(hsbcHkCards[0].cardGroupId).toBe("cg-hsbc-hk-everymile");
  });

  it("resolves every Hong Kong destination programme", () => {
    for (const r of hkRules) {
      expect(getProgrammeById(r.loyaltyProgrammeId), r.id).toBeTruthy();
    }
  });

  it("surfaces no invented Hong Kong redemption opportunities", () => {
    expect(targetsForCountry("HK").filter(isRulePublic as never)).toHaveLength(0);
    expect(targetsForCountry("HK")).toHaveLength(0);
  });
});
