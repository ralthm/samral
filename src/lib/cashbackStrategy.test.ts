import { describe, expect, it } from "vitest";
import { evaluateCashback, rankCashback } from "./cashbackStrategy";
import type { CashbackProduct } from "@/data/cashbackCards";

const card: CashbackProduct = { id: "test", name: "Test rules", bankId: "test", country: "SG", status: "verified", baseRatePercent: 1.7, annualFee: 100, rules: [], exclusions: ["Insurance"], requirements: [], sourceUrls: ["https://issuer.example/terms"], verifiedOn: "2026-10-22", rounding: "monthly_cent_nearest" };
const profile = { monthlySpend: 3000, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: true, requirementsConfirmed: true };
const today = "2026-10-22";
describe("issuer cashback rules", () => {
  it("applies no category bonus to an explicit all-other provisional spending assumption", () => {
    const conditional = { ...card, rules: [{ categories: ["dining" as const], ratePercent: 5, fallbackPercent: 1.7 }] };
    const unknownBreakdown = { ...profile, categories: {}, categoriesConfirmed: false };
    expect(rankCashback([conditional], unknownBreakdown, today)).toEqual([]);
    expect(evaluateCashback(conditional, { ...unknownBreakdown, categoriesConfirmed: true }, today).grossAnnual).toBe(612);
    expect(evaluateCashback(conditional, { ...profile, categories: { dining: 1000 } }, today).grossAnnual).toBe(1008);
  });
  it("deducts the standard annual fee once", () => expect(evaluateCashback(card, profile, today).netAnnual).toBe(512));
  it("excludes transactions before earning", () => expect(evaluateCashback(card, { ...profile, excludedMonthlySpend: 1000 }, today).grossAnnual).toBe(408));
  it("applies a total monthly cap twelve times", () => expect(evaluateCashback({ ...card, monthlyCap: 20 }, profile, today).grossAnnual).toBe(240));
  it("falls back to base below the eligible spending threshold", () => expect(evaluateCashback({ ...card, minimumMonthlySpend: 3500, rules: [{ categories: ["dining"], ratePercent: 10, fallbackPercent: 1.7 }] }, { ...profile, categories: { dining: 1000 } }, today).grossAnnual).toBe(612));
  it("caps a grouped category rather than independently per category", () => expect(evaluateCashback({ ...card, rules: [{ categories: ["dining", "groceries"], ratePercent: 5, monthlyCap: 30, fallbackPercent: 0 }] }, { ...profile, categories: { dining: 500, groceries: 500 } }, today).grossAnnual).toBe(768));
  it("applies bonus spend caps and fallback", () => expect(evaluateCashback({ ...card, rules: [{ categories: ["online"], ratePercent: 5, monthlySpendCap: 500, fallbackPercent: 1.7 }] }, { ...profile, categories: { online: 1000 } }, today).grossAnnual).toBe(810));
  it("a missing annual fee no longer blocks cashback earning terms", () => expect(evaluateCashback({ ...card, annualFee: undefined }, profile, today).grossAnnual).toBe(612));
  it("uses the lower below-minimum rate and cap when the monthly minimum is missed", () => expect(evaluateCashback({ ...card, minimumMonthlySpend: 2000, belowMinimumPercent: 0.2, belowMinimumMonthlyCap: 2 }, { ...profile, monthlySpend: 1500 }, today).grossAnnual).toBe(24));
  it("does not rank stale or review records", () => expect(rankCashback([{ ...card, verifiedOn: "2025-01-01" }, { ...card, status: "needs_review" }], profile, today)).toEqual([]));
  it("requires the spending breakdown for conditional cards", () => expect(evaluateCashback({ ...card, rules: [{ categories: ["dining"], ratePercent: 5, fallbackPercent: 0 }] }, { ...profile, categoriesConfirmed: false }, today).netAnnual).toBeNull());
  it("requires confirmation of non-spending qualification", () => expect(evaluateCashback({ ...card, requirements: ["Contactless payment required"] }, { ...profile, requirementsConfirmed: false }, today).netAnnual).toBeNull());
  it("rejects categories exceeding eligible spending", () => expect(evaluateCashback(card, { ...profile, categories: { dining: 4000 } }, today).netAnnual).toBeNull());
  it("orders by net annual value, not advertised rate", () => expect(rankCashback([card, { ...card, id: "expensive", baseRatePercent: 2, annualFee: 500 }], profile, today).map(r => r.card.id)).toEqual(["test", "expensive"]));
  it("does not infer other issuers’ eligibility from UOB reduced-rate transactions", () => expect(evaluateCashback(card, { ...profile, categories: { reduced: 100 } }, today).netAnnual).toBeNull());
});