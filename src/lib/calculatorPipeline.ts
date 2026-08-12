/**
 * Calculator pipeline.
 *
 * The single place where card entries and existing loyalty balances turn into
 * conversion results. It exists outside the React tree so the early-exit rules
 * for non-convertible cards can be asserted directly in tests.
 *
 * Early-exit contract:
 * - `non_convertible` cards (cashback, merchant coins) never reach a
 *   conversion-route lookup, block calculation, promotion evaluation,
 *   programme reachability, redemption matching or leftover-points row.
 * - `direct_airline_earn` cards hold no bank balance: their programme comes
 *   from Step 2, never from conversion arithmetic.
 * - When nothing valid remains, no pipeline work runs at all.
 */
import {
  eligibleCardGroups,
  getBankById,
  getCardById,
  isDirectEarnCard,
  isNonConvertibleCard,
} from "@/data/milesCalculator";
import {
  calculateEntry,
  computePortfolioTotals,
  parseIntSafe,
  ProgrammeTotal,
  RuleResult,
} from "@/lib/milesCalculator";

export interface CalculatorEntry {
  id: string;
  bankId: string;
  cardId: string;
  cardGroupId: string;
  notFound: boolean;
  nickname: string;
  rawInput: string;
}

export interface CalculatorExistingRow {
  id: string;
  programmeId: string;
  rawInput: string;
}

export interface EntryContextValue {
  bankName: string;
  groupName: string;
  nickname: string;
  entered: number;
}

export interface CalculationSnapshot {
  results: RuleResult[];
  portfolio: ProgrammeTotal[];
  entryContext: Map<string, EntryContextValue>;
  /** Entries that were skipped because their card cannot be converted. */
  skippedEntryIds: string[];
  /** How many entries were actually sent through conversion work. */
  processedEntryCount: number;
}

/** An entry the user has begun filling in. */
export function isUsableEntry(e: CalculatorEntry): boolean {
  return !!(e.bankId || e.cardId || e.rawInput.trim());
}

/** An entry that can contribute bank points to a loyalty programme. */
export function isConvertibleEntry(e: CalculatorEntry): boolean {
  if (!isUsableEntry(e)) return false;
  const card = getCardById(e.cardId);
  if (isNonConvertibleCard(card)) return false;
  if (isDirectEarnCard(card)) return false;
  return true;
}

export function hasExistingLoyaltyBalance(rows: CalculatorExistingRow[]): boolean {
  return rows.some((r) => !!r.programmeId && parseIntSafe(r.rawInput) > 0);
}

/**
 * Guard clause. False means there is nothing that could ever produce a
 * loyalty-programme balance, so no expensive work should be attempted.
 */
export function hasCalculableInput(
  entries: CalculatorEntry[],
  rows: CalculatorExistingRow[],
): boolean {
  return entries.some(isConvertibleEntry) || hasExistingLoyaltyBalance(rows);
}

const emptySnapshot = (skippedEntryIds: string[] = []): CalculationSnapshot => ({
  results: [],
  portfolio: [],
  entryContext: new Map(),
  skippedEntryIds,
  processedEntryCount: 0,
});

export function runCalculation(
  entries: CalculatorEntry[],
  existingRows: CalculatorExistingRow[],
  registeredPromotionIds: string[] = [],
): CalculationSnapshot {
  const usableEntries = entries.filter(isUsableEntry);
  const skippedEntryIds = usableEntries
    .filter((e) => {
      const card = getCardById(e.cardId);
      return isNonConvertibleCard(card) || isDirectEarnCard(card);
    })
    .map((e) => e.id);

  // Guard: nothing valid to calculate — skip the pipeline entirely.
  if (!hasCalculableInput(entries, existingRows)) return emptySnapshot(skippedEntryIds);

  const results: RuleResult[] = [];
  const entryContext = new Map<string, EntryContextValue>();
  let processedEntryCount = 0;

  for (const e of usableEntries) {
    const card = getCardById(e.cardId);
    // Non-convertible: early exit before any conversion work or leftover row.
    if (isNonConvertibleCard(card)) continue;
    // Direct-earning: no bank balance, no blocks, no promotions.
    if (isDirectEarnCard(card)) continue;

    const points = parseIntSafe(e.rawInput);
    const bank = getBankById(e.bankId);
    const group = eligibleCardGroups.find((g) => g.id === e.cardGroupId);
    entryContext.set(e.id, {
      bankName: bank?.name ?? "",
      groupName: group?.name ?? "",
      nickname: e.nickname,
      entered: points,
    });
    processedEntryCount += 1;
    results.push(
      ...calculateEntry({
        entryId: e.id,
        cardGroupId: e.cardGroupId,
        nickname: e.nickname,
        bankPoints: points,
        registeredPromotionIds,
      }),
    );
  }

  const existingBalances: Record<string, number> = {};
  for (const r of existingRows) {
    const n = parseIntSafe(r.rawInput);
    if (Number.isFinite(n) && n > 0 && r.programmeId) existingBalances[r.programmeId] = n;
  }

  const portfolio = computePortfolioTotals(results, existingBalances);
  return { results, portfolio, entryContext, skippedEntryIds, processedEntryCount };
}
