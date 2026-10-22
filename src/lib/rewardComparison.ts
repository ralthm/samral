import Decimal from "decimal.js";

export interface RewardCategory {
  monthlySpend: number;
  cashbackPercent?: number;
  cashbackMonthlyCap?: number;
  cashbackFallbackPercent?: number;
  milesRate?: number;
  milesBonusSpendCap?: number;
  milesFallbackRate?: number;
}

export interface TransferTerms {
  bankPointsPerBlock: number;
  partnerPointsPerBlock: number;
  minimumBankPointsPerTransfer?: number;
  minimumTransferPartnerPoints?: number;
  transferIncrementPartnerPoints?: number;
  monthlyCapPartnerPoints?: number;
  annualCapPartnerPoints?: number;
  feeSchedule?: { amountPerBlock: number; blockPartnerPoints: number; minimum?: number; maximum?: number };
}

export interface RewardComparisonInput {
  monthlySpend: number;
  excludedMonthlySpend?: number;
  cashbackPercent: number;
  cashbackMonthlyCap?: number;
  cashbackQuarterlyCap?: number;
  cashbackMinimumMonthlySpend?: number;
  cashbackFallbackPercent?: number;
  cashbackAnnualFee?: number;
  /** Complete issuer-rule evaluator supplies gross rewards; fees still deducted once. */
  cashbackGrossAnnualOverride?: number;
  earningRate: number;
  earningBonusSpendCap?: number;
  earningFallbackRate?: number;
  milesAnnualFee?: number;
  annualTransferFee?: number;
  transfer?: TransferTerms;
  categories?: RewardCategory[];
  cashFare?: number;
  awardMiles?: number;
  awardTaxes?: number;
  existingMiles?: number;
  plannedMonths?: number;
  assumptionsConfirmed?: boolean;
}

const d = (n = 0) => new Decimal(Number.isFinite(n) ? n : 0);
const nonnegative = (n = 0) => Decimal.max(0, d(n));
const money = (n: Decimal) => n.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

/** One annual transfer scenario. No temporary promotion is annualised. */
export function usableMiles(raw: Decimal, transfer?: TransferTerms): Decimal {
  if (!transfer) return raw;
  if (transfer.bankPointsPerBlock <= 0 || transfer.partnerPointsPerBlock <= 0) return d();
  if (raw.lt(transfer.minimumBankPointsPerTransfer ?? 0)) return d();
  const blocks = raw.div(transfer.bankPointsPerBlock).floor();
  let miles = blocks.mul(transfer.partnerPointsPerBlock);
  if (miles.lt(transfer.minimumTransferPartnerPoints ?? 0)) return d();
  const minimum = d(transfer.minimumTransferPartnerPoints ?? 0);
  const step = transfer.transferIncrementPartnerPoints ?? transfer.partnerPointsPerBlock;
  if (step <= 0) return d();
  miles = minimum.plus(miles.minus(minimum).div(step).floor().mul(step));
  const cap = Math.min(transfer.monthlyCapPartnerPoints ?? Infinity, transfer.annualCapPartnerPoints ?? Infinity);
  if (Number.isFinite(cap)) {
    const allowed = d(cap);
    if (allowed.lt(minimum)) return d();
    miles = Decimal.min(miles, minimum.plus(allowed.minus(minimum).div(step).floor().mul(step)));
  }
  return miles;
}

export function compareRewards(input: RewardComparisonInput) {
  const eligible = Decimal.max(0, nonnegative(input.monthlySpend).minus(nonnegative(input.excludedMonthlySpend)));
  const annualSpend = eligible.mul(12);
  const categories = input.categories ?? [];
  const categorySpend = categories.reduce((sum, c) => sum.plus(nonnegative(c.monthlySpend)), d());
  const invalidCategories = categorySpend.gt(eligible);
  const percentReward = (spend: Decimal, rate: number) => spend.mul(nonnegative(rate)).div(100);
  let cashbackMonthly = d();
  let rawMonthly = d();
  for (const c of categories) {
    const spend = nonnegative(c.monthlySpend);
    const rate = c.cashbackPercent ?? input.cashbackPercent;
    let reward = percentReward(spend, rate);
    if (c.cashbackMonthlyCap !== undefined) {
      const cap = nonnegative(c.cashbackMonthlyCap);
      const qualifyingSpend = rate > 0 ? Decimal.min(spend, cap.mul(100).div(rate)) : d();
      reward = Decimal.min(reward, cap).plus(percentReward(spend.minus(qualifyingSpend), c.cashbackFallbackPercent ?? 0));
    }
    cashbackMonthly = cashbackMonthly.plus(reward);
    const bonusSpend = c.milesBonusSpendCap === undefined ? spend : Decimal.min(spend, nonnegative(c.milesBonusSpendCap));
    rawMonthly = rawMonthly.plus(bonusSpend.mul(nonnegative(c.milesRate ?? input.earningRate)))
      .plus(spend.minus(bonusSpend).mul(nonnegative(c.milesFallbackRate ?? input.earningFallbackRate)));
  }
  const other = Decimal.max(0, eligible.minus(categorySpend));
  cashbackMonthly = cashbackMonthly.plus(percentReward(other, input.cashbackPercent));
  const bonusOther = input.earningBonusSpendCap === undefined ? other : Decimal.min(other, nonnegative(input.earningBonusSpendCap));
  rawMonthly = rawMonthly.plus(bonusOther.mul(nonnegative(input.earningRate)))
    .plus(other.minus(bonusOther).mul(nonnegative(input.earningFallbackRate)));
  if (eligible.lt(input.cashbackMinimumMonthlySpend ?? 0)) {
    cashbackMonthly = percentReward(eligible, input.cashbackFallbackPercent ?? 0);
  } else if (input.cashbackMonthlyCap !== undefined) {
    const cap = nonnegative(input.cashbackMonthlyCap);
    // The main field is a total monthly cashback cap, not a bonus-only cap.
    cashbackMonthly = Decimal.min(cashbackMonthly, cap);
  }
  cashbackMonthly = cashbackMonthly.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  let cashbackQuarterly = cashbackMonthly.mul(3);
  if (input.cashbackQuarterlyCap !== undefined) cashbackQuarterly = Decimal.min(cashbackQuarterly, nonnegative(input.cashbackQuarterlyCap));
  const grossCashback = input.cashbackGrossAnnualOverride === undefined ? cashbackQuarterly.mul(4) : nonnegative(input.cashbackGrossAnnualOverride);
  const netCashback = grossCashback.minus(nonnegative(input.cashbackAnnualFee));
  const rawAnnual = rawMonthly.mul(12);
  const annualMiles = usableMiles(rawAnnual, input.transfer);
  const equivalentAnnualMiles = input.transfer ? rawAnnual.mul(input.transfer.partnerPointsPerBlock).div(input.transfer.bankPointsPerBlock) : rawAnnual;
  let transferFee = nonnegative(input.annualTransferFee);
  const schedule = input.transfer?.feeSchedule;
  if (annualMiles.lte(0)) transferFee = d();
  else if (schedule && schedule.blockPartnerPoints > 0) {
    transferFee = annualMiles.div(schedule.blockPartnerPoints).ceil().mul(schedule.amountPerBlock);
    if (schedule.minimum !== undefined) transferFee = Decimal.max(transferFee, schedule.minimum);
    if (schedule.maximum !== undefined) transferFee = Decimal.min(transferFee, schedule.maximum);
  }
  const milesFees = nonnegative(input.milesAnnualFee).plus(transferFee);
  const valid = input.cashFare !== undefined && input.awardTaxes !== undefined && (input.awardMiles ?? 0) > 0
    && input.cashFare >= 0 && input.awardTaxes >= 0 && !invalidCategories
    && nonnegative(input.excludedMonthlySpend).lte(nonnegative(input.monthlySpend));
  const valuePerMile = valid ? Decimal.max(0, d(input.cashFare).minus(d(input.awardTaxes))).div(d(input.awardMiles)) : null;
  const grossMilesValue = valuePerMile ? annualMiles.mul(valuePerMile) : null;
  const netMilesValue = grossMilesValue?.minus(milesFees) ?? null;
  const difference = netMilesValue?.minus(netCashback) ?? null;
  const cashbackRate = annualSpend.gt(0) ? netCashback.div(annualSpend).mul(100) : d();
  const milesRate = netMilesValue && annualSpend.gt(0) ? netMilesValue.div(annualSpend).mul(100) : null;
  const breakEven = annualMiles.gt(0) ? Decimal.max(0, netCashback.plus(milesFees)).div(annualMiles) : null;
  const breakEvenFare = breakEven && valid ? breakEven.mul(d(input.awardMiles)).plus(d(input.awardTaxes)) : null;
  const balance = nonnegative(input.existingMiles);
  let monthsNeeded: number | null = null;
  if ((input.awardMiles ?? 0) > 0) {
    if (balance.gte(d(input.awardMiles))) monthsNeeded = 0;
    else if (rawMonthly.gt(0)) {
      for (let months = 1; months <= 1200; months++) {
        if (usableMiles(rawMonthly.mul(months), input.transfer).plus(balance).gte(d(input.awardMiles))) { monthsNeeded = months; break; }
      }
    }
  }
  // A close result means within 0.1 percentage points of annual eligible spend.
  const closeThreshold = annualSpend.mul(0.001);
  let winner: "cashback" | "miles" | "close" | "incomplete" = "incomplete";
  if (valid && difference && annualSpend.gt(0) && input.assumptionsConfirmed !== false) {
    winner = difference.abs().lte(closeThreshold) ? "close" : difference.gt(0) ? "miles" : "cashback";
  }
  return {
    annualEligibleSpend: money(annualSpend), grossCashback: money(grossCashback), netCashback: money(netCashback),
    rawAnnualRewards: rawAnnual.toNumber(), annualMiles: annualMiles.toNumber(), equivalentAnnualMiles: equivalentAnnualMiles.toNumber(),
    untransferredRewards: input.transfer ? rawAnnual.minus(annualMiles.mul(input.transfer.bankPointsPerBlock).div(input.transfer.partnerPointsPerBlock)).toNumber() : 0,
    grossMilesValue: grossMilesValue ? money(grossMilesValue) : null, netMilesValue: netMilesValue ? money(netMilesValue) : null,
    cashbackRate: cashbackRate.toNumber(), milesRate: milesRate?.toNumber() ?? null,
    difference: difference ? money(difference) : null,
    percentagePointDifference: milesRate?.minus(cashbackRate).toNumber() ?? null,
    centsPerMile: valuePerMile?.mul(100).toNumber() ?? null,
    breakEvenCents: breakEven?.mul(100).toNumber() ?? null, breakEvenFare: breakEvenFare ? money(breakEvenFare) : null,
    monthsNeeded, existingMiles: balance.toNumber(), transferFee: money(transferFee), winner, invalidCategories,
    readyByTrip: input.plannedMonths !== undefined && monthsNeeded !== null ? monthsNeeded <= input.plannedMonths : null,
  };
}