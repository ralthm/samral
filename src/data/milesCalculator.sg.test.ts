import { describe, expect, it } from "vitest";
import {
  banks,
  conversionRules,
  getBanksByCountry,
  getCardById,
  getCardGroupById,
  getCountryForCard,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardProductById,
  isConversionUnverifiedCard,
  isDirectEarnCard,
  summaryCounters,
} from "./milesCalculator";
import { calculateEntry } from "@/lib/milesCalculator";
import { runCalculation } from "@/lib/calculatorPipeline";

function route(cardGroupId: string, programmeId: string, points: number) {
  const rs = calculateEntry({ entryId: `e-${cardGroupId}-${programmeId}`, cardGroupId, bankPoints: points });
  return rs.find((r) => r.programmeId === programmeId);
}

function expectTransfer(
  cardGroupId: string,
  programmeId: string,
  points: number,
  expected: { miles: number; used: number; left: number },
) {
  const r = route(cardGroupId, programmeId, points);
  expect(r, `${cardGroupId} -> ${programmeId} should be a public route`).toBeTruthy();
  expect(r!.partnerPointsReceived).toBe(expected.miles);
  expect(r!.bankPointsUsed).toBe(expected.used);
  expect(r!.bankPointsRemaining).toBe(expected.left);
}

/* ---------------- Country scoping ---------------- */

describe("country scoping", () => {
  it("keeps Malaysian and Singapore banks in separate lists", () => {
    const my = getBanksByCountry("MY").map((b) => b.id);
    const sg = getBanksByCountry("SG").map((b) => b.id);
    expect(my).toContain("maybank");
    expect(my).not.toContain("dbs-sg");
    expect(sg).toContain("dbs-sg");
    expect(sg).not.toContain("maybank");
    expect(my.some((id) => sg.includes(id))).toBe(false);
  });

  it("covers the nine V1 Singapore issuers", () => {
    const sg = getBanksByCountry("SG").map((b) => b.id).sort();
    expect(sg).toEqual(
      ["amex-sg", "boc-sg", "citi-sg", "dbs-sg", "hsbc-sg", "maybank-sg", "ocbc-sg", "sc-sg", "uob-sg"].sort(),
    );
  });

  it("derives a card's country from its issuer", () => {
    expect(getCountryForCard(getCardById("sg-dbs-altitude-visa"))).toBe("SG");
    expect(getCountryForCard(getCardById("mbb-the-platinum-card"))).toBe("MY");
  });

  it("scopes hero counters per country", () => {
    const my = summaryCounters("MY");
    const sg = summaryCounters("SG");
    const all = summaryCounters();
    expect(my.banks).toBeGreaterThan(0);
    expect(sg.banks).toBeGreaterThan(0);
    expect(all.routes).toBe(my.routes + sg.routes);
  });

  it("gives every bank a country", () => {
    for (const b of banks) expect(["MY", "SG"]).toContain(b.country);
  });
});

/* ---------------- DBS ---------------- */

describe("DBS Points", () => {
  it("5,000 DBS -> 10,000 KrisFlyer", () => expectTransfer("cg-dbs-sg-points", "krisflyer", 5_000, { miles: 10_000, used: 5_000, left: 0 }));
  it("4,999 DBS -> 0 KrisFlyer", () => expectTransfer("cg-dbs-sg-points", "krisflyer", 4_999, { miles: 0, used: 0, left: 4_999 }));
  it("12,500 DBS -> 20,000 KrisFlyer with 2,500 left", () =>
    expectTransfer("cg-dbs-sg-points", "krisflyer", 12_500, { miles: 20_000, used: 10_000, left: 2_500 }));
  it("500 DBS -> 1,500 airasia points", () => expectTransfer("cg-dbs-sg-points", "airasia", 500, { miles: 1_500, used: 500, left: 0 }));
  it("22,500 DBS -> 40,000 KrisFlyer with 2,500 left", () =>
    expectTransfer("cg-dbs-sg-points", "krisflyer", 22_500, { miles: 40_000, used: 20_000, left: 2_500 }));
  it("carries the S$27.25 administrative fee", () => {
    const r = route("cg-dbs-sg-points", "krisflyer", 5_000)!;
    expect(r.transferFeeAmount).toBe(27.25);
    expect(r.transferFeeCurrency).toBe("SGD");
  });
  it("does not present the expired airasia fee waiver as current", () => {
    const r = route("cg-dbs-sg-points", "airasia", 500)!;
    expect(r.transferFeeAmount).toBe(27.25);
    expect(r.notes ?? "").toMatch(/28 February 2026/);
  });
  it("transfers Asia Miles and Qantas on the same block", () => {
    expectTransfer("cg-dbs-sg-points", "asia-miles", 5_000, { miles: 10_000, used: 5_000, left: 0 });
    expectTransfer("cg-dbs-sg-points", "qantas", 5_000, { miles: 10_000, used: 5_000, left: 0 });
  });
});

/* ---------------- UOB ---------------- */

describe("UOB Singapore", () => {
  it("5,000 UNI$ -> 10,000 KrisFlyer", () => expectTransfer("cg-uob-sg-unis", "krisflyer", 5_000, { miles: 10_000, used: 5_000, left: 0 }));
  it("5,000 UNI$ -> 10,000 Asia Miles", () => expectTransfer("cg-uob-sg-unis", "asia-miles", 5_000, { miles: 10_000, used: 5_000, left: 0 }));
  it("7,499 UNI$ -> one block only", () => expectTransfer("cg-uob-sg-unis", "krisflyer", 7_499, { miles: 10_000, used: 5_000, left: 2_499 }));

  it("treats the KrisFlyer UOB Credit Card as direct-earn, not a UNI$ card", () => {
    const card = getCardById("sg-uob-krisflyer");
    expect(isDirectEarnCard(card)).toBe(true);
    expect(calculateEntry({ entryId: "e", cardGroupId: "cg-uob-sg-krisflyer", bankPoints: 50_000 })).toHaveLength(0);
  });
});

/* ---------------- Citi ---------------- */

describe("Citi Singapore", () => {
  it("25,000 ThankYou Points -> 10,000 miles", () => expectTransfer("cg-citi-sg-typ", "krisflyer", 25_000, { miles: 10_000, used: 25_000, left: 0 }));
  it("24,999 ThankYou Points -> 0", () => expectTransfer("cg-citi-sg-typ", "krisflyer", 24_999, { miles: 0, used: 0, left: 24_999 }));
  it("62,000 ThankYou Points -> 20,000 with 12,000 left", () =>
    expectTransfer("cg-citi-sg-typ", "krisflyer", 62_000, { miles: 20_000, used: 50_000, left: 12_000 }));
  it("10,000 Citi Miles -> 10,000 miles", () => expectTransfer("cg-citi-sg-miles", "krisflyer", 10_000, { miles: 10_000, used: 10_000, left: 0 }));
  it("19,999 Citi Miles -> 10,000 with 9,999 left", () =>
    expectTransfer("cg-citi-sg-miles", "krisflyer", 19_999, { miles: 10_000, used: 10_000, left: 9_999 }));

  it("keeps ThankYou Points and Citi Miles as separate currencies", () => {
    const typ = getRewardProductById(getCardGroupById("cg-citi-sg-typ")!.rewardProductId)!;
    const miles = getRewardProductById(getCardGroupById("cg-citi-sg-miles")!.rewardProductId)!;
    expect(typ.id).not.toBe(miles.id);
    expect(typ.rewardCurrencyName).toBe("Citi ThankYou Points");
    expect(miles.rewardCurrencyName).toBe("Citi Miles");
    // The same 25,000 balance yields very different results per currency.
    expect(route("cg-citi-sg-typ", "krisflyer", 25_000)!.partnerPointsReceived).toBe(10_000);
    expect(route("cg-citi-sg-miles", "krisflyer", 25_000)!.partnerPointsReceived).toBe(20_000);
  });

  it("supports the published Citi partner list on both currencies", () => {
    const partners = ["krisflyer", "asia-miles", "ba", "qatar", "etihad", "eva", "flying-blue", "qantas", "rop", "turkish", "ihg"];
    for (const p of partners) {
      expect(route("cg-citi-sg-typ", p, 25_000)?.partnerPointsReceived, `TYP ${p}`).toBe(10_000);
      expect(route("cg-citi-sg-miles", p, 10_000)?.partnerPointsReceived, `Citi Miles ${p}`).toBe(10_000);
    }
  });
});

/* ---------------- HSBC ---------------- */

describe("HSBC Singapore Reward Points", () => {
  it("83,400 -> KrisFlyer = 20,000 with 23,400 left", () =>
    expectTransfer("cg-hsbc-sg-points", "krisflyer", 83_400, { miles: 20_000, used: 60_000, left: 23_400 }));
  it("83,400 -> Flying Blue = 30,000 with 8,400 left", () =>
    expectTransfer("cg-hsbc-sg-points", "flying-blue", 83_400, { miles: 30_000, used: 75_000, left: 8_400 }));
  it("never applies one universal HSBC ratio", () => {
    expect(route("cg-hsbc-sg-points", "krisflyer", 100_000)!.bankPointsPerBlock).toBe(30_000);
    expect(route("cg-hsbc-sg-points", "qantas", 100_000)!.bankPointsPerBlock).toBe(25_000);
    expect(route("cg-hsbc-sg-points", "aeroplan", 100_000)!.bankPointsPerBlock).toBe(35_000);
    expect(route("cg-hsbc-sg-points", "jal", 100_000)!.bankPointsPerBlock).toBe(50_000);
    expect(route("cg-hsbc-sg-points", "airasia", 100_000)!.partnerPointsPerBlock).toBe(20_000);
    expect(route("cg-hsbc-sg-points", "fortune-wings", 100_000)!.bankPointsPerBlock).toBe(35_000);
  });
  it("does not calculate partners whose ratio is unverified", () => {
    for (const p of ["qatar", "rop", "turkish", "united", "vietnam", "marriott"]) {
      expect(route("cg-hsbc-sg-points", p, 500_000), `${p} must not be public`).toBeUndefined();
    }
  });
});

/* ---------------- OCBC ---------------- */

describe("OCBC Singapore", () => {
  it("25,000 OCBC$ -> 10,000 KrisFlyer", () => expectTransfer("cg-ocbc-sg-dollars", "krisflyer", 25_000, { miles: 10_000, used: 25_000, left: 0 }));
  it("24,999 OCBC$ -> 0", () => expectTransfer("cg-ocbc-sg-dollars", "krisflyer", 24_999, { miles: 0, used: 0, left: 24_999 }));
  it("VOYAGE Miles convert 1:1 to KrisFlyer", () => expectTransfer("cg-ocbc-sg-voyage", "krisflyer", 10_000, { miles: 10_000, used: 10_000, left: 0 }));

  it("keeps OCBC$, 90°N and VOYAGE as separate currencies", () => {
    const ids = ["cg-ocbc-sg-dollars", "cg-ocbc-sg-90n", "cg-ocbc-sg-voyage"].map(
      (g) => getCardGroupById(g)!.rewardProductId,
    );
    expect(new Set(ids).size).toBe(3);
  });

  it("does not apply the OCBC$ rate to 90°N Miles", () => {
    expect(getPublicRulesForCardGroup("cg-ocbc-sg-90n")).toHaveLength(0);
    expect(isConversionUnverifiedCard(getCardById("sg-ocbc-90n"))).toBe(true);
    expect(getCardGroupById("cg-ocbc-sg-90n")!.unverifiedNotice).toMatch(/pending verification/i);
  });

  it("does not calculate OCBC$ partners that are not verified", () => {
    for (const p of ["flying-blue", "ba", "etihad", "asia-miles", "united", "accor", "ihg", "marriott"]) {
      expect(route("cg-ocbc-sg-dollars", p, 500_000), `${p}`).toBeUndefined();
    }
  });
});

/* ---------------- American Express ---------------- */

describe("American Express Singapore Membership Rewards", () => {
  it("Platinum: 500 -> 250 KrisFlyer", () => expectTransfer("cg-amex-sg-platinum", "krisflyer", 500, { miles: 250, used: 500, left: 0 }));
  it("Platinum: 499 -> 0", () => expectTransfer("cg-amex-sg-platinum", "krisflyer", 499, { miles: 0, used: 0, left: 499 }));
  it("Platinum: 1,000 -> 500", () => expectTransfer("cg-amex-sg-platinum", "krisflyer", 1_000, { miles: 500, used: 1_000, left: 0 }));
  it("Other eligible MR card: 550 -> 250", () => expectTransfer("cg-amex-sg-standard", "krisflyer", 550, { miles: 250, used: 550, left: 0 }));
  it("Other eligible MR card: 549 -> 0", () => expectTransfer("cg-amex-sg-standard", "krisflyer", 549, { miles: 0, used: 0, left: 549 }));
  it("Other eligible MR card: 1,100 -> 500", () => expectTransfer("cg-amex-sg-standard", "krisflyer", 1_100, { miles: 500, used: 1_100, left: 0 }));

  it("never confuses Platinum and standard schedules", () => {
    expect(route("cg-amex-sg-platinum", "krisflyer", 550)!.bankPointsPerBlock).toBe(500);
    expect(route("cg-amex-sg-standard", "krisflyer", 550)!.bankPointsPerBlock).toBe(550);
  });

  it("never uses the pre-23-February-2026 450 -> 250 rate", () => {
    const amex = conversionRules.filter((r) => r.eligibleCardGroupId.startsWith("cg-amex-sg-"));
    expect(amex.length).toBeGreaterThan(0);
    for (const r of amex) expect(r.bankPointsPerBlock).not.toBe(450);
  });

  it("covers the standard airline partner group on both schedules", () => {
    for (const p of ["ba", "asia-miles", "eva", "enrich", "qantas", "krisflyer", "rop"]) {
      expect(route("cg-amex-sg-platinum", p, 500)?.partnerPointsReceived, `plat ${p}`).toBe(250);
      expect(route("cg-amex-sg-standard", p, 550)?.partnerPointsReceived, `std ${p}`).toBe(250);
    }
  });

  it("treats Emirates Skywards as suspended", () => {
    expect(route("cg-amex-sg-platinum", "emirates", 100_000)).toBeUndefined();
    expect(route("cg-amex-sg-standard", "emirates", 100_000)).toBeUndefined();
    const suspended = conversionRules.filter((r) => r.loyaltyProgrammeId === "emirates" && r.eligibleCardGroupId.startsWith("cg-amex-sg-"));
    expect(suspended).toHaveLength(2);
    for (const r of suspended) expect(r.status).toBe("temporarily_unavailable");
  });
});

/* ---------------- Standard Chartered ---------------- */

describe("Standard Chartered Singapore 360° Rewards", () => {
  it("25,000 -> 10,000 KrisFlyer", () => expectTransfer("cg-sc-sg-360", "krisflyer", 25_000, { miles: 10_000, used: 25_000, left: 0 }));
  it("24,999 -> 0", () => expectTransfer("cg-sc-sg-360", "krisflyer", 24_999, { miles: 0, used: 0, left: 24_999 }));
  it("62,000 -> 20,000 with 12,000 left", () => expectTransfer("cg-sc-sg-360", "krisflyer", 62_000, { miles: 20_000, used: 50_000, left: 12_000 }));
  it("carries the S$27.25 fee and no unverified airline partners", () => {
    expect(route("cg-sc-sg-360", "krisflyer", 25_000)!.transferFeeAmount).toBe(27.25);
    expect(getPublicRulesForCardGroup("cg-sc-sg-360")).toHaveLength(1);
  });
});

/* ---------------- Maybank Singapore ---------------- */

describe("Maybank Singapore TREATS Points", () => {
  it("is not calculable until each transfer block is verified", () => {
    expect(getPublicRulesForCardGroup("cg-maybank-sg-treats")).toHaveLength(0);
    expect(getCardGroupById("cg-maybank-sg-treats")!.unverifiedHeadline).toMatch(/awaiting verification/i);
    expect(isConversionUnverifiedCard(getCardById("sg-mbb-horizon"))).toBe(true);
  });

  it("keeps Singapore TREATS Points separate from Malaysian TreatsPoints", () => {
    const sgProduct = getRewardProductById(getCardGroupById("cg-maybank-sg-treats")!.rewardProductId)!;
    expect(sgProduct.bankId).toBe("maybank-sg");
    const myRules = conversionRules.filter((r) => r.eligibleCardGroupId === "cg-mbb-treats-premium");
    expect(myRules.length).toBeGreaterThan(0);
    for (const r of myRules) expect(r.eligibleCardGroupId).not.toBe("cg-maybank-sg-treats");
  });
});

/* ---------------- Bank of China ---------------- */

describe("Bank of China Singapore", () => {
  it("Elite Miles: 50,000 -> 10,000 KrisFlyer", () => expectTransfer("cg-boc-sg-elite", "krisflyer", 50_000, { miles: 10_000, used: 50_000, left: 0 }));
  it("Other eligible BOC card: 60,000 -> 10,000 KrisFlyer", () =>
    expectTransfer("cg-boc-sg-standard", "krisflyer", 60_000, { miles: 10_000, used: 60_000, left: 0 }));
  it("does not apply the Elite Miles rate to other BOC cards", () => {
    expect(route("cg-boc-sg-standard", "krisflyer", 50_000)!.partnerPointsReceived).toBe(0);
    expect(route("cg-boc-sg-elite", "krisflyer", 50_000)!.partnerPointsReceived).toBe(10_000);
  });
});

/* ---------------- Multi-bank aggregation ---------------- */

describe("Singapore multi-bank aggregation into KrisFlyer", () => {
  const entry = (id: string, bankId: string, cardId: string, rawInput: string) => {
    const card = getCardById(cardId)!;
    return { id, bankId, cardId, cardGroupId: card.cardGroupId, notFound: false, nickname: "", rawInput };
  };

  const snapshot = runCalculation(
    [
      entry("e1", "dbs-sg", "sg-dbs-altitude-visa", "22500"),
      entry("e2", "hsbc-sg", "sg-hsbc-travelone", "83400"),
      entry("e3", "citi-sg", "sg-citi-rewards", "62000"),
    ],
    [{ id: "x1", programmeId: "krisflyer", rawInput: "18000" }],
  );

  const kf = snapshot.portfolio.find((p) => p.programmeId === "krisflyer")!;

  it("floors each source separately", () => {
    const byEntry = new Map(snapshot.results.filter((r) => r.programmeId === "krisflyer").map((r) => [r.entryId, r]));
    expect(byEntry.get("e1")!.partnerPointsReceived).toBe(40_000);
    expect(byEntry.get("e2")!.partnerPointsReceived).toBe(20_000);
    expect(byEntry.get("e3")!.partnerPointsReceived).toBe(20_000);
  });

  it("retains each leftover separately", () => {
    const byEntry = new Map(snapshot.results.filter((r) => r.programmeId === "krisflyer").map((r) => [r.entryId, r]));
    expect(byEntry.get("e1")!.bankPointsRemaining).toBe(2_500);
    expect(byEntry.get("e2")!.bankPointsRemaining).toBe(23_400);
    expect(byEntry.get("e3")!.bankPointsRemaining).toBe(12_000);
  });

  it("aggregates only after each transfer is calculated, then adds the existing balance", () => {
    expect(kf.transferredTotal).toBe(80_000);
    expect(kf.existingBalance).toBe(18_000);
    expect(kf.potentialTotal).toBe(98_000);
  });

  it("loses no source points", () => {
    for (const r of snapshot.results.filter((x) => x.programmeId === "krisflyer")) {
      expect(r.bankPointsUsed + r.bankPointsRemaining).toBe(r.bankPointsEntered);
    }
  });

  it("distinguishes existing balance from transferable balance", () => {
    expect(kf.transferredFromEntries).toHaveLength(3);
    expect(kf.existingBalance).not.toBe(kf.transferredTotal);
  });
});

/* ---------------- Dataset integrity ---------------- */

describe("Singapore dataset integrity", () => {
  const sgBankIds = new Set(getBanksByCountry("SG").map((b) => b.id));
  const sgRules = conversionRules.filter((r) => {
    const g = getCardGroupById(r.eligibleCardGroupId);
    const p = g ? getRewardProductById(g.rewardProductId) : undefined;
    return !!p && sgBankIds.has(p.bankId);
  });

  it("stamps every verified Singapore route with the audit date", () => {
    for (const r of sgRules.filter((x) => x.status === "verified")) {
      expect(r.verifiedOn, r.id).toBe("2026-08-27");
      expect(r.sourceUrl, r.id).toMatch(/^https:\/\//);
    }
  });

  it("never lets an unverified route reach a calculation", () => {
    for (const r of sgRules.filter((x) => x.status !== "verified")) {
      expect(getPublicRulesForCardGroup(r.eligibleCardGroupId).some((x) => x.id === r.id), r.id).toBe(false);
    }
  });

  it("points every route at a known loyalty programme", () => {
    for (const r of sgRules) expect(getProgrammeById(r.loyaltyProgrammeId), r.id).toBeTruthy();
  });

  it("uses unique rule ids across both countries", () => {
    const ids = conversionRules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
