/**
 * Non-convertible cards (cashback, merchant coins) must be an early-exit
 * state: recognised immediately, explained, and skipped by every conversion,
 * promotion and redemption code path.
 */
import { describe, expect, it } from "vitest";
import {
  getCardById,
  isConversionEligibleCard,
  isNonConvertibleCard,
} from "./milesCalculator";
import {
  CalculatorEntry,
  CalculatorExistingRow,
  hasCalculableInput,
  isConvertibleEntry,
  runCalculation,
} from "@/lib/calculatorPipeline";

const entry = (over: Partial<CalculatorEntry> = {}): CalculatorEntry => ({
  id: "e1",
  bankId: "",
  cardId: "",
  cardGroupId: "",
  notFound: false,
  nickname: "",
  rawInput: "",
  ...over,
});

const cashflo = () =>
  entry({ id: "cashflo", bankId: "ocbc", cardId: "ocbc_cashflo_mastercard", cardGroupId: "cg-ocbc-cashback", rawInput: "50000" });

const prvi = () =>
  entry({ id: "prvi", bankId: "uob", cardId: "uob-prvi-elite", cardGroupId: "cg-uob-prvi-elite", rawInput: "120000" });

const enrich80k: CalculatorExistingRow = { id: "x1", programmeId: "enrich", rawInput: "80,000" };

describe("non-convertible card metadata", () => {
  it("marks OCBC Cashflo as non-convertible and conversion-ineligible", () => {
    const card = getCardById("ocbc_cashflo_mastercard");
    expect(card).toBeDefined();
    expect(isNonConvertibleCard(card)).toBe(true);
    expect(isConversionEligibleCard(card)).toBe(false);
  });

  it("keeps a transferable-points card eligible", () => {
    const card = getCardById("uob-prvi-elite");
    expect(isNonConvertibleCard(card)).toBe(false);
    expect(isConversionEligibleCard(card)).toBe(true);
  });

  it("does not remove the card from the selector", () => {
    expect(getCardById("ocbc_cashflo_mastercard")?.name).toBe("OCBC Cashflo Mastercard");
  });
});

describe("guard clause", () => {
  it("blocks calculation for a non-convertible card on its own", () => {
    expect(isConvertibleEntry(cashflo())).toBe(false);
    expect(hasCalculableInput([cashflo()], [])).toBe(false);
  });

  it("allows calculation once an existing loyalty balance exists", () => {
    expect(hasCalculableInput([cashflo()], [enrich80k])).toBe(true);
  });

  it("allows calculation once a convertible card is added", () => {
    expect(hasCalculableInput([cashflo(), prvi()], [])).toBe(true);
  });
});

describe("pipeline early exit", () => {
  it("runs no conversion work for a non-convertible card only", () => {
    const snap = runCalculation([cashflo()], []);
    expect(snap.processedEntryCount).toBe(0);
    expect(snap.results).toEqual([]);
    expect(snap.portfolio).toEqual([]);
    expect(snap.entryContext.size).toBe(0);
    expect(snap.skippedEntryIds).toContain("cashflo");
  });

  it("non-convertible + existing Enrich keeps Enrich intact and untouched by the card", () => {
    const snap = runCalculation([cashflo()], [enrich80k]);
    expect(snap.processedEntryCount).toBe(0);
    expect(snap.results).toEqual([]);
    const enrich = snap.portfolio.find((p) => p.programmeId === "enrich");
    expect(enrich?.totalMiles).toBe(80000);
    expect(snap.entryContext.has("cashflo")).toBe(false);
  });

  it("non-convertible + convertible card calculates only from the convertible one", () => {
    const snap = runCalculation([cashflo(), prvi()], []);
    expect(snap.processedEntryCount).toBe(1);
    expect(snap.entryContext.has("cashflo")).toBe(false);
    expect(snap.entryContext.has("prvi")).toBe(true);
    expect(snap.results.length).toBeGreaterThan(0);
    expect(snap.results.every((r) => r.entryId === "prvi")).toBe(true);
  });
});

describe("switching cards leaves no stale work", () => {
  it("drops all contribution when a convertible card becomes non-convertible", () => {
    const before = runCalculation([prvi()], []);
    expect(before.results.length).toBeGreaterThan(0);

    const switched = entry({ id: "prvi", bankId: "ocbc", cardId: "ocbc_cashflo_mastercard", cardGroupId: "cg-ocbc-cashback", rawInput: "" });
    const after = runCalculation([switched], []);
    expect(after.results).toEqual([]);
    expect(after.portfolio).toEqual([]);
    expect(after.entryContext.has("prvi")).toBe(false);
  });

  it("recovers full results when the non-convertible card is removed", () => {
    const withBoth = runCalculation([cashflo(), prvi()], []);
    const withoutCashflo = runCalculation([prvi()], []);
    expect(withoutCashflo.results.length).toBe(withBoth.results.length);
    expect(withoutCashflo.portfolio).toEqual(withBoth.portfolio);
  });

  it("stays stable across repeated switching", () => {
    for (let i = 0; i < 5; i += 1) {
      const convertible = runCalculation([prvi()], []);
      expect(convertible.processedEntryCount).toBe(1);
      const nonConvertible = runCalculation([cashflo()], []);
      expect(nonConvertible.processedEntryCount).toBe(0);
      expect(nonConvertible.results).toEqual([]);
    }
  });
});
