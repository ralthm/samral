import {
  ConversionRule,
  getCardGroupById,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardProductById,
  getBankById,
} from "@/data/milesCalculator";
import {
  computeBonus,
  findApplicablePromotion,
  Promotion,
} from "@/data/promotions";

/* Integer-only, floor-only conversion. Never invents partial blocks. */

export interface CalcInput {
  entryId: string;
  cardGroupId: string;
  nickname?: string;
  bankPoints: number;
}

export interface RuleResult {
  entryId: string;
  cardGroupId: string;
  cardGroupName: string;
  bankName: string;
  bankId: string;
  rewardProductName: string;
  rewardCurrencyName: string;
  programmeId: string;
  programmeName: string;
  programmeType: string;
  bankPointsEntered: number;
  bankPointsPerBlock: number;
  partnerPointsPerBlock: number;
  fullBlocks: number;
  bankPointsUsed: number;
  bankPointsRemaining: number;
  partnerPointsReceived: number;
  pointsShortOfNextBlock: number;
  verifiedOn: string;
  sourceUrl: string;
  sourceTitle: string;
  effectiveFrom?: string;
  notes?: string;
  annualCapPartnerPoints?: number;
  monthlyCapPartnerPoints?: number;
  monthlyCapApplied?: boolean;
  minimumTransferPartnerPoints?: number;
  transferIncrementPartnerPoints?: number;
  /** Bonus partner points from an applied promotion (0 if none). Additive, never modifies base. */
  bonusPartnerPoints: number;
  /** Total transferred INCLUDING bonus (standard + bonus). */
  promotionalPartnerPoints: number;
  promotionId?: string;
  promotionName?: string;
  promotionEndDate?: string;
  promotionBonusPercentage?: number;
}

export function calculateEntry(input: CalcInput): RuleResult[] {
  const rules = getPublicRulesForCardGroup(input.cardGroupId);
  const group = getCardGroupById(input.cardGroupId);
  const product = group ? getRewardProductById(group.rewardProductId) : undefined;
  const bank = product ? getBankById(product.bankId) : undefined;
  if (!group || !product || !bank) return [];

  return rules.map((r) => buildResult(input, r, {
    cardGroupName: group.name,
    bankName: bank.name,
    bankId: bank.id,
    rewardProductName: product.name,
    rewardCurrencyName: product.rewardCurrencyName,
  }));
}

function buildResult(
  input: CalcInput,
  r: ConversionRule,
  ctx: { cardGroupName: string; bankName: string; bankId: string; rewardProductName: string; rewardCurrencyName: string },
): RuleResult {
  const programme = getProgrammeById(r.loyaltyProgrammeId)!;
  const points = Math.max(0, Math.floor(input.bankPoints || 0));

  let fullBlocks = Math.floor(points / r.bankPointsPerBlock);
  let partnerPointsReceived = fullBlocks * r.partnerPointsPerBlock;
  let monthlyCapApplied = false;
  if (
    typeof r.monthlyCapPartnerPoints === "number" &&
    partnerPointsReceived > r.monthlyCapPartnerPoints
  ) {
    const cappedBlocks = Math.floor(r.monthlyCapPartnerPoints / r.partnerPointsPerBlock);
    fullBlocks = cappedBlocks;
    partnerPointsReceived = cappedBlocks * r.partnerPointsPerBlock;
    monthlyCapApplied = true;
  }
  const bankPointsUsed = fullBlocks * r.bankPointsPerBlock;
  const bankPointsRemaining = points - bankPointsUsed;
  const pointsShortOfNextBlock =
    fullBlocks === 0 ? Math.max(0, r.bankPointsPerBlock - points) : 0;

  return {
    entryId: input.entryId,
    cardGroupId: input.cardGroupId,
    cardGroupName: ctx.cardGroupName,
    bankName: ctx.bankName,
    bankId: ctx.bankId,
    rewardProductName: ctx.rewardProductName,
    rewardCurrencyName: ctx.rewardCurrencyName,
    programmeId: programme.id,
    programmeName: programme.name,
    programmeType: programme.programmeType,
    bankPointsEntered: points,
    bankPointsPerBlock: r.bankPointsPerBlock,
    partnerPointsPerBlock: r.partnerPointsPerBlock,
    fullBlocks,
    bankPointsUsed,
    bankPointsRemaining,
    partnerPointsReceived,
    pointsShortOfNextBlock,
    verifiedOn: r.verifiedOn,
    sourceUrl: r.sourceUrl,
    sourceTitle: r.sourceTitle,
    effectiveFrom: r.effectiveFrom,
    notes: r.notes,
    annualCapPartnerPoints: r.annualCapPartnerPoints,
    monthlyCapPartnerPoints: r.monthlyCapPartnerPoints,
    monthlyCapApplied,
    minimumTransferPartnerPoints: r.minimumTransferPartnerPoints,
    transferIncrementPartnerPoints: r.transferIncrementPartnerPoints,
    ...applyPromotionToResult(ctx.bankId, programme.id, r.eligibleCardGroupId, partnerPointsReceived),
  };
}

function applyPromotionToResult(
  bankId: string,
  programmeId: string,
  cardGroupId: string,
  basePartnerPoints: number,
): {
  bonusPartnerPoints: number;
  promotionalPartnerPoints: number;
  promotionId?: string;
  promotionName?: string;
  promotionEndDate?: string;
  promotionBonusPercentage?: number;
} {
  const promo = findApplicablePromotion(bankId, programmeId, cardGroupId);
  if (!promo || basePartnerPoints <= 0) {
    return { bonusPartnerPoints: 0, promotionalPartnerPoints: basePartnerPoints };
  }
  const bonus = computeBonus(promo, basePartnerPoints);
  return {
    bonusPartnerPoints: bonus,
    promotionalPartnerPoints: basePartnerPoints + bonus,
    promotionId: promo.id,
    promotionName: promo.name,
    promotionEndDate: promo.endDate,
    promotionBonusPercentage: promo.bonusType === "percentage" ? promo.bonusPercentage : undefined,
  };
}

export interface ProgrammeTotal {
  programmeId: string;
  programmeName: string;
  programmeType: string;
  transferredFromEntries: {
    entryId: string;
    bankName: string;
    rewardProductName: string;
    partnerPointsReceived: number;
    bonusPartnerPoints: number;
    promotionId?: string;
  }[];
  transferredTotal: number;
  /** Bonus partner points from active promotions (0 if none apply). */
  bonusTotal: number;
  existingBalance: number;
  /** Standard potential: transferredTotal + existingBalance (no promotion). */
  potentialTotal: number;
  /** With active promotion(s) applied: potentialTotal + bonusTotal. */
  promotionalTotal: number;
  /** Distinct promotions that contributed a bonus to this programme. */
  activePromotionIds: string[];
}

export function computePortfolioTotals(
  results: RuleResult[],
  existingBalances: Record<string, number>,
): ProgrammeTotal[] {
  const byProgramme = new Map<string, ProgrammeTotal>();

  for (const r of results) {
    if (r.partnerPointsReceived <= 0) continue;
    const existing = byProgramme.get(r.programmeId) ?? {
      programmeId: r.programmeId,
      programmeName: r.programmeName,
      programmeType: r.programmeType,
      transferredFromEntries: [],
      transferredTotal: 0,
      bonusTotal: 0,
      existingBalance: 0,
      potentialTotal: 0,
      promotionalTotal: 0,
      activePromotionIds: [],
    };
    existing.transferredFromEntries.push({
      entryId: r.entryId,
      bankName: r.bankName,
      rewardProductName: r.rewardProductName,
      partnerPointsReceived: r.partnerPointsReceived,
      bonusPartnerPoints: r.bonusPartnerPoints,
      promotionId: r.promotionId,
    });
    existing.transferredTotal += r.partnerPointsReceived;
    existing.bonusTotal += r.bonusPartnerPoints;
    if (r.promotionId && !existing.activePromotionIds.includes(r.promotionId)) {
      existing.activePromotionIds.push(r.promotionId);
    }
    byProgramme.set(r.programmeId, existing);
  }

  // Include existing balances even for programmes with no transfers
  for (const [pid, bal] of Object.entries(existingBalances)) {
    if (!bal || bal <= 0) continue;
    const programme = getProgrammeById(pid);
    if (!programme) continue;
    const existing = byProgramme.get(pid) ?? {
      programmeId: pid,
      programmeName: programme.name,
      programmeType: programme.programmeType,
      transferredFromEntries: [],
      transferredTotal: 0,
      bonusTotal: 0,
      existingBalance: 0,
      potentialTotal: 0,
      promotionalTotal: 0,
      activePromotionIds: [],
    };
    existing.existingBalance = Math.max(0, Math.floor(bal));
    byProgramme.set(pid, existing);
  }

  const totals = Array.from(byProgramme.values());
  for (const t of totals) {
    t.potentialTotal = t.transferredTotal + t.existingBalance;
    t.promotionalTotal = t.potentialTotal + t.bonusTotal;
  }
  totals.sort((a, b) => b.promotionalTotal - a.promotionalTotal);
  return totals;
}

export function formatInt(n: number): string {
  return new Intl.NumberFormat("en-MY").format(Math.floor(n));
}

export function parseIntSafe(s: string): number {
  const cleaned = (s || "").replace(/[,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return NaN;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 999_999_999) return NaN;
  return Math.floor(n);
}
