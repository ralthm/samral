/** Earning-rate selection for the comparison page. Verified issuer rates always win
 * unless the user deliberately switches on a custom rate for the current card. */
export interface EarningRateState {
  cardId: string;
  /** Rate typed for illustrative / unverified cards. */
  manualRate: number | undefined;
  /** Separate custom override for a verified card; off by default. */
  useCustom: boolean;
  customRate: number | undefined;
}

export const ILLUSTRATIVE_RATE = 1.4;

export function initialEarningState(): EarningRateState {
  return { cardId: "", manualRate: ILLUSTRATIVE_RATE, useCustom: false, customRate: undefined };
}

/** Any card or country change starts clean: no carried-over custom or manual rate. */
export function selectEarningCard(cardId: string): EarningRateState {
  return { cardId, manualRate: cardId ? undefined : ILLUSTRATIVE_RATE, useCustom: false, customRate: undefined };
}

export function effectiveEarningRate(state: EarningRateState, verifiedRate: number | undefined): number | undefined {
  if (verifiedRate === undefined) return state.manualRate;
  return state.useCustom ? state.customRate : verifiedRate;
}

/** Turning custom on starts empty, never from a stale value; turning it off clears it. */
export function setCustomEarning(state: EarningRateState, on: boolean): EarningRateState {
  return { ...state, useCustom: on, customRate: undefined };
}
