import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cashbackProducts } from "./cashbackCards";
import { evaluateCashback, completeCashbackTerms } from "../lib/cashbackStrategy";
import { compareRewards } from "../lib/rewardComparison";
import { usableMilesCards, usableMilesTerms, transferForCard, destinationsFor, comparisonTargets } from "./rewardComparison";
import { rewardScenario } from "./rewardScenarios";

const today = "2026-10-22";
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-22T12:00:00Z")); });
afterEach(() => vi.useRealTimers());
const ambank = cashbackProducts.find(c => c.id === "my-ambank-cash-rebate")!;
const profile = (monthlySpend: number, categories = {}) => ({ monthlySpend, excludedMonthlySpend: 0, categories, categoriesConfirmed: true, requirementsConfirmed: true });

describe("Malaysian cashback", () => {
  it("AmBank caps each 10% category at RM10, then 0.2%", () => {
    // dining 500: 10 cap + 0.2% of 400 = 10.80; other 1500 at 0.2% = 3.00
    expect(evaluateCashback(ambank, profile(2000, { dining: 500 }), today).grossAnnual).toBe(165.6);
  });
  it("AmBank pays only 0.2% below the RM1,500 threshold", () => {
    expect(evaluateCashback(ambank, profile(1400, { dining: 500 }), today).grossAnnual).toBe(33.6);
  });
  it("every listed Malaysian cashback card has complete current terms", () => {
    for (const card of cashbackProducts.filter(c => c.country === "MY" && !["my-maybank-fcb", "my-amex-cashback-gold", "my-cimb-petronas-vi", "my-cimb-petronas-vp"].includes(c.id))) expect(completeCashbackTerms(card, today), card.id).toBe(true);
  });
});

describe("Malaysian miles", () => {
  it("only verified Malaysian cards appear in the main list", () => {
    expect(usableMilesCards("MY").map(c => c.id).sort()).toEqual(["hlb-infinite", "hsbc-travelone", "mbb-m2-platinum", "mbb-visa-infinite", "uob-prvi-elite"]);
    expect(usableMilesTerms("hsbc-travelone", "SG")).toBeUndefined();
  });
  const miles = (id: string, programme: string) => compareRewards({ monthlySpend: 3000, cashbackPercent: 0.2, earningRate: usableMilesTerms(id, "MY")!.ratePerDollar,
    transfer: transferForCard(id, programme), ...rewardScenario("MY", "Tokyo", "Economy", programme) }).annualMiles;
  it("HSBC TravelOne uses different ratios per programme", () => {
    expect(miles("hsbc-travelone", "enrich")).toBe(1714); // 36,000 / 21
    expect(miles("hsbc-travelone", "krisflyer")).toBe(1440); // 36,000 / 25
  });
  it("bank points are not treated as miles one-to-one", () => {
    expect(miles("uob-prvi-elite", "enrich")).toBe(3000); // 36,000 UNIRM in 12,000 blocks
    expect(miles("mbb-m2-platinum", "enrich")).toBe(1000); // 36,000 TreatsPoints, one 20,000 block
  });
  it("Hong Leong Infinite earns Enrich directly at 1 per RM6", () => {
    expect(compareRewards({ monthlySpend: 3000, cashbackPercent: 0, earningRate: 1 / 6 }).annualMiles).toBeCloseTo(6000);
  });
});

describe("country switching and fee-excluded break-even", () => {
  it("Singapore is a Malaysia-only destination with a Kuala Lumpur origin award", () => {
    expect(destinationsFor("MY").some(d => d.name === "Singapore")).toBe(true);
    expect(destinationsFor("SG").some(d => d.name === "Singapore")).toBe(false);
    expect(comparisonTargets("MY", "Singapore", "Economy", "enrich")[0]?.originAirport).toBe("KUL");
  });
  it("break-even uses cashback plus transfer charge only", () => {
    const r = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4, cashFare: 1100, awardTaxes: 100, awardMiles: 51000 });
    expect(r.netCashback).toBe(612);
    expect(r.breakEvenCents).toBeCloseTo(1.214, 3);
  });
});

const run = (id: string, programme: string, monthlySpend: number) => compareRewards({ monthlySpend, cashbackPercent: 0.2, earningRate: usableMilesTerms(id, "MY")!.ratePerDollar,
  transfer: transferForCard(id, programme), ...rewardScenario("MY", "Tokyo", "Economy", programme) });
describe("realistic Malaysian spending: points → transferable miles → leftovers", () => {
  it.each([
    ["hsbc-travelone", "enrich", 3000, 36000, 1714, 6],
    ["hsbc-travelone", "asia-miles", 3000, 36000, 1440, 0],
    ["uob-prvi-elite", "enrich", 2500, 30000, 2000, 6000],
    ["mbb-m2-platinum", "enrich", 3000, 36000, 1000, 16000],
    ["mbb-visa-infinite", "krisflyer", 3000, 72000, 5000, 9500],
  ])("%s → %s at RM%i/month", (id, programme, spend, raw, usable, left) => {
    const r = run(id as string, programme as string, spend as number);
    expect(r.rawAnnualRewards).toBe(raw);
    expect(r.annualMiles).toBe(usable);
    expect(r.untransferredRewards).toBe(left);
    expect(r.grossMilesValue).toBeGreaterThan(0);
  });
  it("Hong Leong Infinite earns 6,000 Enrich points at RM3,000/month with nothing left over", () => {
    const r = compareRewards({ monthlySpend: 3000, cashbackPercent: 0, earningRate: usableMilesTerms("hlb-infinite", "MY")!.ratePerDollar, ...rewardScenario("MY", "Tokyo", "Economy", "enrich") });
    expect(r.annualMiles).toBeCloseTo(6000);
    expect(r.untransferredRewards).toBe(0);
  });
  it("points below one transfer block are never usable miles", () => {
    expect(run("mbb-m2-platinum", "enrich", 1500).annualMiles).toBe(0); // 18,000 < 20,000
    expect(run("uob-prvi-elite", "enrich", 900).annualMiles).toBe(0); // 10,800 < 12,000
  });
  it("Maybank 2 Platinum does not offer KrisFlyer while its published block differs", () => {
    expect(usableMilesTerms("mbb-m2-platinum", "MY")?.supportedProgrammes).toEqual(["enrich", "asia-miles"]);
  });
});

describe("AFFIN DUO Visa Cash Back", () => {
  const affin = cashbackProducts.find(c => c.id === "my-affin-duo-cashback")!;
  it("earns nothing on uncategorised spending", () => expect(evaluateCashback(affin, profile(3000), today).grossAnnual).toBe(0));
  it("3% on online spending", () => expect(evaluateCashback(affin, profile(3000, { online: 500 }), today).grossAnnual).toBe(180));
  it("e-wallet sub-cap RM30 sits inside the RM30 overall cap", () => expect(evaluateCashback(affin, profile(3000, { online: 800, ewallet: 1500 }), today).grossAnnual).toBe(360));
  it("other issuers never give their base rate to e-wallet spending", () => expect(evaluateCashback(ambank, profile(2000, { ewallet: 300 }), today).grossAnnual).toBeNull());
});

const card = (id: string) => cashbackProducts.find(c => c.id === id)!;
const annual = (id: string, spend: number, categories = {}) => evaluateCashback(card(id), profile(spend, categories), today).grossAnnual;
describe("Maybank 2 American Express (weekend 5%, RM50 cap)", () => {
  it("no weekend breakdown earns nothing", () => expect(annual("my-maybank-2-amex", 3000)).toBe(0));
  it("5% on weekend spending", () => expect(annual("my-maybank-2-amex", 3000, { weekend: 600 })).toBe(360));
  it("cap reached at RM1,000 weekend spend; beyond earns nothing", () => expect(annual("my-maybank-2-amex", 3000, { weekend: 1500 })).toBe(600));
  it("e-wallet reloads are ineligible", () => expect(annual("my-maybank-2-amex", 3000, { ewallet: 200 })).toBeNull());
});
describe("CIMB Cash Rebate Platinum (2%/5%, shared RM30 cap, whole-ringgit rounding)", () => {
  it("2% below RM3,000 plus 0.2% other, rounded down", () => expect(annual("my-cimb-cash-rebate", 2000, { groceries: 500, petrol: 300 })).toBe(216));
  it("5% at RM3,000+ capped at RM30 across categories", () => expect(annual("my-cimb-cash-rebate", 3500, { groceries: 500, petrol: 300 })).toBe(420));
  it("general spending only earns 0.2%", () => expect(annual("my-cimb-cash-rebate", 3500)).toBe(84));
  it("dining has no bonus and earns 0.2%", () => expect(annual("my-cimb-cash-rebate", 2000, { dining: 1000 })).toBe(48));
});
describe("Public Bank Quantum Visa (1% contactless RM100+, RM20 cap)", () => {
  it("other spending earns no cashback", () => expect(annual("my-pb-quantum-visa", 3000)).toBe(0));
  it("1% on qualifying contactless", () => expect(annual("my-pb-quantum-visa", 3000, { contactless: 1000 })).toBe(120));
  it("cap and beyond-cap spending", () => expect(annual("my-pb-quantum-visa", 3000, { contactless: 3000 })).toBe(240));
  it("petrol is ineligible", () => expect(annual("my-pb-quantum-visa", 3000, { petrol: 100 })).toBeNull());
});
describe("RHB Shell Visa / Visa-i (tiered by total spend, category minimums and caps)", () => {
  it("below RM1,000 earns nothing", () => expect(annual("my-rhb-shell-visa", 900, { petrol: 300 })).toBe(0));
  it("tier 2: Shell 5%; groceries under RM250 minimum earn nothing; other 0.2%", () => expect(annual("my-rhb-shell-visa", 2500, { petrol: 300, groceries: 200 })).toBe(228));
  it("tier 3 caps: Shell RM30, groceries RM10, online RM10", () => expect(annual("my-rhb-shell-visa", 3500, { petrol: 400, groceries: 300, online: 600 })).toBe(652.8));
  it("other spending below its RM500 minimum earns nothing", () => expect(annual("my-rhb-shell-visa", 1200, { petrol: 800 })).toBe(288));
  it("weekend split has no RHB rule", () => expect(annual("my-rhb-shell-visa", 2000, { weekend: 100 })).toBeNull());
});
describe("AmBank and AFFIN thresholds", () => {
  it("AmBank spending beyond each RM100 bonus band earns 0.2%", () => expect(annual("my-ambank-cash-rebate", 1500, { dining: 1500 })).toBe(153.6));
  it("annual figures are twelve months with no annual fee", () => {
    const r = evaluateCashback(card("my-affin-duo-cashback"), profile(3000, { online: 500 }), today);
    expect(r.grossAnnual).toBe(180); expect(r.grossAnnual).toBe((r.netAnnual ?? 0));
  });
});


it("cards with unconfirmed terms never calculate", () => {
  for (const id of ["my-maybank-fcb", "my-amex-cashback-gold", "my-cimb-petronas-vi", "my-cimb-petronas-vp"]) expect(annual(id, 3000)).toBeNull();
});

describe("UOB ONE (per-category caps, statement-month threshold)", () => {
  it("Platinum below RM1,500: 0.2% on everything", () => expect(annual("my-uob-one-platinum", 1400, { petrol: 300 })).toBe(33.6));
  it("Platinum caps each category at RM15; extra spend earns nothing", () => expect(annual("my-uob-one-platinum", 2000, { petrol: 300, dining: 100 })).toBe(337.2));
  it("Classic threshold RM800 and RM10 caps", () => expect(annual("my-uob-one-classic", 1000, { grab: 200, groceries: 50 })).toBe(186));
  it("e-wallet top-ups (other than GrabPay) are ineligible", () => expect(annual("my-uob-one-classic", 1000, { ewallet: 100 })).toBeNull());
});
