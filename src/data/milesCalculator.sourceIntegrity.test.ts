import { describe, expect, it } from "vitest";
import {
  banks,
  conversionRules,
  getBankById,
  getCardGroupById,
  getRewardProductById,
} from "./milesCalculator";

/**
 * Source metadata integrity.
 *
 * Every conversion rule must carry source metadata that belongs to the bank
 * that owns the card group. Cross-bank contamination (e.g. a UOB rule showing
 * "Maybank Service Tax Redemption and Air Miles Conversion Rate") must fail.
 */

/** Hostnames an official source for a given bank may live on. */
const ALLOWED_HOSTS: Record<string, string[]> = {
  maybank: ["www.maybank2u.com.my", "www.maybank.com.my"],
  cimb: ["www.cimb.com.my"],
  alliance: ["www.alliancebank.com.my"],
  uob: ["www.uob.com.my"],
  hsbc: ["www.hsbc.com.my"],
  hlb: ["www.hlb.com.my"],
  affin: ["www.affinalways.com", "www.affinbank.com.my"],
  ambank: ["www.ambank.com.my"],
  publicbank: ["www.pbebank.com"],
  rakyat: ["www.bankrakyat.com.my"],
  sc: ["www.sc.com", "www.malaysiaairlines.com"],
  ocbc: ["www.ocbc.com.my"],
  rhb: ["www.rhbgroup.com"],
};

/** Bank-identifying words that may only appear in that bank's source label. */
const BANK_KEYWORDS: Record<string, string[]> = {
  maybank: ["maybank", "treatspoints"],
  cimb: ["cimb"],
  alliance: ["alliance"],
  uob: ["uob", "uniringgit"],
  hsbc: ["hsbc"],
  hlb: ["hong leong"],
  affin: ["affin"],
  ambank: ["ambank", "ambonus"],
  publicbank: ["public bank", "pb points"],
  rakyat: ["bank rakyat"],
  sc: ["standard chartered"],
  ocbc: ["ocbc"],
  rhb: ["rhb"],
};

function bankOfRule(cardGroupId: string) {
  const group = getCardGroupById(cardGroupId);
  expect(group, `card group ${cardGroupId} should exist`).toBeTruthy();
  const product = getRewardProductById(group!.rewardProductId);
  expect(product, `reward product for ${cardGroupId} should exist`).toBeTruthy();
  const bank = getBankById(product!.bankId);
  expect(bank, `bank for ${cardGroupId} should exist`).toBeTruthy();
  return bank!;
}

const rulesWithBank = conversionRules.map((r) => ({ rule: r, bank: bankOfRule(r.eligibleCardGroupId) }));

describe("conversion rule source metadata integrity", () => {
  it("audits every seeded conversion route", () => {
    expect(conversionRules.length).toBeGreaterThanOrEqual(80);
  });

  it.each(rulesWithBank.map((x) => [x.rule.id, x.bank.id] as const))(
    "%s (%s) has complete source metadata",
    (ruleId, bankId) => {
      const r = conversionRules.find((x) => x.id === ruleId)!;
      expect(r.sourceUrl, `${ruleId} sourceUrl`).toMatch(/^https:\/\//);
      expect(r.sourceTitle?.trim(), `${ruleId} sourceTitle`).toBeTruthy();
      expect(r.verifiedOn, `${ruleId} verifiedOn`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // The displayed label always mirrors this rule's own title.
      expect(r.sourceName, `${ruleId} sourceName`).toBe(r.sourceTitle);
      expect(ALLOWED_HOSTS[bankId], `no allowed hosts configured for ${bankId}`).toBeTruthy();
    },
  );

  it.each(rulesWithBank.map((x) => [x.rule.id, x.bank.id] as const))(
    "%s source URL is hosted by %s",
    (ruleId, bankId) => {
      const r = conversionRules.find((x) => x.id === ruleId)!;
      const host = new URL(r.sourceUrl).hostname;
      expect(ALLOWED_HOSTS[bankId], `${ruleId} -> ${host}`).toContain(host);
    },
  );

  it.each(rulesWithBank.map((x) => [x.rule.id, x.bank.id] as const))(
    "%s source title contains no other bank's name",
    (ruleId, bankId) => {
      const r = conversionRules.find((x) => x.id === ruleId)!;
      const label = `${r.sourceTitle} ${r.sourceName ?? ""} ${r.sourcePublisher ?? ""}`.toLowerCase();
      for (const [otherBank, keywords] of Object.entries(BANK_KEYWORDS)) {
        if (otherBank === bankId) continue;
        for (const kw of keywords) {
          expect(label.includes(kw), `${ruleId} (${bankId}) source label mentions ${otherBank}: "${r.sourceTitle}"`).toBe(false);
        }
      }
    },
  );

  it("keeps every bank in the allow-lists", () => {
    for (const b of banks) {
      expect(Object.keys(ALLOWED_HOSTS), `missing host allow-list for ${b.id}`).toContain(b.id);
      expect(Object.keys(BANK_KEYWORDS), `missing keyword list for ${b.id}`).toContain(b.id);
    }
  });

  it("fails on cross-bank contamination such as UOB + Maybank source title", () => {
    const contaminated = {
      sourceTitle: "Maybank Service Tax Redemption and Air Miles Conversion Rate",
    };
    const uobKeywordHit = BANK_KEYWORDS.maybank.some((kw) =>
      contaminated.sourceTitle.toLowerCase().includes(kw),
    );
    expect(uobKeywordHit).toBe(true);
  });
});

describe("UOB Visa Infinite source metadata", () => {
  const uobVi = conversionRules.filter((r) => r.eligibleCardGroupId === "cg-uob-visa-infinite");

  it("has routes", () => expect(uobVi.length).toBeGreaterThan(0));

  it.each(uobVi.map((r) => r.id))("%s points at the official UOB Malaysia source", (id) => {
    const r = conversionRules.find((x) => x.id === id)!;
    expect(r.sourceUrl).toBe("https://www.uob.com.my/personal/cards/rewards/uniringgit.page");
    expect(r.sourceTitle).toBe("UOB Malaysia UNIRinggit Rewards");
    expect(r.sourceName).toBe("UOB Malaysia UNIRinggit Rewards");
    expect(r.sourcePublisher).toBe("United Overseas Bank (Malaysia) Bhd");
    expect(r.sourceTitle.toLowerCase()).not.toContain("maybank");
  });
});
