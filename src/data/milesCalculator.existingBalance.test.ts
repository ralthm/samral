import { describe, expect, it } from "vitest";
import { runCalculation, hasCalculableInput, CalculatorEntry, CalculatorExistingRow } from "@/lib/calculatorPipeline";
import { isPromotionActive, promotions } from "@/data/promotions";

/**
 * Existing (Step 2) loyalty balances must always be merged into the programme
 * result: potential = existing + converted, promotional = potential + bonus.
 * The bonus never applies to the existing balance.
 */

const enrichPromo = promotions.find((p) => p.id === "mh-enrich-10pct-2026")!;
const promoLive = isPromotionActive(enrichPromo);

function entry(over: Partial<CalculatorEntry> = {}): CalculatorEntry {
  return {
    id: "e1",
    bankId: "maybank",
    cardId: "",
    cardGroupId: "cg-mbb-treats-standard",
    notFound: false,
    nickname: "",
    rawInput: "250,000",
    ...over,
  };
}

function existing(programmeId: string, rawInput: string, id = "x1"): CalculatorExistingRow {
  return { id, programmeId, rawInput };
}

const enrichOf = (snap: ReturnType<typeof runCalculation>) =>
  snap.portfolio.find((p) => p.programmeId === "enrich")!;

describe("QA regression: 250,000 TreatsPoints + 60,000 existing Enrich", () => {
  const snap = runCalculation([entry()], [existing("enrich", "60,000")]);
  const result = snap.results.find((r) => r.programmeId === "enrich")!;
  const enrich = enrichOf(snap);

  it("uses 240,000 TreatsPoints and leaves 10,000", () => {
    expect(result.bankPointsUsed).toBe(240_000);
    expect(result.bankPointsRemaining).toBe(10_000);
  });

  it("converts 12,000 base Enrich", () => {
    expect(enrich.transferredTotal).toBe(12_000);
  });

  it("keeps the 60,000 existing Enrich balance", () => {
    expect(enrich.existingBalance).toBe(60_000);
  });

  it("gives a standard potential balance of existing + converted", () => {
    expect(enrich.potentialTotal).toBe(72_000);
  });

  it("adds the bonus only on top of the converted points", () => {
    expect(enrich.bonusTotal).toBe(promoLive ? 1_200 : 0);
    expect(enrich.promotionalTotal).toBe(promoLive ? 73_200 : 72_000);
    expect(enrich.promotionalTotal).toBe(enrich.existingBalance + enrich.transferredTotal + enrich.bonusTotal);
  });
});

describe("Existing balances across programmes and inputs", () => {
  it("merges an existing KrisFlyer balance with a bank conversion", () => {
    const snap = runCalculation([entry()], [existing("krisflyer", "25,000")]);
    const kf = snap.portfolio.find((p) => p.programmeId === "krisflyer")!;
    expect(kf.existingBalance).toBe(25_000);
    expect(kf.potentialTotal).toBe(kf.transferredTotal + 25_000);
  });

  it("merges an existing Asia Miles balance with a bank conversion", () => {
    const snap = runCalculation([entry()], [existing("asia-miles", "9,500")]);
    const am = snap.portfolio.find((p) => p.programmeId === "asia-miles")!;
    expect(am.existingBalance).toBe(9_500);
    expect(am.potentialTotal).toBe(am.transferredTotal + 9_500);
  });

  it("works with an existing balance only (no cards)", () => {
    const rows = [existing("enrich", "60,000")];
    expect(hasCalculableInput([], rows)).toBe(true);
    const enrich = enrichOf(runCalculation([], rows));
    expect(enrich.existingBalance).toBe(60_000);
    expect(enrich.transferredTotal).toBe(0);
    expect(enrich.potentialTotal).toBe(60_000);
    expect(enrich.promotionalTotal).toBe(60_000);
  });

  it("adds two banks feeding the same programme on top of the existing balance", () => {
    const snap = runCalculation(
      [
        entry(),
        entry({ id: "e2", bankId: "uob", cardGroupId: "cg-uob-prvi-elite", rawInput: "60,000" }),
      ],
      [existing("enrich", "60,000")],
    );
    const enrich = enrichOf(snap);
    const base = snap.results
      .filter((r) => r.programmeId === "enrich")
      .reduce((s, r) => s + r.partnerPointsReceived, 0);
    expect(base).toBeGreaterThan(12_000);
    expect(enrich.transferredTotal).toBe(base);
    expect(enrich.potentialTotal).toBe(60_000 + base);
    expect(enrich.promotionalTotal).toBe(60_000 + base + enrich.bonusTotal);
  });

  it("never applies the percentage bonus to the existing balance", () => {
    const withExisting = enrichOf(runCalculation([entry()], [existing("enrich", "60,000")]));
    const withoutExisting = enrichOf(runCalculation([entry()], []));
    expect(withExisting.bonusTotal).toBe(withoutExisting.bonusTotal);
  });
});

describe("Step 1 edits never wipe Step 2 balances", () => {
  const rows = [existing("enrich", "60,000")];

  it("keeps the existing balance when the card changes", () => {
    const changed = runCalculation(
      [entry({ cardGroupId: "cg-mbb-treats-premier", rawInput: "250,000" })],
      rows,
    );
    expect(enrichOf(changed).existingBalance).toBe(60_000);
  });

  it("keeps the existing balance when the bank points are edited", () => {
    const edited = runCalculation([entry({ rawInput: "100,000" })], rows);
    expect(enrichOf(edited).existingBalance).toBe(60_000);
  });

  it("keeps the existing balance when the card becomes non-calculable", () => {
    const snap = runCalculation([entry({ cardGroupId: "", rawInput: "" })], rows);
    expect(enrichOf(snap).existingBalance).toBe(60_000);
  });
});
