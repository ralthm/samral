/**
 * Conversion-unverified cards are a distinct, non-calculable state.
 *
 * Unlike `non_convertible` (we know the card earns nothing transferable), an
 * unverified card may well have a route — Samral just has not confirmed a
 * current one. It must never be estimated, never assumed to convert at zero,
 * and never run through conversion, promotion, reachability, leftover or
 * redemption work. Other valid inputs must keep working normally.
 */
import { describe, expect, it } from "vitest";
import {
  getCardById,
  isConversionEligibleCard,
  isConversionUnverifiedCard,
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

/** UOB PRVI Miles Card (non-Elite) — status: rate_pending_verification, no card group. */
const unverifiedEntry = () =>
  entry({ id: "unv", bankId: "uob", cardId: "uob-prvi", cardGroupId: "", rawInput: "90000" });

/** Standard Chartered Beyond Priority Private — status: rate_unconfirmed, group with no public rule. */
const unverifiedGroupEntry = () =>
  entry({ id: "unv2", bankId: "sc", cardId: "sc-beyond-priority-private", cardGroupId: "cg-sc-360-unverified", rawInput: "120000" });

const verifiedEntry = () =>
  entry({ id: "prvi-elite", bankId: "uob", cardId: "uob-prvi-elite", cardGroupId: "cg-uob-prvi-elite", rawInput: "120000" });

const enrich80k: CalculatorExistingRow = { id: "x1", programmeId: "enrich", rawInput: "80,000" };

describe("unverified state is distinct from non-convertible", () => {
  it("flags a status-based unverified card", () => {
    const card = getCardById("uob-prvi");
    expect(card?.status).toBe("rate_pending_verification");
    expect(isConversionUnverifiedCard(card)).toBe(true);
    expect(isNonConvertibleCard(card)).toBe(false);
    expect(isConversionEligibleCard(card)).toBe(false);
  });

  it("flags an unverified card whose group publishes no confirmed rule", () => {
    const card = getCardById("sc-beyond-priority-private");
    expect(card?.status).toBe("rate_unconfirmed");
    expect(isConversionUnverifiedCard(card)).toBe(true);
    expect(isNonConvertibleCard(card)).toBe(false);
  });

  it("does not flag a cashback card as unverified", () => {
    const card = getCardById("ocbc_cashflo_mastercard");
    expect(isNonConvertibleCard(card)).toBe(true);
    expect(isConversionUnverifiedCard(card)).toBe(false);
  });

  it("does not flag a verified card", () => {
    const card = getCardById("uob-prvi-elite");
    expect(isConversionUnverifiedCard(card)).toBe(false);
    expect(isConversionEligibleCard(card)).toBe(true);
  });
});

describe("unverified card only", () => {
  it("is not a convertible entry and disables calculation", () => {
    expect(isConvertibleEntry(unverifiedEntry())).toBe(false);
    expect(hasCalculableInput([unverifiedEntry()], [])).toBe(false);
    expect(hasCalculableInput([unverifiedGroupEntry()], [])).toBe(false);
  });

  it("runs no conversion, promotion, reachability or leftover work", () => {
    for (const e of [unverifiedEntry(), unverifiedGroupEntry()]) {
      const snap = runCalculation([e], []);
      expect(snap.processedEntryCount).toBe(0);
      expect(snap.results).toEqual([]);
      expect(snap.portfolio).toEqual([]);
      expect(snap.entryContext.size).toBe(0);
      expect(snap.skippedEntryIds).toContain(e.id);
    }
  });
});

describe("unverified alongside valid inputs", () => {
  it("unverified + Step 2 Enrich balance calculates from Enrich only", () => {
    expect(hasCalculableInput([unverifiedEntry()], [enrich80k])).toBe(true);
    const snap = runCalculation([unverifiedEntry()], [enrich80k]);
    expect(snap.processedEntryCount).toBe(0);
    expect(snap.results).toEqual([]);
    const enrich = snap.portfolio.find((p) => p.programmeId === "enrich");
    expect(enrich?.existingBalance).toBe(80000);
    expect(enrich?.transferredTotal).toBe(0);
    expect(enrich?.potentialTotal).toBe(80000);
    expect(snap.entryContext.has("unv")).toBe(false);
  });

  it("unverified + verified card calculates from the verified card only", () => {
    const snap = runCalculation([unverifiedEntry(), verifiedEntry()], []);
    const baseline = runCalculation([verifiedEntry()], []);
    expect(snap.processedEntryCount).toBe(1);
    expect(snap.entryContext.has("unv")).toBe(false);
    expect(snap.results.every((r) => r.entryId === "prvi-elite")).toBe(true);
    expect(snap.results.length).toBe(baseline.results.length);
    expect(snap.portfolio).toEqual(baseline.portfolio);
  });
});

describe("switching between verified and unverified", () => {
  it("verified switched to unverified leaves no stale miles or context", () => {
    const before = runCalculation([verifiedEntry()], []);
    expect(before.results.length).toBeGreaterThan(0);

    const switched = entry({ id: "prvi-elite", bankId: "uob", cardId: "uob-prvi", cardGroupId: "", rawInput: "" });
    const after = runCalculation([switched], []);
    expect(after.results).toEqual([]);
    expect(after.portfolio).toEqual([]);
    expect(after.entryContext.has("prvi-elite")).toBe(false);
    expect(hasCalculableInput([switched], [])).toBe(false);
  });

  it("unverified switched to verified calculates normally again", () => {
    const unv = runCalculation([unverifiedEntry()], []);
    expect(unv.results).toEqual([]);

    const switched = entry({ id: "unv", bankId: "uob", cardId: "uob-prvi-elite", cardGroupId: "cg-uob-prvi-elite", rawInput: "120000" });
    const after = runCalculation([switched], []);
    expect(hasCalculableInput([switched], [])).toBe(true);
    expect(after.processedEntryCount).toBe(1);
    expect(after.results.length).toBeGreaterThan(0);
    expect(after.entryContext.get("unv")?.entered).toBe(120000);
  });

  it("stays stable across repeated switching", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(runCalculation([verifiedEntry()], []).processedEntryCount).toBe(1);
      expect(runCalculation([unverifiedEntry()], []).processedEntryCount).toBe(0);
    }
  });
});

describe("no estimated conversion for unverified balances", () => {
  it("never produces a result row or leftover for the unverified entry, at any balance", () => {
    for (const raw of ["1", "46000", "999999"]) {
      const snap = runCalculation([entry({ ...unverifiedGroupEntry(), rawInput: raw })], [enrich80k]);
      expect(snap.results.some((r) => r.entryId === "unv2")).toBe(false);
      expect(snap.entryContext.has("unv2")).toBe(false);
      const enrich = snap.portfolio.find((p) => p.programmeId === "enrich");
      expect(enrich?.transferredTotal).toBe(0);
      expect(enrich?.bonusTotal).toBe(0);
      expect(enrich?.conditionalBonusTotal).toBe(0);
      expect(enrich?.potentialTotal).toBe(80000);
    }
  });
});
