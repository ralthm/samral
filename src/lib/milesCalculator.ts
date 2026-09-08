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
  findApplicablePromotions,
  Promotion,
  PromotionSponsor,
} from "@/data/promotions";

/* Integer-only, floor-only conversion. Never invents partial blocks. */

export interface CalcInput {
  entryId: string;
  cardGroupId: string;
  nickname?: string;
  bankPoints: number;
  /**
   * IDs of promotions the user has confirmed they registered for. Any
   * promotion with registrationRequired=true is treated as CONDITIONAL —
   * its bonus is reported separately and only added to the "default"
   * bonusPartnerPoints when its id appears in this set.
   */
  registeredPromotionIds?: string[];
}

export interface PromotionApplication {
  id: string;
  name: string;
  sponsor: PromotionSponsor;
  programmeId: string;
  endDate: string;
  bonusType: "percentage" | "fixed";
  bonusPercentage?: number;
  bonusFixed?: number;
  bonus: number;
  registrationRequired: boolean;
  /** True when the bonus is being counted right now (unconditional OR registered). */
  applied: boolean;
  overallBonusCap?: number;
  officialSource: string;
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
  sourceName?: string;
  sourceType?: string;
  effectiveFrom?: string;
  notes?: string;
  annualCapPartnerPoints?: number;
  campaignCapPartnerPoints?: number;
  monthlyCapPartnerPoints?: number;
  monthlyCapApplied?: boolean;
  /** Set when a published conversion cap limited the transferable amount. */
  capApplied?: { type: "monthly" | "campaign" | "annual"; limit: number };
  /** Always set when the bank publishes campaign/annual caps we cannot verify
   * against the user's own conversion history. */
  capWarning?: string;
  minimumTransferPartnerPoints?: number;
  transferIncrementPartnerPoints?: number;
  /** Bank-side minimum per transfer, where the issuer publishes one. */
  minimumBankPointsPerTransfer?: number;
  /** Administrative fee per conversion transaction, where the issuer charges one. */
  transferFeeAmount?: number;
  transferFeeCurrency?: "SGD" | "MYR" | "HKD";
  /** Indicative issuer processing time for this route, where published. */
  processingTime?: string;
  /** All promotions currently active for this route (applied + conditional). */
  promotions: PromotionApplication[];
  /** Sum of currently-applied bonuses (unconditional + registered). */
  bonusPartnerPoints: number;
  /** Sum of registration-required bonuses NOT yet confirmed by the user. */
  conditionalBonusPartnerPoints: number;
  /** Base + applied bonuses. */
  promotionalPartnerPoints: number;
  /** Base + applied + conditional (what the user would get if they registered). */
  maxPromotionalPartnerPoints: number;
  /** Best single promotion (legacy convenience for existing UI). */
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

  const registered = new Set(input.registeredPromotionIds ?? []);
  return rules.map((r) => buildResult(input, r, registered, {
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
  registered: Set<string>,
  ctx: { cardGroupName: string; bankName: string; bankId: string; rewardProductName: string; rewardCurrencyName: string },
): RuleResult {
  const programme = getProgrammeById(r.loyaltyProgrammeId)!;
  const points = Math.max(0, Math.floor(input.bankPoints || 0));

  let fullBlocks = Math.floor(points / r.bankPointsPerBlock);
  // Some issuers publish a minimum transfer that differs from the increment.
  // The minimum is enforced first; the increment then applies above it.
  if (
    typeof r.minimumBankPointsPerTransfer === "number" &&
    fullBlocks * r.bankPointsPerBlock < r.minimumBankPointsPerTransfer
  ) {
    fullBlocks = 0;
  }
  let partnerPointsReceived = fullBlocks * r.partnerPointsPerBlock;
  let monthlyCapApplied = false;
  let capApplied: RuleResult["capApplied"];

  // A promotion being live is what activates the bank's campaign cap.
  const promoLive = findApplicablePromotions(ctx.bankId, programme.id, r.eligibleCardGroupId).length > 0;

  const candidateCaps: { type: "monthly" | "campaign" | "annual"; limit: number }[] = [];
  if (typeof r.monthlyCapPartnerPoints === "number") {
    candidateCaps.push({ type: "monthly", limit: r.monthlyCapPartnerPoints });
  }
  if (promoLive && typeof r.campaignCapPartnerPoints === "number") {
    candidateCaps.push({ type: "campaign", limit: r.campaignCapPartnerPoints });
  }
  if (typeof r.annualCapPartnerPoints === "number") {
    candidateCaps.push({ type: "annual", limit: r.annualCapPartnerPoints });
  }
  const binding = candidateCaps
    .filter((c) => partnerPointsReceived > c.limit)
    .sort((a, b) => a.limit - b.limit)[0];

  if (binding) {
    // Never silently present the whole balance as transferable: convert only
    // up to the cap and leave the excess bank points unconverted.
    const cappedBlocks = Math.floor(binding.limit / r.partnerPointsPerBlock);
    fullBlocks = cappedBlocks;
    partnerPointsReceived = cappedBlocks * r.partnerPointsPerBlock;
    capApplied = binding;
    monthlyCapApplied = binding.type === "monthly";
  }

  const capWarning =
    typeof r.campaignCapPartnerPoints === "number" || typeof r.annualCapPartnerPoints === "number"
      ? `${ctx.bankName} applies campaign and annual Air Miles conversion limits. Your actual transferable amount may be lower if you have made previous conversions during this campaign or calendar year.`
      : undefined;
  const bankPointsUsed = fullBlocks * r.bankPointsPerBlock;
  const bankPointsRemaining = points - bankPointsUsed;
  const pointsShortOfNextBlock =
    fullBlocks === 0 ? Math.max(0, r.bankPointsPerBlock - points) : 0;

  const promoData = applyPromotionsToResult(
    ctx.bankId, programme.id, r.eligibleCardGroupId, partnerPointsReceived, registered,
  );

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
    sourceName: r.sourceName ?? r.sourceTitle,
    sourceType: r.sourceType,
    effectiveFrom: r.effectiveFrom,
    notes: r.notes,
    annualCapPartnerPoints: r.annualCapPartnerPoints,
    campaignCapPartnerPoints: r.campaignCapPartnerPoints,
    monthlyCapPartnerPoints: r.monthlyCapPartnerPoints,
    monthlyCapApplied,
    capApplied,
    capWarning,
    minimumTransferPartnerPoints: r.minimumTransferPartnerPoints,
    transferIncrementPartnerPoints: r.transferIncrementPartnerPoints,
    minimumBankPointsPerTransfer: r.minimumBankPointsPerTransfer,
    transferFeeAmount: r.transferFeeAmount,
    transferFeeCurrency: r.transferFeeCurrency,
    processingTime: r.processingTime,
    ...promoData,
  };
}

function applyPromotionsToResult(
  bankId: string,
  programmeId: string,
  cardGroupId: string,
  basePartnerPoints: number,
  registered: Set<string>,
): {
  promotions: PromotionApplication[];
  bonusPartnerPoints: number;
  conditionalBonusPartnerPoints: number;
  promotionalPartnerPoints: number;
  maxPromotionalPartnerPoints: number;
  promotionId?: string;
  promotionName?: string;
  promotionEndDate?: string;
  promotionBonusPercentage?: number;
} {
  const applicable = findApplicablePromotions(bankId, programmeId, cardGroupId);
  if (applicable.length === 0 || basePartnerPoints <= 0) {
    return {
      promotions: [],
      bonusPartnerPoints: 0,
      conditionalBonusPartnerPoints: 0,
      promotionalPartnerPoints: basePartnerPoints,
      maxPromotionalPartnerPoints: basePartnerPoints,
    };
  }

  const applications: PromotionApplication[] = applicable.map((p) => {
    const bonus = computeBonus(p, basePartnerPoints);
    const isRegistered = registered.has(p.id);
    const applied = !p.registrationRequired || isRegistered;
    return {
      id: p.id,
      name: p.name,
      sponsor: p.sponsor,
      programmeId: p.programmeId,
      endDate: p.endDate,
      bonusType: p.bonusType,
      bonusPercentage: p.bonusPercentage,
      bonusFixed: p.bonusFixed,
      bonus,
      registrationRequired: p.registrationRequired,
      applied,
      overallBonusCap: p.overallBonusCap,
      officialSource: p.officialSource,
    };
  });

  const bonusApplied = applications.filter((a) => a.applied).reduce((s, a) => s + a.bonus, 0);
  const bonusConditional = applications.filter((a) => !a.applied).reduce((s, a) => s + a.bonus, 0);

  // Legacy single-promotion pointers = best applicable one.
  const best = findApplicablePromotion(bankId, programmeId, cardGroupId);

  return {
    promotions: applications,
    bonusPartnerPoints: bonusApplied,
    conditionalBonusPartnerPoints: bonusConditional,
    promotionalPartnerPoints: basePartnerPoints + bonusApplied,
    maxPromotionalPartnerPoints: basePartnerPoints + bonusApplied + bonusConditional,
    promotionId: best?.id,
    promotionName: best?.name,
    promotionEndDate: best?.endDate,
    promotionBonusPercentage: best?.bonusType === "percentage" ? best?.bonusPercentage : undefined,
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
    conditionalBonusPartnerPoints: number;
    promotionId?: string;
  }[];
  transferredTotal: number;
  /** Bonus from unconditional or user-registered promotions (currently added). */
  bonusTotal: number;
  /** Bonus from registration-required promotions not yet confirmed. */
  conditionalBonusTotal: number;
  existingBalance: number;
  /** Standard potential: transferredTotal + existingBalance (no promotion). */
  potentialTotal: number;
  /** With currently-applied promotion(s): potentialTotal + bonusTotal. */
  promotionalTotal: number;
  /** Potential if all conditional bonuses were also unlocked. */
  maxPromotionalTotal: number;
  /** Distinct promotions that contributed a bonus to this programme (applied). */
  activePromotionIds: string[];
  /** All applicable promotions (applied + conditional). */
  applicablePromotionIds: string[];
  /** Full promotion payloads (deduped). */
  promotions: PromotionApplication[];
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
      conditionalBonusTotal: 0,
      existingBalance: 0,
      potentialTotal: 0,
      promotionalTotal: 0,
      maxPromotionalTotal: 0,
      activePromotionIds: [],
      applicablePromotionIds: [],
      promotions: [],
    };
    existing.transferredFromEntries.push({
      entryId: r.entryId,
      bankName: r.bankName,
      rewardProductName: r.rewardProductName,
      partnerPointsReceived: r.partnerPointsReceived,
      bonusPartnerPoints: r.bonusPartnerPoints,
      conditionalBonusPartnerPoints: r.conditionalBonusPartnerPoints,
      promotionId: r.promotionId,
    });
    existing.transferredTotal += r.partnerPointsReceived;
    existing.bonusTotal += r.bonusPartnerPoints;
    existing.conditionalBonusTotal += r.conditionalBonusPartnerPoints;
    for (const p of r.promotions) {
      if (!existing.applicablePromotionIds.includes(p.id)) {
        existing.applicablePromotionIds.push(p.id);
        existing.promotions.push(p);
      }
      if (p.applied && !existing.activePromotionIds.includes(p.id)) {
        existing.activePromotionIds.push(p.id);
      }
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
      conditionalBonusTotal: 0,
      existingBalance: 0,
      potentialTotal: 0,
      promotionalTotal: 0,
      maxPromotionalTotal: 0,
      activePromotionIds: [],
      applicablePromotionIds: [],
      promotions: [],
    };
    existing.existingBalance = Math.max(0, Math.floor(bal));
    byProgramme.set(pid, existing);
  }

  const totals = Array.from(byProgramme.values());
  for (const t of totals) {
    t.potentialTotal = t.transferredTotal + t.existingBalance;
    t.promotionalTotal = t.potentialTotal + t.bonusTotal;
    t.maxPromotionalTotal = t.promotionalTotal + t.conditionalBonusTotal;
  }
  totals.sort((a, b) => b.maxPromotionalTotal - a.maxPromotionalTotal);
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

export type { Promotion };
