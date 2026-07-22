import { describe, it, expect } from "vitest";
import {
  auditMaybankInventory,
  EXPECTED_CURRENT_MAYBANK_CARD_COUNT,
  EXPECTED_MAYBANK_CURRENT_CARD_IDS,
  searchCardsInBank,
} from "./milesCalculator";

describe("Maybank inventory audit", () => {
  const report = auditMaybankInventory();

  it("has exactly 35 current-catalogue cards (32 credit + 3 charge)", () => {
    expect(EXPECTED_MAYBANK_CURRENT_CARD_IDS.length).toBe(EXPECTED_CURRENT_MAYBANK_CARD_COUNT);
    expect(report.present).toBe(EXPECTED_CURRENT_MAYBANK_CARD_COUNT);
  });

  it("has no missing expected card IDs", () => {
    expect(report.missingIds).toEqual([]);
  });

  it("has no unexpected current card IDs", () => {
    expect(report.unexpectedIds).toEqual([]);
  });

  it("keeps legacy cards separate from the current catalogue", () => {
    for (const legacyId of report.legacyIds) {
      expect(EXPECTED_MAYBANK_CURRENT_CARD_IDS).not.toContain(legacyId);
    }
  });

  it("does not assign an active conversion profile to unverified legacy cards", () => {
    // The legacy Amex Gold Credit Card must not inherit the current Amex charge-card rates.
    expect(report.unverifiedLegacyIds).toContain("mbb-legacy-amex-gold-credit");
  });
});

describe("Maybank card search", () => {
  const ids = (results: { id: string }[]) => results.map((r) => r.id);

  it("returns the exact standalone Maybank Visa Infinite", () => {
    const results = searchCardsInBank("maybank", "Maybank Visa Infinite");
    expect(ids(results)).toContain("mbb-visa-infinite");
  });

  it("returns the Maybank 2 Cards Premier paired package", () => {
    const results = searchCardsInBank("maybank", "Maybank 2 Cards Premier");
    expect(ids(results)).toContain("mbb-m2-premier");
  });

  it("returns The Platinum Card (premium charge card)", () => {
    const results = searchCardsInBank("maybank", "The Platinum Card");
    expect(ids(results)).toContain("mbb-the-platinum-card");
  });

  it("returns both direct-earning KrisFlyer cards", () => {
    const results = searchCardsInBank("maybank", "KrisFlyer");
    const found = ids(results);
    expect(found).toContain("mbb-sq-krisflyer-plat");
    expect(found).toContain("mbb-sq-krisflyer-gold");
  });

  it("returns both World Elite variants (conventional and Islamic Ikhwan)", () => {
    const results = searchCardsInBank("maybank", "World Elite");
    const found = ids(results);
    expect(found).toContain("mbb-world-elite");
    expect(found).toContain("mbb-islamic-world-elite");
  });

  it("searches across the full inventory, not a truncated slice", () => {
    // Empty query returns every Maybank card, so length must be >= expected + legacy count.
    const all = searchCardsInBank("maybank", "");
    expect(all.length).toBeGreaterThanOrEqual(EXPECTED_CURRENT_MAYBANK_CARD_COUNT);
  });
});
