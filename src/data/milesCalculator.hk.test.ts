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
import { computeTransferFees } from "@/lib/transferFees";
import { COUNTRY_ORIGINS, targetsForCountry } from "./redemptionTargets";

const hkRules = conversionRules.filter((r) => r.id.startsWith("hk-"));

describe("Hong Kong market registration", () => {
  it("offers Hong Kong in the country selector", () => {
    const hk = COUNTRIES.find((c) => c.code === "HK");
    expect(hk?.name).toBe("Hong Kong");
    expect(hk?.flag).toBe("🇭🇰");
  });

  it("covers the seven launch issuers in dropdown order", () => {
    expect(getBanksByCountry("HK").map((b) => b.id)).toEqual([
      "hsbc-hk",
      "amex-hk",
      "citi-hk",
      "dbs-hk",
      "sc-hk",
      "bea-hk",
      "boc-hk",
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

  it("only surfaces Hong Kong redemptions for the three verified programmes", () => {
    const hk = targetsForCountry("HK");
    expect(hk.length).toBeGreaterThan(0);
    expect(new Set(hk.map((t) => t.programmeId))).toEqual(
      new Set(["asia-miles", "krisflyer", "eva"]),
    );
  });
});

describe("Bank of China (Hong Kong)", () => {
  const calc = (cg: string, pts: number, prog: string) =>
    calculateEntry({ entryId: "e", cardGroupId: cg, bankPoints: pts }).find((r) => r.programmeId === prog)!;

  it("needs 15,000 Gift Points before any Asia Miles transfer", () => {
    expect(calc("cg-boc-hk-gift", 14_999, "asia-miles").partnerPointsReceived).toBe(0);
    const r = calc("cg-boc-hk-gift", 22_500, "asia-miles");
    expect(r.partnerPointsReceived).toBe(1_500);
    expect(r.bankPointsRemaining).toBe(0);
  });

  it("converts 8 Gift Points into 1 PhoenixMiles km above the 8,000 minimum", () => {
    expect(calc("cg-boc-hk-gift", 7_999, "phoenixmiles").partnerPointsReceived).toBe(0);
    expect(calc("cg-boc-hk-gift", 12_000, "phoenixmiles").partnerPointsReceived).toBe(1_500);
  });

  it("derives the tiered handling fee from the miles converted, and waives it for the exempt cards", () => {
    // 30,000 Gift Points = 2,000 Asia Miles -> HK$50, lifted to the HK$100 minimum.
    expect(calc("cg-boc-hk-gift", 30_000, "asia-miles").transferFeeAmount).toBe(100);
    // 150,000 Gift Points = 10,000 Asia Miles -> 2 blocks x HK$50 = HK$100.
    expect(calc("cg-boc-hk-gift", 150_000, "asia-miles").transferFeeAmount).toBe(100);
    // 465,000 Gift Points = 31,000 Asia Miles -> 7 blocks x HK$50 = HK$350, capped at HK$300.
    expect(calc("cg-boc-hk-gift", 465_000, "asia-miles").transferFeeAmount).toBe(300);
    // No valid transfer means no fee at all.
    expect(calc("cg-boc-hk-gift", 10_000, "asia-miles").transferFeeAmount).toBe(0);
    expect(calc("cg-boc-hk-gift-waived", 30_000, "asia-miles").transferFeeAmount).toBe(0);
  });

  it("does not offer Eastern Miles while BOCHK has suspended it", () => {
    const progs = getPublicRulesForCardGroup("cg-boc-hk-gift").map((r) => r.loyaltyProgrammeId);
    expect(progs).toEqual(["asia-miles", "phoenixmiles"]);
  });
});

describe("Hong Kong transfer fees", () => {
  const feeRow = (points: number) => {
    const r = calculateEntry({ entryId: "e", cardGroupId: "cg-bea-hk-mileage", bankPoints: points })
      .find((x) => x.programmeId === "asia-miles")!;
    return computeTransferFees([{
      bankId: r.bankId,
      bankName: r.bankName,
      transferFeeAmount: r.transferFeeAmount,
      transferFeeCurrency: r.transferFeeCurrency,
      partnerPointsReceived: r.partnerPointsReceived,
    }]);
  };

  it("charges nothing when BEA cannot meet its 50,000-point minimum", () => {
    const r = calculateEntry({ entryId: "e", cardGroupId: "cg-bea-hk-mileage", bankPoints: 39_000 })
      .find((x) => x.programmeId === "asia-miles")!;
    expect(r.partnerPointsReceived).toBe(0);
    expect(feeRow(39_000).total).toBe(0);
    expect(feeRow(39_000).breakdown).toHaveLength(0);
  });

  it("charges the published HK$300 once a valid conversion happens", () => {
    const fees = feeRow(65_000);
    expect(fees.total).toBe(300);
    expect(fees.currency).toBe("HKD");
  });
});
