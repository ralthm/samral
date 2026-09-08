/**
 * Estimated cash transfer fees for one hypothetical destination programme.
 *
 * Rules:
 * - Fees are NEVER deducted from miles. They are a separate cash cost.
 * - Fees are computed per destination programme only. Alternative programme
 *   scenarios are never summed together, because the user would only perform
 *   the transfers for the scenario they actually choose.
 * - One transfer per contributing bank into that programme = one fee per bank.
 * - If a contributing bank publishes no verified fee, we say so instead of
 *   guessing. A verified card-specific waiver (fee of 0) is respected.
 */

export interface FeeContributor {
  bankId: string;
  bankName: string;
  transferFeeAmount?: number;
  transferFeeCurrency?: "SGD" | "MYR" | "HKD";
}

export interface TransferFeeBreakdownItem {
  bankId: string;
  bankName: string;
  amount: number;
  currency: "SGD" | "MYR" | "HKD";
}

export interface TransferFeeEstimate {
  total: number;
  currency: "SGD" | "MYR" | "HKD" | null;
  breakdown: TransferFeeBreakdownItem[];
  /** Banks contributing to this programme with no verified fee on record. */
  unknownBanks: string[];
}

export const FEE_SYMBOL: Record<"SGD" | "MYR" | "HKD", string> = {
  SGD: "S$",
  MYR: "RM",
  HKD: "HK$",
};

export function formatFee(amount: number, currency: "SGD" | "MYR" | "HKD"): string {
  return `${FEE_SYMBOL[currency]}${amount.toFixed(2)}`;
}

export function computeTransferFees(contributors: FeeContributor[]): TransferFeeEstimate {
  const perBank = new Map<string, TransferFeeBreakdownItem>();
  const unknown = new Map<string, string>();

  for (const c of contributors) {
    if (typeof c.transferFeeAmount === "number" && c.transferFeeCurrency) {
      // One conversion per bank into this programme — take the highest known
      // published fee for the bank rather than charging it more than once.
      const existing = perBank.get(c.bankId);
      if (!existing || c.transferFeeAmount > existing.amount) {
        perBank.set(c.bankId, {
          bankId: c.bankId,
          bankName: c.bankName,
          amount: c.transferFeeAmount,
          currency: c.transferFeeCurrency,
        });
      }
      unknown.delete(c.bankId);
    } else if (!perBank.has(c.bankId)) {
      unknown.set(c.bankId, c.bankName);
    }
  }

  const breakdown = Array.from(perBank.values())
    .filter((b) => b.amount > 0)
    .sort((a, b) => a.bankName.localeCompare(b.bankName));
  const currency = breakdown[0]?.currency ?? null;
  // Never mix currencies in a single total.
  const sameCurrency = breakdown.filter((b) => b.currency === currency);
  const total = sameCurrency.reduce((s, b) => s + b.amount, 0);

  return {
    total,
    currency,
    breakdown: sameCurrency,
    unknownBanks: Array.from(unknown.values()),
  };
}
