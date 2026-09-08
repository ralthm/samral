// ============================================================================
// HONG KONG REDEMPTION ENGINE (origin HKG)
//
// Only programmes with deterministic, verified award rules are seeded here:
//   1. Cathay Asia Miles  — distance-band standard awards, chart effective 1 May 2026
//   2. KrisFlyer          — Singapore Airlines Saver chart effective 1 Nov 2025 (HKG–SIN only)
//   3. EVA Infinity MileageLands — HKG–TPE published award requirement
//
// Programmes with dynamic / route-specific / interactive pricing (Qatar Avios,
// British Airways Club, Flying Blue, Qantas, Etihad Guest, Royal Orchid Plus)
// deliberately have NO records. Their transferable balances still appear in the
// conversion results; a flight award must never be inferred from alliance
// membership or a distance chart.
//
// All figures are per passenger, one way, unless stated. Award-seat
// availability is not checked.
// ============================================================================

import type { Cabin, RedemptionTarget, Region, TargetStatus } from "./redemptionTargets";

const TAX_NOTE =
  "Taxes, fees and airline surcharges apply and are paid on top of the points requirement.";

const V_ASIA_HK = "2026-09-08";
const V_KF_HK = "2026-09-08";
const V_EVA_HK = "2026-09-08";

const SRC_ASIA_HK = "https://www.cathaypacific.com/cx/en_HK/asia-miles/use-miles/redeem-flights.html";
const TITLE_ASIA_HK = "Cathay standard flight award requirements (chart effective 1 May 2026)";
const SRC_KF_HK = "https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/use-miles/flights/";
const TITLE_KF_HK = "Singapore Airlines KrisFlyer Saver award chart (effective 1 November 2025)";
const SRC_EVA_HK = "https://www.evaair.com/en-global/infinity-mileagelands/use-miles/award-ticket/";
const TITLE_EVA_HK = "EVA Air Infinity MileageLands award ticket chart — Taiwan ↔ Hong Kong/Macau";

/* ---------------------------------------------------------------- */
/* 1. Cathay Asia Miles                                              */
/* ---------------------------------------------------------------- */

/** Cathay distance bands. 751–2,750 miles is split into Type 1 and Type 2;
 *  Type 2 is a designated-market rule (Japan, India, Indonesia, Nepal,
 *  Sri Lanka, Bangladesh), not a pure distance rule. */
export type CathayBand =
  | "ultra_short"
  | "short_type_1"
  | "short_type_2"
  | "medium"
  | "long"
  | "ultra_long";

/** Markets priced as Short Type 2 when within the 751–2,750 mile band. */
export const CATHAY_TYPE_2_MARKETS: readonly string[] = [
  "Japan",
  "India",
  "Indonesia",
  "Nepal",
  "Sri Lanka",
  "Bangladesh",
];

export interface CathayBandPricing {
  label: string;
  economy: number;
  premiumEconomy: number;
  business: number;
  first?: number;
}

/** Chart effective 1 May 2026. Do not substitute pre-May-2026 figures. */
export const CATHAY_BANDS: Record<CathayBand, CathayBandPricing> = {
  ultra_short: { label: "Ultra-short (1–750 miles)", economy: 7000, premiumEconomy: 11000, business: 16000 },
  short_type_1: { label: "Short Type 1 (751–2,750 miles)", economy: 9000, premiumEconomy: 18000, business: 27000, first: 43000 },
  short_type_2: { label: "Short Type 2 (751–2,750 miles, designated markets)", economy: 13000, premiumEconomy: 23000, business: 33000, first: 50000 },
  medium: { label: "Medium (2,751–5,000 miles)", economy: 20000, premiumEconomy: 39000, business: 60000, first: 90000 },
  long: { label: "Long (5,001–7,500 miles)", economy: 27000, premiumEconomy: 52000, business: 91000, first: 125000 },
  ultra_long: { label: "Ultra-long (7,501+ miles)", economy: 38000, premiumEconomy: 78000, business: 119000, first: 160000 },
};

/**
 * Band selection rule. Distance alone is not sufficient: within 751–2,750
 * miles, designated markets price as Short Type 2.
 */
export function cathayBandFor(distanceMiles: number, destinationCountry: string): CathayBand {
  if (distanceMiles <= 750) return "ultra_short";
  if (distanceMiles <= 2750) {
    return CATHAY_TYPE_2_MARKETS.includes(destinationCountry) ? "short_type_2" : "short_type_1";
  }
  if (distanceMiles <= 5000) return "medium";
  if (distanceMiles <= 7500) return "long";
  return "ultra_long";
}

interface CxSeed {
  code: string;
  city: string;
  country: string;
  region: Region;
  band: CathayBand;
  /** Approximate great-circle distance from HKG, used only for band auditing. */
  distanceMiles: number;
  /** Cabins Cathay operates on the route. First is only seeded where offered. */
  cabins: Cabin[];
}

const Y: Cabin = "Economy";
const W: Cabin = "Premium Economy";
const J: Cabin = "Business";
const F: Cabin = "First or Business Suite";

const cathaySeeds: CxSeed[] = [
  // Ultra-short
  { code: "TPE", city: "Taipei", country: "Taiwan", region: "North Asia", band: "ultra_short", distanceMiles: 501, cabins: [Y, W, J] },
  { code: "HAN", city: "Hanoi", country: "Vietnam", region: "Malaysia and Southeast Asia", band: "ultra_short", distanceMiles: 535, cabins: [Y, W, J] },
  { code: "MNL", city: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", band: "ultra_short", distanceMiles: 693, cabins: [Y, W, J] },
  { code: "XMN", city: "Xiamen", country: "Mainland China", region: "North Asia", band: "ultra_short", distanceMiles: 314, cabins: [Y, J] },
  { code: "CAN", city: "Guangzhou", country: "Mainland China", region: "North Asia", band: "ultra_short", distanceMiles: 80, cabins: [Y, J] },

  // Short Type 1
  { code: "BKK", city: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1044, cabins: [Y, W, J] },
  { code: "SIN", city: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1594, cabins: [Y, W, J] },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1558, cabins: [Y, W, J] },
  { code: "ICN", city: "Seoul", country: "South Korea", region: "North Asia", band: "short_type_1", distanceMiles: 1295, cabins: [Y, W, J] },
  { code: "PEK", city: "Beijing", country: "Mainland China", region: "North Asia", band: "short_type_1", distanceMiles: 1220, cabins: [Y, W, J] },
  { code: "PVG", city: "Shanghai", country: "Mainland China", region: "North Asia", band: "short_type_1", distanceMiles: 771, cabins: [Y, W, J] },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 928, cabins: [Y, W, J] },
  { code: "HKT", city: "Phuket", country: "Thailand", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1478, cabins: [Y, J] },
  { code: "CNX", city: "Chiang Mai", country: "Thailand", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1039, cabins: [Y, J] },
  { code: "PNH", city: "Phnom Penh", country: "Cambodia", region: "Malaysia and Southeast Asia", band: "short_type_1", distanceMiles: 1000, cabins: [Y, J] },

  // Short Type 2 (designated markets)
  { code: "NRT", city: "Tokyo Narita", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 1800, cabins: [Y, W, J, F] },
  { code: "HND", city: "Tokyo Haneda", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 1791, cabins: [Y, W, J, F] },
  { code: "KIX", city: "Osaka", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 1533, cabins: [Y, W, J] },
  { code: "FUK", city: "Fukuoka", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 1244, cabins: [Y, J] },
  { code: "NGO", city: "Nagoya", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 1663, cabins: [Y, J] },
  { code: "CTS", city: "Sapporo", country: "Japan", region: "North Asia", band: "short_type_2", distanceMiles: 2249, cabins: [Y, J] },
  { code: "CGK", city: "Jakarta", country: "Indonesia", region: "Malaysia and Southeast Asia", band: "short_type_2", distanceMiles: 2018, cabins: [Y, W, J] },
  { code: "DPS", city: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", band: "short_type_2", distanceMiles: 2137, cabins: [Y, W, J] },
  { code: "BOM", city: "Mumbai", country: "India", region: "South Asia", band: "short_type_2", distanceMiles: 2673, cabins: [Y, W, J] },
  { code: "DEL", city: "Delhi", country: "India", region: "South Asia", band: "short_type_2", distanceMiles: 2340, cabins: [Y, W, J] },
  { code: "KTM", city: "Kathmandu", country: "Nepal", region: "South Asia", band: "short_type_2", distanceMiles: 2050, cabins: [Y, J] },

  // Medium
  { code: "SYD", city: "Sydney", country: "Australia", region: "Australia and New Zealand", band: "medium", distanceMiles: 4577, cabins: [Y, W, J, F] },
  { code: "MEL", city: "Melbourne", country: "Australia", region: "Australia and New Zealand", band: "medium", distanceMiles: 4622, cabins: [Y, W, J] },
  { code: "PER", city: "Perth", country: "Australia", region: "Australia and New Zealand", band: "medium", distanceMiles: 3742, cabins: [Y, W, J] },
  { code: "ADL", city: "Adelaide", country: "Australia", region: "Australia and New Zealand", band: "medium", distanceMiles: 4258, cabins: [Y, J] },
  { code: "BNE", city: "Brisbane", country: "Australia", region: "Australia and New Zealand", band: "medium", distanceMiles: 4318, cabins: [Y, W, J] },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", region: "Middle East", band: "medium", distanceMiles: 3695, cabins: [Y, W, J] },
  { code: "MLE", city: "Malé", country: "Maldives", region: "South Asia", band: "medium", distanceMiles: 3208, cabins: [Y, J] },

  // Long
  { code: "LHR", city: "London", country: "United Kingdom", region: "Europe", band: "long", distanceMiles: 5990, cabins: [Y, W, J, F] },
  { code: "CDG", city: "Paris", country: "France", region: "Europe", band: "long", distanceMiles: 5977, cabins: [Y, W, J] },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", region: "Europe", band: "long", distanceMiles: 5764, cabins: [Y, W, J] },
  { code: "FRA", city: "Frankfurt", country: "Germany", region: "Europe", band: "long", distanceMiles: 5677, cabins: [Y, W, J] },
  { code: "ZRH", city: "Zurich", country: "Switzerland", region: "Europe", band: "long", distanceMiles: 5735, cabins: [Y, W, J] },
  { code: "MXP", city: "Milan", country: "Italy", region: "Europe", band: "long", distanceMiles: 5691, cabins: [Y, W, J] },
  { code: "SFO", city: "San Francisco", country: "United States", region: "North America", band: "long", distanceMiles: 6905, cabins: [Y, W, J, F] },
  { code: "LAX", city: "Los Angeles", country: "United States", region: "North America", band: "long", distanceMiles: 7256, cabins: [Y, W, J, F] },
  { code: "YVR", city: "Vancouver", country: "Canada", region: "North America", band: "long", distanceMiles: 6383, cabins: [Y, W, J] },

  // Ultra-long
  { code: "JFK", city: "New York", country: "United States", region: "North America", band: "ultra_long", distanceMiles: 8054, cabins: [Y, W, J, F] },
  { code: "YYZ", city: "Toronto", country: "Canada", region: "North America", band: "ultra_long", distanceMiles: 7811, cabins: [Y, W, J] },
  { code: "ORD", city: "Chicago", country: "United States", region: "North America", band: "ultra_long", distanceMiles: 7797, cabins: [Y, W, J] },
];

const CABIN_SUFFIX: Record<Cabin, string> = {
  Economy: "y",
  "Premium Economy": "w",
  Business: "j",
  "First or Business Suite": "f",
};

function cathayPointsFor(band: CathayBand, cabin: Cabin): number | undefined {
  const p = CATHAY_BANDS[band];
  switch (cabin) {
    case "Economy":
      return p.economy;
    case "Premium Economy":
      return p.premiumEconomy;
    case "Business":
      return p.business;
    case "First or Business Suite":
      return p.first;
  }
}

function buildAsiaMilesHK(): RedemptionTarget[] {
  const shared = {
    programmeId: "asia-miles",
    loyaltyProgrammeId: "asia-miles",
    programmeName: "Cathay — Asia Miles",
    operatingAirline: "Cathay Pacific",
    marketingAirline: "Cathay Pacific",
    country: "HK" as const,
    originAirport: "HKG",
    originCountry: "Hong Kong SAR",
    awardType: "Cathay standard flight award",
    redemptionType: "asia_miles_standard" as const,
    pricingBasis: "zone_based" as const,
    returnBookingRequired: false,
    perDirection: false,
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    nonstopOnly: true,
    effectiveFrom: "2026-05-01",
    verifiedOn: V_ASIA_HK,
    routeVerifiedDate: V_ASIA_HK,
    awardPriceVerifiedDate: V_ASIA_HK,
    sourceUrl: SRC_ASIA_HK,
    sourceTitle: TITLE_ASIA_HK,
    source: {
      sourceName: "Cathay standard flight award requirements (repricing effective 1 May 2026)",
      sourceUrl: SRC_ASIA_HK,
      sourceType: "official_airline" as const,
      verifiedAt: V_ASIA_HK,
      effectiveFrom: "2026-05-01",
      notes:
        "Cathay Pacific-operated standard flight awards priced by distance band. The 751–2,750 mile band is split into Type 1 and Type 2 designated markets.",
    },
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
    verificationLevel: "official-chart-transcription" as const,
  };

  const out: RedemptionTarget[] = [];
  for (const s of cathaySeeds) {
    const band = s.band;
    for (const cabin of s.cabins) {
      const points = cathayPointsFor(band, cabin);
      if (!points) continue;
      out.push({
        ...shared,
        id: `hk-cx-${s.code.toLowerCase()}-${CABIN_SUFFIX[cabin]}`,
        destination: s.code,
        destinationName: s.city,
        destinationCountry: s.country,
        region: s.region,
        cabin,
        pointsPerPerson: points,
        status: "verified" as TargetStatus,
        notes: `Cathay Pacific-operated nonstop flight from Hong Kong. ${CATHAY_BANDS[band].label}. Award-seat availability has not been checked.`,
      });
    }
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* 2. KrisFlyer — HKG (Zone 4) to Singapore                          */
/* ---------------------------------------------------------------- */

function buildKrisflyerHK(): RedemptionTarget[] {
  const shared = {
    programmeId: "krisflyer",
    loyaltyProgrammeId: "krisflyer",
    programmeName: "KrisFlyer",
    operatingAirline: "Singapore Airlines",
    marketingAirline: "Singapore Airlines",
    country: "HK" as const,
    originAirport: "HKG",
    originCountry: "Hong Kong SAR",
    destination: "SIN",
    destinationName: "Singapore",
    destinationCountry: "Singapore",
    region: "Malaysia and Southeast Asia" as Region,
    awardType: "KrisFlyer Saver",
    redemptionType: "krisflyer_saver" as const,
    pricingBasis: "zone_based" as const,
    returnBookingRequired: false,
    perDirection: false,
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    nonstopOnly: true,
    effectiveFrom: "2025-11-01",
    verifiedOn: V_KF_HK,
    routeVerifiedDate: V_KF_HK,
    awardPriceVerifiedDate: V_KF_HK,
    sourceUrl: SRC_KF_HK,
    sourceTitle: TITLE_KF_HK,
    source: {
      sourceName: "Singapore Airlines KrisFlyer Saver award chart (effective 1 November 2025)",
      sourceUrl: SRC_KF_HK,
      sourceType: "official_airline" as const,
      verifiedAt: V_KF_HK,
      effectiveFrom: "2025-11-01",
      notes:
        "Hong Kong is KrisFlyer Zone 4. Standard Saver pricing on Singapore Airlines-operated nonstop flights. Temporary promotional pricing such as Spontaneous Escapes is never used as a calculator price.",
    },
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
    verificationLevel: "official-chart-transcription" as const,
    status: "verified" as TargetStatus,
    notes:
      "Singapore Airlines-operated nonstop flight, Zone 4 to Zone 1 Saver award. Onward KrisFlyer itineraries beyond Singapore are not shown until each routing is separately validated. Award-seat availability has not been checked.",
  };

  return [
    { ...shared, id: "hk-kf-sin-y", cabin: "Economy" as Cabin, pointsPerPerson: 15500 },
    { ...shared, id: "hk-kf-sin-w", cabin: "Premium Economy" as Cabin, pointsPerPerson: 25000 },
    { ...shared, id: "hk-kf-sin-j", cabin: "Business" as Cabin, pointsPerPerson: 35500 },
  ];
}

/* ---------------------------------------------------------------- */
/* 3. EVA Air Infinity MileageLands — HKG to Taipei                  */
/* ---------------------------------------------------------------- */

function buildEvaHK(): RedemptionTarget[] {
  const shared = {
    programmeId: "eva",
    loyaltyProgrammeId: "eva",
    programmeName: "EVA Air Infinity MileageLands",
    operatingAirline: "EVA Air",
    marketingAirline: "EVA Air",
    country: "HK" as const,
    originAirport: "HKG",
    originCountry: "Hong Kong SAR",
    destination: "TPE",
    destinationName: "Taipei",
    destinationCountry: "Taiwan",
    region: "North Asia" as Region,
    awardType: "Infinity MileageLands award ticket",
    redemptionType: "asia_miles_standard" as const,
    pricingBasis: "fixed_chart_one_way" as const,
    returnBookingRequired: false,
    perDirection: false,
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    nonstopOnly: true,
    verifiedOn: V_EVA_HK,
    routeVerifiedDate: V_EVA_HK,
    awardPriceVerifiedDate: V_EVA_HK,
    sourceUrl: SRC_EVA_HK,
    sourceTitle: TITLE_EVA_HK,
    source: {
      sourceName: "EVA Air Infinity MileageLands award chart — Taiwan ↔ Hong Kong/Macau",
      sourceUrl: SRC_EVA_HK,
      sourceType: "official_airline" as const,
      verifiedAt: V_EVA_HK,
      notes: "One way: 10,000 Economy / 25,000 Business. Round trip: 20,000 Economy / 50,000 Business.",
    },
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
    verificationLevel: "official-chart-transcription" as const,
    status: "verified" as TargetStatus,
    notes:
      "EVA Air-operated nonstop flight. A round trip is priced at exactly twice the one-way requirement. Award-seat availability has not been checked.",
  };

  return [
    { ...shared, id: "hk-eva-tpe-y", cabin: "Economy" as Cabin, pointsPerPerson: 10000 },
    { ...shared, id: "hk-eva-tpe-j", cabin: "Business" as Cabin, pointsPerPerson: 25000 },
  ];
}

export function buildHongKongTargets(): RedemptionTarget[] {
  return [...buildAsiaMilesHK(), ...buildKrisflyerHK(), ...buildEvaHK()];
}
