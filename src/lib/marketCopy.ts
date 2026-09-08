/**
 * Country-derived copy for shared Malaysia/Singapore components. Nothing in a
 * shared component may hard-code a single market's wording.
 */
export type Market = "MY" | "SG" | "HK";

export const MARKET_ADJECTIVE: Record<Market, string> = {
  MY: "Malaysian",
  SG: "Singapore",
  HK: "Hong Kong",
};

export function marketAdjective(country: Market): string {
  return MARKET_ADJECTIVE[country] ?? MARKET_ADJECTIVE.MY;
}

/** Heading for the rates directory ("Browse all … conversion rates"). */
export function ratesDirectoryHeading(country: Market): string {
  return `Browse all ${marketAdjective(country)} conversion rates`;
}

export function ratesDirectoryCaption(country: Market): string {
  return `${marketAdjective(country)} credit card points to airline/hotel programme conversion rates`;
}
