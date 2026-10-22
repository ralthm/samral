import { describe, expect, it } from "vitest";
import { cashbackProducts } from "./cashbackCards";
import { completeCashbackTerms, evaluateCashback } from "@/lib/cashbackStrategy";
const profile = { monthlySpend: 3000, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: true, requirementsConfirmed: true };
const today = "2026-10-22";
describe("official issuer cashback records", () => {
  it("has unique country-specific identities", () => expect(new Set(cashbackProducts.map(c => c.id)).size).toBe(cashbackProducts.length));
  it("never marks incomplete records verified", () => {
    for (const c of cashbackProducts.filter(c => c.status === "verified")) expect(completeCashbackTerms(c, today)).toBe(true);
  });
  it("applies UOB Absolute 1.7% with standard S$196.20 annual fee", () => {
    const card = cashbackProducts.find(c => c.id === "sg-uob-absolute");
    if (!card) throw new Error("Missing UOB Absolute");
    expect(evaluateCashback(card, profile, today).netAnnual).toBe(415.8);
  });
  it("applies UOB 0.3% reduced rate rather than advertised 1.7%", () => {
    const card = cashbackProducts.find(c => c.id === "sg-uob-absolute");
    if (!card) throw new Error("Missing UOB Absolute");
    expect(evaluateCashback(card, { ...profile, categories: { reduced: 1000 } }, today).grossAnnual).toBe(444);
  });
  it("applies SC Simply Cash 1.5% rather than an outdated 1.7% rate", () => {
    const card = cashbackProducts.find(c => c.id === "sg-sc-simply-cash");
    if (!card) throw new Error("Missing SC Simply Cash");
    expect(evaluateCashback(card, profile, today).netAnnual).toBe(343.8);
  });
  it("does not calculate awaiting-review cards", () => {
    for (const c of cashbackProducts.filter(c => c.status === "needs_review")) expect(evaluateCashback(c, profile, today).netAnnual).toBeNull();
  });
  it("calculates Citi and OCBC at sourced 1.6% less S$196.20", () => {
    for (const id of ["sg-citi-cashback-plus", "sg-ocbc-infinity"]) {
      const card = cashbackProducts.find(c => c.id === id);
      if (!card) throw new Error(`Missing ${id}`);
      expect(evaluateCashback(card, profile, today).netAnnual).toBe(379.8);
    }
  });
});