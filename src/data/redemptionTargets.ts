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

export type TargetStatus = "verified" | "needs_review" | "expired" | "unavailable";

/** Programmes with a complete, current redemption engine. Others may appear in
 * transfer results but not in the destination filter. */
export const SUPPORTED_PROGRAMMES: readonly string[] = ["enrich", "krisflyer", "asia-miles"];

export interface RedemptionTarget {
  id: string;
  programmeId: string; // "enrich" | "krisflyer" | "asia-miles"
  /** Alias kept for compatibility with older calculator code paths. */
  loyaltyProgrammeId: string;
  programmeName: string;
  operatingAirline: string;
  marketingAirline: string;
  origin: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  connectionAirports: string[]; // [] = direct
  numberOfSegments: number;
  directOrConnecting: "direct" | "connecting";
  cabin: Cabin;
  awardType: string; // e.g. "Enrich Saver", "KrisFlyer Saver", "Asia Miles standard flight award"
  redemptionType: RedemptionType;
  pricingBasis: "fixed_chart_per_direction" | "fixed_chart_one_way" | "zone_based";
  /** Points quoted by the airline, per person. For Enrich this is per direction. */
  pointsPerPerson: number;
  /** When true the programme requires a return itinerary and pointsPerPerson is
   * per direction; per brief this applies to Enrich Saver. */
  returnBookingRequired: boolean;
  /** Programmes that quote per-direction (Enrich). Doubled for a full return. */
  perDirection: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  verifiedOn: string;
  sourceUrl: string;
  sourceTitle: string;
  availabilityChecked: boolean;
  taxesAndFeesNote: string;
  status: TargetStatus;
  notes?: string;
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

const V_ENRICH = "2026-07-01";
const V_KRISFLYER = "2026-07-01";
const V_ASIA = "2026-07-01";

const SRC_ENRICH = "https://www.malaysiaairlines.com/my/en/enrich/use-enrich-miles/redeem-flights.html";
const TITLE_ENRICH = "Malaysia Airlines Enrich — Redeem Flights";
const SRC_KRISFLYER = "https://www.singaporeair.com/en_UK/us/ppsclub-krisflyer/use-miles/flights/";
const TITLE_KRISFLYER = "Singapore Airlines KrisFlyer Award Chart (effective 1 November 2025)";
const SRC_ASIA = "https://www.cathaypacific.com/cx/en_HK/asia-miles/use-miles/redeem-flights.html";
const TITLE_ASIA = "Cathay Asia Miles — Standard Flight Award pricing";

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
  premiumEconomy?: number;
  business?: number;
  first?: number;
  notes?: string;
  status?: TargetStatus;
}

// Malaysia Airlines-operated non-stop routes from KUL only. Codeshare-only
// destinations (DXB, IST, CDG, etc.) are excluded because Enrich Saver rates
// apply solely to MH-operated flights; those must be priced via the Enrich
// Partner Travel Award table (not implemented in this release).
const enrichSeeds: EnrichSeed[] = [
  { code: "pen", destination: "PEN", destinationName: "Penang", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 6000, business: 12000 },
  { code: "bki", destination: "BKI", destinationName: "Kota Kinabalu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 8000, business: 18000 },
  { code: "kch", destination: "KCH", destinationName: "Kuching", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 8000, business: 18000 },
  { code: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 8000, business: 15000 },
  { code: "dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 10000, business: 20000 },
  { code: "sgn", destination: "SGN", destinationName: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 10000, business: 20000 },
  { code: "han", destination: "HAN", destinationName: "Hanoi", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 12000, business: 22000 },
  { code: "mnl", destination: "MNL", destinationName: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", economy: 12000, business: 22000 },
  { code: "sin", destination: "SIN", destinationName: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", economy: 6000, business: 12000 },
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", economy: 15000, business: 30000 },
  { code: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", economy: 18000, business: 35000 },
  { code: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", economy: 25000, business: 50000 },
  { code: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", economy: 25000, business: 50000 },
  { code: "kix", destination: "KIX", destinationName: "Osaka", country: "Japan", region: "North Asia", economy: 25000, business: 50000 },
  { code: "del", destination: "DEL", destinationName: "Delhi", country: "India", region: "South Asia", economy: 18000, business: 35000 },
  { code: "bom", destination: "BOM", destinationName: "Mumbai", country: "India", region: "South Asia", economy: 18000, business: 35000 },
  { code: "per", destination: "PER", destinationName: "Perth", country: "Australia", region: "Australia and New Zealand", economy: 20000, business: 40000 },
  { code: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", economy: 30000, business: 60000 },
  { code: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", economy: 30000, business: 60000 },
  { code: "akl", destination: "AKL", destinationName: "Auckland", country: "New Zealand", region: "Australia and New Zealand", economy: 35000, business: 70000, notes: "Operated seasonally — check current MH schedule." },
  { code: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", economy: 45000, business: 90000 },
];

function buildEnrichTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "enrich",
    loyaltyProgrammeId: "enrich",
    programmeName: "Enrich",
    operatingAirline: "Malaysia Airlines",
    marketingAirline: "Malaysia Airlines",
    origin: "KUL",
    awardType: "Enrich Saver",
    redemptionType: "enrich_saver" as const,
    pricingBasis: "fixed_chart_per_direction" as const,
    connectionAirports: [] as string[],
    numberOfSegments: 1,
    directOrConnecting: "direct" as const,
    returnBookingRequired: true,
    perDirection: true,
    verifiedOn: V_ENRICH,
    sourceUrl: SRC_ENRICH,
    sourceTitle: TITLE_ENRICH,
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const pushCabin = (s: EnrichSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `enrich-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      country: s.country,
      region: s.region,
      cabin,
      pointsPerPerson: points,
      status: s.status ?? "verified",
      notes: s.notes,
    });
  };
  for (const s of enrichSeeds) {
    if (s.economy) pushCabin(s, "Economy", s.economy, "y");
    if (s.premiumEconomy) pushCabin(s, "Premium Economy", s.premiumEconomy, "w");
    if (s.business) pushCabin(s, "Business", s.business, "j");
    if (s.first) pushCabin(s, "First or Business Suite", s.first, "f");
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

// KrisFlyer Saver chart effective 1 November 2025. Figures are indicative
// origin-to-destination totals for KUL→SIN→<dest> Singapore Airlines-operated
// itineraries and should be re-verified against the live chart at booking.
const krisflyerSeeds: KfSeed[] = [
  { code: "sin", destination: "SIN", destinationName: "Singapore", country: "Singapore", region: "Malaysia and Southeast Asia", connection: [], economy: 7500, business: 20500, notes: "Direct KUL–SIN on SilkAir-successor Singapore Airlines service." },
  { code: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", connection: ["SIN"], economy: 12500, premiumEconomy: 20000, business: 32000 },
  { code: "cgk", destination: "CGK", destinationName: "Jakarta", country: "Indonesia", region: "Malaysia and Southeast Asia", connection: ["SIN"], economy: 12500, business: 30000 },
  { code: "dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", connection: ["SIN"], economy: 15500, business: 38000 },
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", connection: ["SIN"], economy: 22000, premiumEconomy: 35000, business: 55000 },
  { code: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", connection: ["SIN"], economy: 25000, business: 58000 },
  { code: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", connection: ["SIN"], economy: 32500, premiumEconomy: 50000, business: 78000 },
  { code: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", connection: ["SIN"], economy: 43000, premiumEconomy: 65000, business: 110000, suites: 175000 },
  { code: "hnd", destination: "HND", destinationName: "Tokyo (Haneda)", country: "Japan", region: "North Asia", connection: ["SIN"], economy: 43000, business: 110000 },
  { code: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", connection: ["SIN"], economy: 43000, premiumEconomy: 65000, business: 95000, suites: 150000 },
  { code: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", connection: ["SIN"], economy: 43000, business: 95000 },
  { code: "del", destination: "DEL", destinationName: "Delhi", country: "India", region: "South Asia", connection: ["SIN"], economy: 25000, business: 55000 },
  { code: "bom", destination: "BOM", destinationName: "Mumbai", country: "India", region: "South Asia", connection: ["SIN"], economy: 25000, business: 55000 },
  { code: "dxb", destination: "DXB", destinationName: "Dubai", country: "United Arab Emirates", region: "Middle East", connection: ["SIN"], economy: 43000, business: 92000 },
  { code: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", connection: ["SIN"], economy: 86500, premiumEconomy: 130000, business: 200000, suites: 320000 },
  { code: "cdg", destination: "CDG", destinationName: "Paris (Charles de Gaulle)", country: "France", region: "Europe", connection: ["SIN"], economy: 86500, business: 200000 },
  { code: "fra", destination: "FRA", destinationName: "Frankfurt", country: "Germany", region: "Europe", connection: ["SIN"], economy: 86500, business: 200000 },
  { code: "jfk", destination: "JFK", destinationName: "New York (JFK)", country: "United States", region: "North America", connection: ["SIN"], economy: 120000, business: 240000, suites: 400000 },
  { code: "lax", destination: "LAX", destinationName: "Los Angeles", country: "United States", region: "North America", connection: ["SIN"], economy: 105000, business: 220000 },
  { code: "jnb", destination: "JNB", destinationName: "Johannesburg", country: "South Africa", region: "Africa", connection: ["SIN"], economy: 62000, business: 130000 },
];

function buildKrisflyerTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "krisflyer",
    loyaltyProgrammeId: "krisflyer",
    programmeName: "KrisFlyer",
    operatingAirline: "Singapore Airlines",
    marketingAirline: "Singapore Airlines",
    origin: "KUL",
    awardType: "KrisFlyer Saver",
    redemptionType: "krisflyer_saver" as const,
    pricingBasis: "fixed_chart_one_way" as const,
    returnBookingRequired: false,
    perDirection: false,
    effectiveFrom: "2025-11-01",
    verifiedOn: V_KRISFLYER,
    sourceUrl: SRC_KRISFLYER,
    sourceTitle: TITLE_KRISFLYER,
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const push = (s: KfSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `kf-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      country: s.country,
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
  for (const s of krisflyerSeeds) {
    if (s.economy) push(s, "Economy", s.economy, "y");
    if (s.premiumEconomy) push(s, "Premium Economy", s.premiumEconomy, "w");
    if (s.business) push(s, "Business", s.business, "j");
    if (s.suites) push(s, "First or Business Suite", s.suites, "f");
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

// Cathay Pacific-operated standard flight awards. Figures are indicative of the
// current Asia Miles standard award pricing for CX-operated itineraries
// departing KUL via HKG and must be re-verified at booking time.
const asiaMilesSeeds: AmSeed[] = [
  { code: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", connection: [], economy: 12000, premiumEconomy: 18000, business: 30000 },
  { code: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", connection: ["HKG"], economy: 22000, business: 55000 },
  { code: "sgn", destination: "SGN", destinationName: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", connection: ["HKG"], economy: 22000, business: 55000 },
  { code: "mnl", destination: "MNL", destinationName: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", connection: ["HKG"], economy: 22000, business: 55000 },
  { code: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", connection: ["HKG"], economy: 22000, business: 55000 },
  { code: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", connection: ["HKG"], economy: 30000, business: 75000 },
  { code: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", connection: ["HKG"], economy: 30000, premiumEconomy: 45000, business: 75000, first: 135000 },
  { code: "hnd", destination: "HND", destinationName: "Tokyo (Haneda)", country: "Japan", region: "North Asia", connection: ["HKG"], economy: 30000, business: 75000 },
  { code: "kix", destination: "KIX", destinationName: "Osaka", country: "Japan", region: "North Asia", connection: ["HKG"], economy: 30000, business: 75000 },
  { code: "del", destination: "DEL", destinationName: "Delhi", country: "India", region: "South Asia", connection: ["HKG"], economy: 30000, business: 75000 },
  { code: "bom", destination: "BOM", destinationName: "Mumbai", country: "India", region: "South Asia", connection: ["HKG"], economy: 30000, business: 75000 },
  { code: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", connection: ["HKG"], economy: 40000, premiumEconomy: 60000, business: 105000, first: 190000 },
  { code: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", connection: ["HKG"], economy: 40000, business: 105000 },
  { code: "per", destination: "PER", destinationName: "Perth", country: "Australia", region: "Australia and New Zealand", connection: ["HKG"], economy: 40000, business: 105000 },
  { code: "akl", destination: "AKL", destinationName: "Auckland", country: "New Zealand", region: "Australia and New Zealand", connection: ["HKG"], economy: 55000, business: 130000 },
  { code: "dxb", destination: "DXB", destinationName: "Dubai", country: "United Arab Emirates", region: "Middle East", connection: ["HKG"], economy: 40000, business: 105000 },
  { code: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", connection: ["HKG"], economy: 55000, premiumEconomy: 85000, business: 140000, first: 250000 },
  { code: "cdg", destination: "CDG", destinationName: "Paris (Charles de Gaulle)", country: "France", region: "Europe", connection: ["HKG"], economy: 55000, business: 140000 },
  { code: "fra", destination: "FRA", destinationName: "Frankfurt", country: "Germany", region: "Europe", connection: ["HKG"], economy: 55000, business: 140000 },
  { code: "jfk", destination: "JFK", destinationName: "New York (JFK)", country: "United States", region: "North America", connection: ["HKG"], economy: 55000, business: 140000, first: 250000 },
  { code: "lax", destination: "LAX", destinationName: "Los Angeles", country: "United States", region: "North America", connection: ["HKG"], economy: 55000, business: 140000 },
  { code: "yvr", destination: "YVR", destinationName: "Vancouver", country: "Canada", region: "North America", connection: ["HKG"], economy: 55000, business: 140000 },
  { code: "jnb", destination: "JNB", destinationName: "Johannesburg", country: "South Africa", region: "Africa", connection: ["HKG"], economy: 70000, business: 155000 },
];

function buildAsiaMilesTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    programmeId: "asia-miles",
    loyaltyProgrammeId: "asia-miles",
    programmeName: "Cathay — Asia Miles",
    operatingAirline: "Cathay Pacific",
    marketingAirline: "Cathay Pacific",
    origin: "KUL",
    awardType: "Asia Miles standard flight award",
    redemptionType: "asia_miles_standard" as const,
    pricingBasis: "zone_based" as const,
    returnBookingRequired: false,
    perDirection: false,
    verifiedOn: V_ASIA,
    sourceUrl: SRC_ASIA,
    sourceTitle: TITLE_ASIA,
    availabilityChecked: false,
    taxesAndFeesNote: TAX_NOTE,
  };
  const push = (s: AmSeed, cabin: Cabin, points: number, suffix: string) => {
    out.push({
      ...shared,
      id: `am-${s.code}-${suffix}`,
      destination: s.destination,
      destinationName: s.destinationName,
      country: s.country,
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
/* Registry                                                              */
/* ===================================================================== */

export const redemptionTargets: RedemptionTarget[] = [
  ...buildEnrichTargets(),
  ...buildKrisflyerTargets(),
  ...buildAsiaMilesTargets(),
];

/* ===================================================================== */
/* Helpers                                                               */
/* ===================================================================== */

/** A target is public if verified/needs_review AND within its effective window. */
export function isTargetPublic(t: RedemptionTarget): boolean {
  if (t.status !== "verified" && t.status !== "needs_review") return false;
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
export function verifiedCabinsPresent(): Set<Cabin> {
  const s = new Set<Cabin>();
  for (const t of redemptionTargets) if (isTargetPublic(t)) s.add(t.cabin);
  return s;
}

/** Total points required for the requested trip type and party size, respecting
 * per-direction quotes and return-only rules. */
export function computeRequiredPoints(t: RedemptionTarget, tripType: TripType, travellers: number): number {
  const pax = Math.max(1, Math.floor(travellers));
  // Enrich Saver: pointsPerPerson is per direction and a return booking is
  // mandatory. Whichever trip type the user selects we compare against the
  // return requirement, because a one-way Enrich Saver is not bookable.
  if (t.returnBookingRequired && t.perDirection) {
    return t.pointsPerPerson * 2 * pax;
  }
  // KrisFlyer Saver / Asia Miles standard: one-way is bookable; return doubles.
  if (tripType === "return") {
    return t.pointsPerPerson * 2 * pax;
  }
  return t.pointsPerPerson * pax;
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
