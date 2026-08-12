import { describe, expect, it } from "vitest";
import {
  cards,
  eligibleCardGroups,
  conversionRules,
  getCardById,
  getCardGroupById,
  isConversionEligibleCard,
  isConversionUnverifiedCard,
  isNonConvertibleCard,
} from "./milesCalculator";

const card = (id: string) => {
  const found = getCardById(id);
  expect(found, `card ${id} should exist`).toBeTruthy();
  return found!;
};

const rateFor = (groupId: string, programmeId: string) => {
  const rule = conversionRules.find(
    (r) => r.eligibleCardGroupId === groupId && r.loyaltyProgrammeId === programmeId && r.active,
  );
  expect(rule, `${groupId} -> ${programmeId} rule should exist`).toBeTruthy();
  return [rule!.bankPointsPerBlock, rule!.partnerPointsPerBlock];
};

describe("UOB verified conversion rates", () => {
  const cases: Array<[string, string, number]> = [
    ["uob-privilege-vi", "cg-uob-privilege", 10000],
    ["uob-visa-infinite", "cg-uob-visa-infinite", 12000],
    ["uob-prvi-elite", "cg-uob-prvi-elite", 12000],
    ["uob-metal", "cg-uob-metal", 5000],
  ];

  it.each(cases)("%s converts at the published UNIRM rate", (cardId, groupId, block) => {
    const c = card(cardId);
    expect(c.cardGroupId).toBe(groupId);
    expect(isConversionEligibleCard(c)).toBe(true);
    expect(isConversionUnverifiedCard(c)).toBe(false);
    for (const programme of ["enrich", "krisflyer", "asia-miles"]) {
      expect(rateFor(groupId, programme)).toEqual([block, 1000]);
    }
  });

  it.each(cases)("%s carries official UOB source metadata", (cardId) => {
    const c = card(cardId);
    expect(c.officialSourceUrl).toMatch(/^https:\/\/www\.uob\.com\.my\//);
    expect(c.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("UOB UNIRM cards with an unverified ratio", () => {
  const unirmUnverified = [
    "uob-evol",
    "uob-ladys",
    "uob-lazada",
    "uob-preferred",
    "uob-world-mc",
    "uob-prvi",
    "uob-basic",
  ];

  it.each(unirmUnverified)("%s stays selectable and UNIRM-based", (cardId) => {
    const c = card(cardId);
    expect(cards.some((x) => x.id === cardId)).toBe(true);
    expect(c.cardGroupId).toBe("cg-uob-unirm-unverified");
    const group = getCardGroupById(c.cardGroupId);
    expect(group?.rewardProductId).toBe("uob-unirm");
  });

  it.each(unirmUnverified)("%s is unverified, not non-convertible", (cardId) => {
    const c = card(cardId);
    expect(isConversionUnverifiedCard(c)).toBe(true);
    expect(isNonConvertibleCard(c)).toBe(false);
    expect(isConversionEligibleCard(c)).toBe(false);
  });

  it.each(unirmUnverified)("%s has official source metadata", (cardId) => {
    const c = card(cardId);
    expect(c.officialSourceUrl).toMatch(/^https:\/\/www\.uob\.com\.my\//);
    expect(c.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses the agreed customer-facing explanation", () => {
    const group = getCardGroupById("cg-uob-unirm-unverified");
    expect(group?.unverifiedHeadline).toBe(
      "Air-mile redemption supported; exact rate not yet verified",
    );
    expect(group?.unverifiedNotice).toBe(
      "Air-mile redemption appears to be supported through UOB Rewards+, but Samral has not yet verified the current conversion rate for this card.",
    );
  });

  it("seeds no conversion rules for the unverified group", () => {
    expect(
      conversionRules.filter((r) => r.eligibleCardGroupId === "cg-uob-unirm-unverified"),
    ).toHaveLength(0);
  });
});

describe("UOB cashback cards", () => {
  const cashback = ["uob-one", "uob-simple"];

  it.each(cashback)("%s is non-convertible", (cardId) => {
    const c = card(cardId);
    expect(c.cardGroupId).toBe("cg-uob-cashback");
    expect(isNonConvertibleCard(c)).toBe(true);
    expect(isConversionUnverifiedCard(c)).toBe(false);
    expect(isConversionEligibleCard(c)).toBe(false);
    expect(c.officialSourceUrl).toMatch(/^https:\/\/www\.uob\.com\.my\//);
  });
});

describe("UOB audit invariants", () => {
  it("leaves no UOB card without a card group", () => {
    const orphans = cards.filter((c) => c.bankId === "uob" && !c.cardGroupId);
    expect(orphans).toEqual([]);
  });

  it("keeps every UOB card group active and resolvable", () => {
    const uobGroups = eligibleCardGroups.filter((g) => g.id.startsWith("cg-uob-"));
    for (const g of uobGroups) {
      expect(g.active).toBe(true);
      expect(getCardGroupById(g.id)).toBeTruthy();
    }
  });

  it("classifies every UOB card into exactly one state", () => {
    for (const c of cards.filter((x) => x.bankId === "uob")) {
      const states = [
        isConversionEligibleCard(c),
        isConversionUnverifiedCard(c),
        isNonConvertibleCard(c),
      ].filter(Boolean);
      expect(states, `${c.id} should have one state`).toHaveLength(1);
    }
  });
});
