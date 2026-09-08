/**
 * Block-flooring example used in the explainer.
 *
 * We never invent a rate. The example is always taken from a verified
 * conversion route in the active country dataset — preferably one the user has
 * actually selected — so the figures shown correspond to a real programme.
 */
import {
  CountryCode,
  getBanksByCountry,
  getCardGroupById,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardProductById,
  eligibleCardGroups,
} from "@/data/milesCalculator";

export interface BlockExample {
  bankName: string;
  currencyName: string;
  programmeName: string;
  bankPointsPerBlock: number;
  partnerPointsPerBlock: number;
  /** A balance that does not divide evenly into blocks. */
  enteredPoints: number;
  usedPoints: number;
  leftoverPoints: number;
  receivedPoints: number;
  /** True when the example comes from a card the user selected. */
  fromSelection: boolean;
}

function buildFromCardGroup(cardGroupId: string, fromSelection: boolean): BlockExample | null {
  const group = getCardGroupById(cardGroupId);
  if (!group) return null;
  const product = getRewardProductById(group.rewardProductId);
  if (!product) return null;
  const bank = getBanksByCountry("MY").concat(getBanksByCountry("SG"), getBanksByCountry("HK")).find((b) => b.id === product.bankId);
  const rule = getPublicRulesForCardGroup(cardGroupId)[0];
  if (!rule || !bank) return null;
  const programme = getProgrammeById(rule.loyaltyProgrammeId);
  if (!programme) return null;

  const block = rule.bankPointsPerBlock;
  const partial = Math.max(1, Math.floor(block / 2));
  const entered = block * 2 + partial;
  const used = block * 2;
  return {
    bankName: bank.name,
    currencyName: product.rewardCurrencyName,
    programmeName: programme.name,
    bankPointsPerBlock: block,
    partnerPointsPerBlock: rule.partnerPointsPerBlock,
    enteredPoints: entered,
    usedPoints: used,
    leftoverPoints: entered - used,
    receivedPoints: rule.partnerPointsPerBlock * 2,
    fromSelection,
  };
}

/**
 * @param selectedCardGroupIds card groups currently chosen in Step 1
 * @param country active market — used for the fallback example
 */
export function blockExampleFor(
  selectedCardGroupIds: string[],
  country: CountryCode,
): BlockExample | null {
  for (const id of selectedCardGroupIds) {
    const ex = buildFromCardGroup(id, true);
    if (ex) return ex;
  }
  const bankIds = new Set(getBanksByCountry(country).map((b) => b.id));
  for (const cg of eligibleCardGroups) {
    const product = getRewardProductById(cg.rewardProductId);
    if (!product || !bankIds.has(product.bankId)) continue;
    const ex = buildFromCardGroup(cg.id, false);
    if (ex) return ex;
  }
  return null;
}
