// Destination-opportunity engine.
//
// Three programme-specific redemption datasets: Enrich, KrisFlyer, and Cathay —
// Asia Miles. Each programme has its own pricing rules (Enrich Saver is round-
// trip only with per-direction pricing; KrisFlyer uses the Saver award chart
// effective 1 November 2025; Asia Miles uses Cathay-operated standard awards).
//
// A programme only appears in "Where can your points take you?" if it is in
// SUPPORTED_PROGRAMMES. Bank->programme transfer routes that lack a completed
// redemption engine (AirAsia points, Flying Blue, etc.) remain in the transfer
// results section but are excluded from the destination filter.
//
// Every figure MUST be re-verified against the official award chart before
// publication; only records with status "verified" are treated as a firm
// target. Records with status "needs_review" render a verification warning
// instead of a definitive requirement.

import { buildHongKongTargets } from "./redemption.hk";
import {
  KRISFLYER_ZONES_FROM_ZONE1,
  SQ_DESTINATIONS_FROM_SIN,
  saverMilesFor,
} from "./krisflyerZones";

export type Region =
  | "Malaysia and Southeast Asia"
  | "North Asia"
  | "South Asia"
  | "Australia and New Zealand"
  | "Europe"
  | "Middle East"
  | "North America"
  | "Africa";

export type Cabin = "Economy" | "Premium Economy" | "Business" | "First or Business Suite";

export type TripType = "one_way" | "return";

export type RedemptionType =
  | "enrich_saver"
  | "krisflyer_saver"
  | "asia_miles_standard";

export type TargetStatus =
  | "verified"
  /** Route is supported by the programme but the current award price has not
   * been verified against the official chart/calculator. Never treated as a
   * firm target and never shown in "You can reach these now". */
  | "supported_unverified"
  | "needs_review"
  | "expired"
  | "unavailable"
  | "suspended";

/** Market a redemption dataset belongs to. Mirrors the card-side CountryCode. */
export type MarketCountry = "MY" | "SG" | "HK";

/** Departure airports available per market. Structured as a list so a market
 * can gain additional origins without touching calculation logic. */
export const COUNTRY_ORIGINS: Record<MarketCountry, { airport: string; city: string; country: string }[]> = {
  MY: [{ airport: "KUL", city: "Kuala Lumpur", country: "Malaysia" }],
  SG: [{ airport: "SIN", city: "Singapore", country: "Singapore" }],
  HK: [{ airport: "HKG", city: "Hong Kong", country: "Hong Kong SAR" }],
};

export function originLabelForCountry(country: MarketCountry): string {
  const os = COUNTRY_ORIGINS[country] ?? [];
  return os.map((o) => `${o.city} (${o.airport})`).join(", ");
}

/** Provenance of a stored figure. Never label a reconstructed third-party
 * table as an official published chart. */
export type SourceType =
  | "official_bank"
  | "official_loyalty_programme"
  | "official_airline"
  | "verified_secondary";

export interface SourceMetadata {
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  verifiedAt: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
}

/** Programmes with a complete, current redemption engine. Others may appear in
 * transfer results but not in the destination filter. */
export const SUPPORTED_PROGRAMMES: readonly string[] = ["enrich", "krisflyer", "asia-miles", "eva"];

export interface RedemptionTarget {
  id: string;
  programmeId: string;
  loyaltyProgrammeId: string;
  programmeName: string;
  operatingAirline: string;
  marketingAirline: string;
  /** Market this record belongs to (card-side country). */
  country: MarketCountry;
  originAirport: string;
  originCountry: string;
  destination: string;
  destinationName: string;
  destinationCountry: string;
  region: Region;
  connectionAirports: string[];
  numberOfSegments: number;
  directOrConnecting: "direct" | "connecting";
  cabin: Cabin;
  awardType: string;
  redemptionType: RedemptionType;
  pricingBasis: "fixed_chart_per_direction" | "fixed_chart_one_way" | "zone_based";
  pointsPerPerson: number;
  returnBookingRequired: boolean;
  perDirection: boolean;
  /** Whether the seed is a transcription of the official published chart, or
   * observed redemption pricing (e.g. BolehMiles). Rendered on the card. */
  verificationLevel?: "official-chart-transcription" | "observed-redemption-data";
  /** Secondary reference source (e.g. BolehMiles chart mirror). */
  rateReferenceSource?: string;
  nonstopOnly?: boolean;
  /** Subtle qualification shown on connecting itineraries (e.g. KrisFlyer
   * routing/backtracking conditions). */
  routingNote?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  verifiedOn: string;
  sourceUrl: string;
  sourceTitle: string;
  /** Structured provenance. Prefer official sources; verified_secondary is
   * only used where the programme publishes no static chart. */
  source: SourceMetadata;
  availabilityChecked: boolean;
  taxesAndFeesNote: string;
  status: TargetStatus;
  notes?: string;
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

const V_ENRICH = "2026-07-01";
const V_KRISFLYER = "2026-07-01";
const V_ASIA = "2026-08-12";
/** China routes re-verified in the August 2026 QA pass (CSX / SZX). */
const V_ENRICH_CN_2026_08 = "2026-08-12";

const SRC_ENRICH = "https://www.malaysiaairlines.com/my/en/enrich/use-enrich-miles/redeem-flights.html";
const TITLE_ENRICH = "Malaysia Airlines Enrich — Redeem Flights";
const SRC_KRISFLYER = "https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/use-miles/flights/";
const TITLE_KRISFLYER = "Singapore Airlines KrisFlyer Award Chart (effective 1 November 2025)";
const SRC_ASIA = "https://www.cathaypacific.com/cx/en_HK/asia-miles/use-miles/redeem-flights.html";
const TITLE_ASIA = "Cathay Pacific Standard Flight Award — current award reference";

const KF_ROUTING_NOTE =
  "Based on the current Singapore Airlines Saver award chart. Exact mileage may depend on the itinerary accepted by KrisFlyer.";

const TAX_NOTE = "Taxes, fees and airline surcharges apply and are paid on top of the points requirement.";

/* ===================================================================== */
/* ENRICH — Malaysia Airlines-operated Saver awards, return-only.        */
/* Points quoted per person, per direction. Only MH-operated flights.    */
/* ===================================================================== */

interface EnrichSeed {
  code: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  economy?: number;
  business?: number;
  verificationLevel?: "official-chart-transcription" | "observed-redemption-data";
  notes?: string;
  status?: TargetStatus;
  /** Per-record override when a single route has been re-verified more recently. */
  verifiedOn?: string;
}

// Malaysia Airlines Enrich Saver — every value is one-way per person from KUL
// on a Malaysia Airlines-operated nonstop flight. Return = one-way × 2.
// Premium Economy is deliberately absent: the current Enrich Saver chart
// publishes Economy and Business Saver only. Do not invent Premium Economy
// values because an aircraft has that cabin.
//
// Official chart: https://enrich.malaysiaairlines.com/enrich/products/enrich-saver/fixed-redemption.html
// Secondary reference: https://bolehmiles.com/enrich-redemption-chart/
const enrichSeeds: EnrichSeed[] = [
  // Domestic — Peninsular Malaysia
  { code: "aor", destination: "AOR", destinationName: "Alor Setar", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2100, business: 9300 },
  { code: "jhb", destination: "JHB", destinationName: "Johor Bahru", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2100, business: 9300 },
  { code: "kbr", destination: "KBR", destinationName: "Kota Bharu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2100, business: 9300 },
  { code: "tgg", destination: "TGG", destinationName: "Kuala Terengganu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2100, business: 9300 },
  { code: "kua", destination: "KUA", destinationName: "Kuantan", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2100, business: 9300 },
  { code: "lgk", destination: "LGK", destinationName: "Langkawi", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2300, business: 9300 },
  { code: "pen", destination: "PEN", destinationName: "Penang", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 2300, business: 9300 },
  // Domestic — Sarawak
  { code: "kch", destination: "KCH", destinationName: "Kuching", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 3900, business: 18000 },
  { code: "myy", destination: "MYY", destinationName: "Miri", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 3200, business: 18000 },
  { code: "sbw", destination: "SBW", destinationName: "Sibu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 3200, business: 18000 },
  { code: "btu", destination: "BTU", destinationName: "Bintulu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 3000, business: 18000 },
  // Domestic — Sabah
  { code: "sdk", destination: "SDK", destinationName: "Sandakan", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 4400, business: 21300 },
  { code: "lbu", destination: "LBU", destinationName: "Labuan", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 4400, business: 21300 },
  { code: "bki", destination: "BKI", destinationName: "Kota Kinabalu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 4600, business: 21300 },
  { code: "twu", destination: "TWU", destinationName: "Tawau", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 4600, business: 21300 },
  // ASEAN
  { code: "kjt", destination: "KJT", destinationName: "Kertajati", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 3700, business: 11900 },
  { code: "hkt", destination: "HKT", destinationName: "Phuket", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 5000, business: 15900 },
  { code: "kno", destination: "KNO", destinationName: "Medan", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 4200, business: 16900 },
  { code: "sgn", destination: "SGN", destinationName: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 7100, business: 18900 },
  { code: "dad", destination: "DAD", destinationName: "Da Nang", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 5400, business: 19200 },
  { code: "han", destination: "HAN", destinationName: "Hanoi", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 6900, business: 19400 },
  { code: "rgn", destination: "RGN", destinationName: "Yangon", country: "Myanmar", region: "Malaysia and Southeast Asia", economy: 7300, business: 19500 },
  { code: "sin", destination: "SIN", destinationName: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", economy: 5400, business: 20000 },
  { code: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 7200, business: 20000 },
  { code: "sub", destination: "SUB", destinationName: "Surabaya", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 6700, business: 20400 },
  { code: "cgk", destination: "CGK", destinationName: "Jakarta", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 6700, business: 21400 },
  { code: "pnh", destination: "PNH", destinationName: "Phnom Penh", country: "Cambodia", region: "Malaysia and Southeast Asia", economy: 6700, business: 21600 },
  { code: "cnx", destination: "CNX", destinationName: "Chiang Mai", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 8000, business: 24200 },
  { code: "dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 8500, business: 25000 },
  { code: "mnl", destination: "MNL", destinationName: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", economy: 11700, business: 36900 },
  // South Asia
  { code: "mle", destination: "MLE", destinationName: "Malé (Maldives)", country: "Maldives", region: "South Asia", economy: 5500, business: 16300 },
  { code: "trv", destination: "TRV", destinationName: "Thiruvananthapuram", country: "India", region: "South Asia", economy: 7600, business: 18200 },
  { code: "atq", destination: "ATQ", destinationName: "Amritsar", country: "India", region: "South Asia", economy: 8400, business: 19000 },
  { code: "amd", destination: "AMD", destinationName: "Ahmedabad", country: "India", region: "South Asia", economy: 9000, business: 19700 },
  { code: "cok", destination: "COK", destinationName: "Kochi", country: "India", region: "South Asia", economy: 11300, business: 31300 },
  { code: "maa", destination: "MAA", destinationName: "Chennai", country: "India", region: "South Asia", economy: 11900, business: 31800 },
  { code: "blr", destination: "BLR", destinationName: "Bengaluru", country: "India", region: "South Asia", economy: 12300, business: 35400 },
  { code: "hyd", destination: "HYD", destinationName: "Hyderabad", country: "India", region: "South Asia", economy: 13400, business: 42700 },
  { code: "ktm", destination: "KTM", destinationName: "Kathmandu", country: "Nepal", region: "South Asia", economy: 17400, business: 43800 },
  { code: "bom", destination: "BOM", destinationName: "Mumbai", country: "India", region: "South Asia", economy: 17200, business: 44000 },
  { code: "dac", destination: "DAC", destinationName: "Dhaka", country: "Bangladesh", region: "South Asia", economy: 17500, business: 34500 },
  { code: "cmb", destination: "CMB", destinationName: "Colombo", country: "Sri Lanka", region: "South Asia", economy: 9700, business: 46000 },
  { code: "del", destination: "DEL", destinationName: "New Delhi", country: "India", region: "South Asia", economy: 16800, business: 50800 },
  // Middle East
  { code: "doh", destination: "DOH", destinationName: "Doha", country: "Qatar", region: "Middle East", economy: 38700, business: 175100 },
  // China & North Asia
  { code: "tfu", destination: "TFU", destinationName: "Chengdu", country: "China", region: "North Asia", economy: 11600, business: 35200 },
  { code: "xmn", destination: "XMN", destinationName: "Xiamen", country: "China", region: "North Asia", economy: 11200, business: 37100 },
  { code: "can", destination: "CAN", destinationName: "Guangzhou", country: "China", region: "North Asia", economy: 14000, business: 40000 },
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", economy: 14100, business: 40000 },
  { code: "pvg", destination: "PVG", destinationName: "Shanghai", country: "China", region: "North Asia", economy: 19600, business: 47500 },
  { code: "pkx", destination: "PKX", destinationName: "Beijing", country: "China", region: "North Asia", economy: 19900, business: 48700 },
  { code: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", economy: 13200, business: 36000 },
  { code: "kix", destination: "KIX", destinationName: "Osaka", country: "Japan", region: "North Asia", economy: 19600, business: 50000 },
  { code: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", economy: 20400, business: 50000 },
  { code: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", economy: 20000, business: 48000 },
  // Australia & New Zealand
  { code: "per", destination: "PER", destinationName: "Perth", country: "Australia", region: "Australia and New Zealand", economy: 19600, business: 55000 },
  { code: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", economy: 25000, business: 75000 },
  { code: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", economy: 25000, business: 75000 },
  { code: "adl", destination: "ADL", destinationName: "Adelaide", country: "Australia", region: "Australia and New Zealand", economy: 25000, business: 75000 },
  { code: "bne", destination: "BNE", destinationName: "Brisbane", country: "Australia", region: "Australia and New Zealand", economy: 16900, business: 102500 },
  { code: "akl", destination: "AKL", destinationName: "Auckland", country: "New Zealand", region: "Australia and New Zealand", economy: 35000, business: 105000 },
  // Europe
  { code: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", economy: 33000, business: 108000 },
  { code: "cdg", destination: "CDG", destinationName: "Paris (Charles de Gaulle)", country: "France", region: "Europe", economy: 43100, business: 165200 },
  // Observed pricing (not official chart transcriptions) — label as observed.
  { code: "csx", destination: "CSX", destinationName: "Changsha", country: "China", region: "North Asia", economy: 9500, business: 56500, verificationLevel: "observed-redemption-data", verifiedOn: V_ENRICH_CN_2026_08, notes: "Changsha and Shenzhen share the same current Enrich Saver pricing band in the verified dataset." },
  { code: "szx", destination: "SZX", destinationName: "Shenzhen", country: "China", region: "North Asia", economy: 9500, business: 56500, verificationLevel: "observed-redemption-data", verifiedOn: V_ENRICH_CN_2026_08, notes: "Changsha and Shenzhen share the same current Enrich Saver pricing band in the verified dataset." },
  { code: "fuk", destination: "FUK", destinationName: "Fukuoka", country: "Japan", region: "North Asia", economy: 16900, business: 64000, verificationLevel: "observed-redemption-data" },
];

function buildEnrichTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "enrich",
    loyaltyProgrammeId: "enrich",
    programmeName: "Enrich",
    operatingAirline: "Malaysia Airlines",
    marketingAirline: "Malaysia Airlines",
    country: "MY" as const,
    originAirport: "KUL",
    originCountry: "Malaysia",
    awardType: "Enrich Saver",
    redemptionType: "enrich_saver" as const,
    pricingBasis: "fixed_chart_per_direction" as const,
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    returnBookingRequired: false,
    perDirection: true,
    nonstopOnly: true,
    verifiedOn: V_ENRICH,
    sourceUrl: SRC_ENRICH,
    sourceTitle: TITLE_ENRICH,
    source: {
      sourceName: "Malaysia Airlines Enrich — Enrich Saver fixed redemption chart",
      sourceUrl: SRC_ENRICH,
      sourceType: "official_loyalty_programme" as const,
      verifiedAt: V_ENRICH,
      notes: "Observed-pricing records are corroborated against current Enrich Saver redemptions where the published chart does not list the route.",
    },
    rateReferenceSource: "https://bolehmiles.com/enrich-redemption-chart/",
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const pushCabin = (s: EnrichSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `enrich-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      destinationCountry: s.country,
      region: s.region,
      cabin,
      pointsPerPerson: points,
      status: s.status ?? "verified",
      verificationLevel: s.verificationLevel ?? "official-chart-transcription",
      verifiedOn: s.verifiedOn ?? V_ENRICH,
      source: { ...shared.source, verifiedAt: s.verifiedOn ?? V_ENRICH },
      notes: s.notes,
    });
  };
  for (const s of enrichSeeds) {
    if (s.economy) pushCabin(s, "Economy", s.economy, "y");
    if (s.business) pushCabin(s, "Business", s.business, "j");
    // Enrich Saver publishes Economy and Business only — never emit Premium
    // Economy or First even if the aircraft has that cabin.
  }
  return out;
}

/* ===================================================================== */
/* KRISFLYER — Singapore Airlines Saver, effective 1 November 2025.      */
/* Origin-to-destination single figure (not per-segment sum). Priced     */
/* per person, per one-way; return doubles. SQ-operated only.            */
/* ===================================================================== */

interface KfSeed {
  code: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  /** [] means direct KUL–dest on SQ (rare); otherwise ["SIN"] for KUL–SIN–dest. */
  connection: string[];
  economy?: number;
  premiumEconomy?: number;
  business?: number;
  suites?: number;
  notes?: string;
  status?: TargetStatus;
}

// KrisFlyer Saver chart effective 1 November 2025 — KUL/PEN origin figures
// confirmed against the BolehMiles KUL/PEN chart (rate reference last updated
// June 2026), which mirrors the official Singapore Airlines chart.
//
// Pricing rule: for a Singapore Airlines through itinerary booked from Kuala
// Lumpur or Penang via Singapore to the final destination, use the published
// KUL/PEN origin-to-destination amount. Do NOT sum KUL–SIN + SIN–destination.
//
// Every record is one-way per traveller. Return = one-way × 2.
// Premium Economy is only stored where the KUL/PEN chart publishes an exact
// value. A caret ("^") in the source chart means "use the calculator" and
// must NOT be recorded as zero or estimated.
const krisflyerSeeds: KfSeed[] = [
  // KUL → SIN (direct)
  { code: "sin", destination: "SIN", destinationName: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", connection: [], economy: 8000, business: 22000, suites: 32000 },
  // KUL → SIN → BKK (Zone 3)
  { code: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", connection: ["SIN"], economy: 13500, business: 26500, suites: 39500 },
  // KUL → SIN → DPS (Zone 2)
  { code: "dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", connection: ["SIN"], economy: 8500, business: 23000, suites: 33500 },
  // KUL → SIN → HKG (Zone 4)
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", connection: ["SIN"], economy: 16000, premiumEconomy: 28500, business: 36500, suites: 48500 },
  // KUL → SIN → TPE (Zone 4)
  { code: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", connection: ["SIN"], economy: 16000, premiumEconomy: 28500, business: 36500, suites: 48500 },
  // KUL → SIN → DEL (Zone 6)
  { code: "del", destination: "DEL", destinationName: "Delhi", country: "India", region: "South Asia", connection: ["SIN"], economy: 20000, premiumEconomy: 38000, business: 47500, suites: 64500 },
  // KUL → SIN → BOM (Zone 6)
  { code: "bom", destination: "BOM", destinationName: "Mumbai", country: "India", region: "South Asia", connection: ["SIN"], economy: 20000, premiumEconomy: 38000, business: 47500, suites: 64500 },
  // KUL → SIN → NRT (Zone 7)
  { code: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", connection: ["SIN"], economy: 27000, premiumEconomy: 41500, business: 57000, suites: 84500 },
  // KUL → SIN → HND (Zone 7)
  { code: "hnd", destination: "HND", destinationName: "Tokyo (Haneda)", country: "Japan", region: "North Asia", connection: ["SIN"], economy: 27000, premiumEconomy: 41500, business: 57000, suites: 84500 },
  // KUL → SIN → ICN (Zone 7)
  { code: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", connection: ["SIN"], economy: 27000, premiumEconomy: 41500, business: 57000, suites: 84500 },
  // KUL → SIN → SYD (Zone 9)
  { code: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", connection: ["SIN"], economy: 30500, premiumEconomy: 56000, business: 75500, suites: 103000 },
  // KUL → SIN → MEL (Zone 9)
  { code: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", connection: ["SIN"], economy: 30500, premiumEconomy: 56000, business: 75500, suites: 103000 },
  // KUL → SIN → DXB (Zone 10)
  { code: "dxb", destination: "DXB", destinationName: "Dubai", country: "United Arab Emirates", region: "Middle East", connection: ["SIN"], economy: 33500, premiumEconomy: 54000, business: 70500, suites: 99500 },
  // KUL → SIN → LHR (Zone 11)
  { code: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", connection: ["SIN"], economy: 46000, premiumEconomy: 78000, business: 114000, suites: 155000 },
  // KUL → SIN → CDG (Zone 11)
  { code: "cdg", destination: "CDG", destinationName: "Paris (Charles de Gaulle)", country: "France", region: "Europe", connection: ["SIN"], economy: 46000, premiumEconomy: 78000, business: 114000, suites: 155000 },
  // KUL → SIN → FRA (Zone 11)
  { code: "fra", destination: "FRA", destinationName: "Frankfurt", country: "Germany", region: "Europe", connection: ["SIN"], economy: 46000, premiumEconomy: 78000, business: 114000, suites: 155000 },
  // KUL → SIN → LAX (Zone 12)
  { code: "lax", destination: "LAX", destinationName: "Los Angeles", country: "United States", region: "North America", connection: ["SIN"], economy: 46000, premiumEconomy: 82500, business: 117500, suites: 161000 },
  // KUL → SIN → JFK (Zone 13)
  { code: "jfk", destination: "JFK", destinationName: "New York (JFK)", country: "United States", region: "North America", connection: ["SIN"], economy: 48500, premiumEconomy: 88500, business: 122500, suites: 163500 },
];

/* Scoot Saver — operated by Scoot (low-cost carrier), redeemed with KrisFlyer
 * miles. Priced per traveller, one-way, transiting Singapore. Stored as a
 * separate award product so cards can clearly label it "Scoot Saver" and
 * disclose that inclusions differ from Singapore Airlines Economy Saver. */
interface ScootSeed {
  code: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  economy: number;
}

const scootSeeds: ScootSeed[] = [
  { code: "sc-sin", destination: "SIN", destinationName: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", economy: 1500 },
  { code: "sc-cgk", destination: "CGK", destinationName: "Jakarta", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 4000 },
  { code: "sc-dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 6000 },
  { code: "sc-sub", destination: "SUB", destinationName: "Surabaya", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 6000 },
  { code: "sc-bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 4000 },
  { code: "sc-hkt", destination: "HKT", destinationName: "Phuket", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 4000 },
  { code: "sc-cnx", destination: "CNX", destinationName: "Chiang Mai", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 12000 },
  { code: "sc-sgn", destination: "SGN", destinationName: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 6000 },
  { code: "sc-han", destination: "HAN", destinationName: "Hanoi", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 6000 },
  { code: "sc-mnl", destination: "MNL", destinationName: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", economy: 7500 },
  { code: "sc-hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", economy: 8000 },
  { code: "sc-tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", economy: 8000 },
  { code: "sc-can", destination: "CAN", destinationName: "Guangzhou", country: "China", region: "North Asia", economy: 8000 },
  { code: "sc-nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", economy: 14000 },
  { code: "sc-icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", economy: 14000 },
  { code: "sc-per", destination: "PER", destinationName: "Perth", country: "Australia", region: "Australia and New Zealand", economy: 8000 },
  { code: "sc-syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", economy: 14000 },
  { code: "sc-mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", economy: 14000 },
];

function buildKrisflyerTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "krisflyer",
    loyaltyProgrammeId: "krisflyer",
    programmeName: "KrisFlyer",
    operatingAirline: "Singapore Airlines",
    marketingAirline: "Singapore Airlines",
    country: "MY" as const,
    originAirport: "KUL",
    originCountry: "Malaysia",
    awardType: "KrisFlyer Saver",
    redemptionType: "krisflyer_saver" as const,
    pricingBasis: "fixed_chart_one_way" as const,
    returnBookingRequired: false,
    perDirection: false,
    effectiveFrom: "2025-11-01",
    verifiedOn: V_KRISFLYER,
    sourceUrl: SRC_KRISFLYER,
    sourceTitle: TITLE_KRISFLYER,
    source: {
      sourceName: "Singapore Airlines KrisFlyer Saver award chart",
      sourceUrl: SRC_KRISFLYER,
      sourceType: "official_airline" as const,
      verifiedAt: V_KRISFLYER,
      effectiveFrom: "2025-11-01",
      notes: "Some zone combinations carry routing and backtracking conditions. Exact mileage depends on the itinerary accepted by KrisFlyer.",
    },
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const push = (s: KfSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `kf-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      destinationCountry: s.country,
      region: s.region,
      connectionAirports: s.connection,
      numberOfSegments: s.connection.length === 0 ? 1 : s.connection.length + 1,
      directOrConnecting: s.connection.length === 0 ? "direct" : "connecting",
      cabin,
      pointsPerPerson: points,
      status: s.status ?? "verified",
      routingNote: s.connection.length > 0 ? KF_ROUTING_NOTE : undefined,
      notes: s.notes,
    });
  };
  for (const s of krisflyerSeeds) {
    if (s.economy) push(s, "Economy", s.economy, "y");
    if (s.premiumEconomy) push(s, "Premium Economy", s.premiumEconomy, "w");
    if (s.business) push(s, "Business", s.business, "j");
    if (s.suites) push(s, "First or Business Suite", s.suites, "f");
  }
  // Scoot Saver — separate award product on the KrisFlyer programme.
  for (const s of scootSeeds) {
    out.push({
      ...shared,
      id: `kf-${s.code}-y`,
      operatingAirline: "Scoot",
      marketingAirline: "Scoot",
      awardType: "Scoot Saver",
      destination: s.destination,
      destinationName: s.destinationName,
      destinationCountry: s.country,
      region: s.region,
      connectionAirports: s.destination === "SIN" ? [] : ["SIN"],
      numberOfSegments: s.destination === "SIN" ? 1 : 2,
      directOrConnecting: s.destination === "SIN" ? "direct" : "connecting",
      cabin: "Economy",
      pointsPerPerson: s.economy,
      status: "verified",
      notes: "Scoot is a low-cost carrier. Checked baggage, meals and seat selection are not included and must be purchased separately.",
    });
  }
  return out;
}

/* ===================================================================== */
/* CATHAY — ASIA MILES. Cathay Pacific-operated standard flight awards.  */
/* KUL→HKG→dest itineraries.                                             */
/* ===================================================================== */

interface AmSeed {
  code: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  connection: string[]; // [] direct KUL–HKG only
  economy?: number;
  premiumEconomy?: number;
  business?: number;
  first?: number;
  notes?: string;
  status?: TargetStatus;
}

// Cathay Pacific-operated standard flight awards.
//
// The previous Asia Miles dataset (KUL–HKG–onward records priced at 55k /
// 75k / 105k / 130k / 140k / 155k Business one-way) was built from an
// outdated Cathay award chart and has been disabled. Do not repopulate any
// connecting itinerary by adding sector prices together — Cathay prices the
// award on total great-circle distance of the whole itinerary, not per
// sector.
//
// Current published Cathay Business Class Standard Award bands are:
//   Short Type 2   (751–2,750 mi)   : 32,000 one-way
//   Medium         (2,751–5,000 mi) : 58,000 one-way
//   Long           (5,001–7,500 mi) : 84,000 one-way
//   Ultra-long     (7,501+ mi)      : 110,000 one-way
// Short Type 1 (≤750 mi) is priced separately at its current official price.
//
// Until every KUL-origin itinerary has been re-verified in Cathay's live
// award calculator, only KUL–HKG is retained. KUL–HKG sits in the Short
// Type 1 band: 27,000 Asia Miles one-way in Business (verified August 2026;
// supersedes the stale 30,000 figure).
const asiaMilesSeeds: AmSeed[] = [
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", connection: [], economy: 12000, premiumEconomy: 18000, business: 27000 },
];

function buildAsiaMilesTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "asia-miles",
    loyaltyProgrammeId: "asia-miles",
    programmeName: "Cathay — Asia Miles",
    operatingAirline: "Cathay Pacific",
    marketingAirline: "Cathay Pacific",
    country: "MY" as const,
    originAirport: "KUL",
    originCountry: "Malaysia",
    awardType: "Asia Miles standard flight award",
    redemptionType: "asia_miles_standard" as const,
    pricingBasis: "zone_based" as const,
    returnBookingRequired: false,
    perDirection: false,
    verifiedOn: V_ASIA,
    sourceUrl: SRC_ASIA,
    sourceTitle: TITLE_ASIA,
    source: {
      sourceName: "Cathay Pacific Standard Flight Award — verified current award reference",
      sourceUrl: SRC_ASIA,
      // Cathay no longer publishes a simple static chart for ordinary
      // Cathay-operated awards; pricing is verified against the live award
      // calculator and corroborated against a current award reference.
      sourceType: "verified_secondary" as const,
      verifiedAt: V_ASIA,
      notes: "Cathay does not publish a static award chart for Cathay-operated standard awards. Pricing is verified against the live award calculator.",
    },
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const push = (s: AmSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `am-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      destinationCountry: s.country,
      region: s.region,
      connectionAirports: s.connection,
      numberOfSegments: s.connection.length === 0 ? 1 : s.connection.length + 1,
      directOrConnecting: s.connection.length === 0 ? "direct" : "connecting",
      cabin,
      pointsPerPerson: points,
      status: s.status ?? "verified",
      notes: s.notes,
    });
  };
  for (const s of asiaMilesSeeds) {
    if (s.economy) push(s, "Economy", s.economy, "y");
    if (s.premiumEconomy) push(s, "Premium Economy", s.premiumEconomy, "w");
    if (s.business) push(s, "Business", s.business, "j");
    if (s.first) push(s, "First or Business Suite", s.first, "f");
  }
  return out;
}

/* ===================================================================== */
/* SINGAPORE MARKET — every record departs Singapore (SIN).              */
/* No KUL-origin record may ever appear here.                            */
/* ===================================================================== */

const SG_SHARED = {
  country: "SG" as const,
  originAirport: "SIN",
  originCountry: "Singapore",
  availabilityChecked: false,
  taxesAndFeesNote: TAX_NOTE,
};

function buildSingaporeTargets(): RedemptionTarget[] {
  const kfShared = {
    ...SG_SHARED,
    programmeId: "krisflyer",
    loyaltyProgrammeId: "krisflyer",
    programmeName: "KrisFlyer",
    operatingAirline: "Singapore Airlines",
    marketingAirline: "Singapore Airlines",
    awardType: "KrisFlyer Saver",
    redemptionType: "krisflyer_saver" as const,
    pricingBasis: "fixed_chart_one_way" as const,
    returnBookingRequired: false,
    perDirection: false,
    effectiveFrom: "2025-11-01",
    verifiedOn: V_KRISFLYER,
    sourceUrl: SRC_KRISFLYER,
    sourceTitle: TITLE_KRISFLYER,
    source: {
      sourceName: "Singapore Airlines KrisFlyer Saver award chart (effective 1 November 2025)",
      sourceUrl: SRC_KRISFLYER,
      sourceType: "official_airline" as const,
      verifiedAt: V_KRISFLYER,
      effectiveFrom: "2025-11-01",
      notes: "Saver awards on Singapore Airlines-operated flights. One-way pricing; a return booking is priced as two one-way awards.",
    },
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    verificationLevel: "official-chart-transcription" as const,
  };

  // Singapore Airlines Saver awards, generated from the zonal chart effective
  // 1 November 2025. Pricing lives in one place (krisflyerZones.ts): each
  // destination only declares its zone, so nothing is hard-coded route by route.
  const out: RedemptionTarget[] = [];
  const CABIN_SUFFIX: Record<Cabin, string> = {
    Economy: "y",
    "Premium Economy": "w",
    Business: "j",
    "First or Business Suite": "f",
  };

  for (const dest of SQ_DESTINATIONS_FROM_SIN) {
    if (!dest.currentServiceVerified) continue;
    const zone = KRISFLYER_ZONES_FROM_ZONE1[dest.singaporeAirlinesZone];
    if (!zone) continue;
    for (const cabin of dest.cabinsVerified) {
      const points = saverMilesFor(dest, cabin);
      if (!points) continue;
      out.push({
        ...kfShared,
        id: `sg-kf-${dest.airport.toLowerCase()}-${CABIN_SUFFIX[cabin]}`,
        destination: dest.airport,
        destinationName: dest.city,
        destinationCountry: dest.country,
        region: dest.region,
        cabin,
        pricingBasis: "zone_based",
        pointsPerPerson: points,
        status: "verified",
        notes: `Singapore Airlines-operated nonstop flight from Singapore (Zone 1) to ${zone.name} (Zone ${zone.id}). Saver award space is limited and has not been checked.`,
      });
    }
  }

  // Scoot Saver from Singapore. Route-level award pricing has not been
  // verified against the Scoot award table, so it is never shown as a firm
  // target and never appears in "You can reach these now".
  out.push({
    ...kfShared,
    id: "sg-scoot-kul-y",
    operatingAirline: "Scoot",
    marketingAirline: "Scoot",
    awardType: "Scoot Saver",
    verificationLevel: undefined,
    destination: "KUL",
    destinationName: "Kuala Lumpur",
    destinationCountry: "Malaysia",
    region: "Malaysia and Southeast Asia",
    cabin: "Economy",
    pointsPerPerson: 1500,
    status: "supported_unverified",
    notes:
      "Scoot Saver awards start from 1,500 KrisFlyer miles one way, but the route-level amount for this flight has not been verified. Treat it as indicative only. Baggage, meals and seat selection are not included.",
  });

  return out;
}

/* ===================================================================== */
/* Registry                                                              */
/* ===================================================================== */

export const redemptionTargets: RedemptionTarget[] = [
  ...buildEnrichTargets(),
  ...buildKrisflyerTargets(),
  ...buildAsiaMilesTargets(),
  ...buildSingaporeTargets(),
  ...buildHongKongTargets(),
];

/** All redemption records for a market. Guarantees the origin never leaks
 * across countries: the calculator must only ever render these. */
export function targetsForCountry(country: MarketCountry): RedemptionTarget[] {
  return redemptionTargets.filter((t) => t.country === country);
}


/* ===================================================================== */
/* Helpers                                                               */
/* ===================================================================== */

/** A target is public if verified/needs_review AND within its effective window. */
export function isTargetPublic(t: RedemptionTarget): boolean {
  if (t.status !== "verified" && t.status !== "needs_review" && t.status !== "supported_unverified") return false;
  const d = TODAY_ISO();
  if (t.effectiveFrom && t.effectiveFrom > d) return false;
  if (t.effectiveUntil && t.effectiveUntil < d) return false;
  return true;
}

/** A target is a firm redemption target only when fully verified. */
export function isTargetVerified(t: RedemptionTarget): boolean {
  return t.status === "verified" && isTargetPublic(t);
}

export const REGIONS: Region[] = [
  "Malaysia and Southeast Asia",
  "North Asia",
  "South Asia",
  "Australia and New Zealand",
  "Europe",
  "Middle East",
  "North America",
  "Africa",
];

export const CABINS: Cabin[] = ["Economy", "Premium Economy", "Business", "First or Business Suite"];

/** Whether any verified record exists for the given cabin. */
export function verifiedCabinsPresent(country?: MarketCountry): Set<Cabin> {
  const s = new Set<Cabin>();
  const pool = country ? targetsForCountry(country) : redemptionTargets;
  for (const t of pool) if (isTargetPublic(t)) s.add(t.cabin);
  return s;
}

/** Total points required for the requested trip type and party size.
 *
 * Source-conflict note: The Enrich Saver landing page and detailed terms
 * currently use inconsistent wording regarding one-way eligibility. The
 * calculator follows the more detailed current Terms and Conditions, which
 * expressly permit one-way and round-trip point-to-point itineraries. For
 * Enrich Saver, pointsPerPerson is quoted per direction; a return booking
 * requires twice the one-way figure.
 */
export function computeRequiredPoints(t: RedemptionTarget, tripType: TripType, travellers: number): number {
  const pax = Math.max(1, Math.floor(travellers));
  const multiplier = tripType === "return" ? 2 : 1;
  return t.pointsPerPerson * multiplier * pax;
}

/** Points quoted per person for a single direction, useful for wording. */
export function pointsPerPersonPerDirection(t: RedemptionTarget): number {
  return t.pointsPerPerson;
}

/** Points for a full one-way for the party (before doubling for return). */
export function outboundPointsForParty(t: RedemptionTarget, travellers: number): number {
  const pax = Math.max(1, Math.floor(travellers));
  return t.pointsPerPerson * pax;
}
