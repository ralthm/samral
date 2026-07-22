// Curated redemption targets for the destination-discovery layer.
//
// IMPORTANT: These figures are seeded from the publicly published Enrich
// Fixed Award Chart (Malaysia Airlines) for MH-operated flights. Before
// publishing new destinations you must independently re-verify each figure
// against the official source and update `verifiedOn`. Only records with
// status "verified" are shown to users.

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
  | "fixed_saver"
  | "saver"
  | "standard"
  | "advantage"
  | "partner_award"
  | "dynamic_example";

export type TargetStatus = "verified" | "needs_review" | "expired" | "unavailable";

export interface RedemptionTarget {
  id: string;
  origin: string; // IATA code
  destination: string; // IATA code
  destinationName: string;
  country: string;
  region: Region;
  loyaltyProgrammeId: string;
  operatingAirline?: string;
  cabin: Cabin;
  tripType: TripType;
  pointsPerPerson: number;
  /** If a programme does not follow simple doubling for round-trip, set this override. */
  roundTripPointsPerPerson?: number;
  redemptionType: RedemptionType;
  effectiveFrom?: string;
  effectiveUntil?: string;
  verifiedOn: string;
  sourceUrl: string;
  sourceTitle: string;
  status: TargetStatus;
  notes?: string;
}

const ENRICH_SRC = "https://www.malaysiaairlines.com/my/en/enrich/use-enrich-miles/redeem-flights.html";
const ENRICH_TITLE = "Malaysia Airlines Enrich Fixed Award Chart";
const V = "2026-03-01";

interface Seed {
  id: string;
  destination: string;
  destinationName: string;
  country: string;
  region: Region;
  economy?: number;
  premiumEconomy?: number;
  business?: number;
  first?: number;
}

// Enrich Fixed Award Chart — one-way, per person, MH-operated flights.
const enrichSeeds: Seed[] = [
  { id: "pen", destination: "PEN", destinationName: "Penang", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 6000, business: 12000 },
  { id: "bki", destination: "BKI", destinationName: "Kota Kinabalu", country: "Malaysia", region: "Malaysia and Southeast Asia", economy: 8000, business: 18000 },
  { id: "bkk", destination: "BKK", destinationName: "Bangkok", country: "Thailand", region: "Malaysia and Southeast Asia", economy: 8000, business: 15000 },
  { id: "dps", destination: "DPS", destinationName: "Bali (Denpasar)", country: "Indonesia", region: "Malaysia and Southeast Asia", economy: 10000, business: 20000 },
  { id: "sgn", destination: "SGN", destinationName: "Ho Chi Minh City", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 10000, business: 20000 },
  { id: "han", destination: "HAN", destinationName: "Hanoi", country: "Vietnam", region: "Malaysia and Southeast Asia", economy: 12000, business: 22000 },
  { id: "mnl", destination: "MNL", destinationName: "Manila", country: "Philippines", region: "Malaysia and Southeast Asia", economy: 12000, business: 22000 },
  { id: "hkg", destination: "HKG", destinationName: "Hong Kong", country: "Hong Kong SAR", region: "North Asia", economy: 15000, business: 30000 },
  { id: "tpe", destination: "TPE", destinationName: "Taipei", country: "Taiwan", region: "North Asia", economy: 18000, business: 35000 },
  { id: "icn", destination: "ICN", destinationName: "Seoul (Incheon)", country: "South Korea", region: "North Asia", economy: 25000, business: 50000 },
  { id: "nrt", destination: "NRT", destinationName: "Tokyo (Narita)", country: "Japan", region: "North Asia", economy: 25000, business: 50000 },
  { id: "kix", destination: "KIX", destinationName: "Osaka", country: "Japan", region: "North Asia", economy: 25000, business: 50000 },
  { id: "per", destination: "PER", destinationName: "Perth", country: "Australia", region: "Australia and New Zealand", economy: 20000, business: 40000 },
  { id: "syd", destination: "SYD", destinationName: "Sydney", country: "Australia", region: "Australia and New Zealand", economy: 30000, business: 60000 },
  { id: "mel", destination: "MEL", destinationName: "Melbourne", country: "Australia", region: "Australia and New Zealand", economy: 30000, business: 60000 },
  { id: "lhr", destination: "LHR", destinationName: "London (Heathrow)", country: "United Kingdom", region: "Europe", economy: 45000, business: 90000 },
  { id: "cdg", destination: "CDG", destinationName: "Paris (Charles de Gaulle)", country: "France", region: "Europe", economy: 45000, business: 90000, notes: "Codeshare with partner airline; confirm operating carrier when redeeming." },
  { id: "dxb", destination: "DXB", destinationName: "Dubai", country: "United Arab Emirates", region: "Middle East", economy: 25000, business: 50000 },
  { id: "ist", destination: "IST", destinationName: "Istanbul", country: "Turkey", region: "Europe", economy: 40000, business: 80000, notes: "Codeshare with partner airline; confirm operating carrier when redeeming." },
];

function buildEnrichTargets(): RedemptionTarget[] {
  const out: RedemptionTarget[] = [];
  const shared = {
    origin: "KUL",
    loyaltyProgrammeId: "enrich" as const,
    operatingAirline: "Malaysia Airlines",
    redemptionType: "fixed_saver" as const,
    tripType: "one_way" as const,
    verifiedOn: V,
    sourceUrl: ENRICH_SRC,
    sourceTitle: ENRICH_TITLE,
    status: "verified" as const,
  };
  for (const s of enrichSeeds) {
    const base = {
      destination: s.destination,
      destinationName: s.destinationName,
      country: s.country,
      region: s.region,
    };
    if (s.economy) {
      out.push({
        ...shared, ...base,
        id: `enrich-${s.id}-y`,
        cabin: "Economy",
        pointsPerPerson: s.economy,
        notes: s.notes,
      });
    }
    if (s.premiumEconomy) {
      out.push({
        ...shared, ...base,
        id: `enrich-${s.id}-w`,
        cabin: "Premium Economy",
        pointsPerPerson: s.premiumEconomy,
        notes: s.notes,
      });
    }
    if (s.business) {
      out.push({
        ...shared, ...base,
        id: `enrich-${s.id}-j`,
        cabin: "Business",
        pointsPerPerson: s.business,
        notes: s.notes,
      });
    }
    if (s.first) {
      out.push({
        ...shared, ...base,
        id: `enrich-${s.id}-f`,
        cabin: "First or Business Suite",
        pointsPerPerson: s.first,
        notes: s.notes,
      });
    }
  }
  return out;
}

export const redemptionTargets: RedemptionTarget[] = [
  ...buildEnrichTargets(),
];

/* -------- helpers -------- */

const today = () => new Date().toISOString().slice(0, 10);

export function isTargetPublic(t: RedemptionTarget): boolean {
  if (t.status !== "verified") return false;
  const d = today();
  if (t.effectiveFrom && t.effectiveFrom > d) return false;
  if (t.effectiveUntil && t.effectiveUntil < d) return false;
  return true;
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

/** Whether any verified record exists for the given cabin (used to hide empty cabin filters). */
export function verifiedCabinsPresent(): Set<Cabin> {
  const s = new Set<Cabin>();
  for (const t of redemptionTargets) if (isTargetPublic(t)) s.add(t.cabin);
  return s;
}

export function computeRequiredPoints(t: RedemptionTarget, tripType: TripType, travellers: number): number {
  const pax = Math.max(1, Math.floor(travellers));
  if (tripType === "return") {
    if (typeof t.roundTripPointsPerPerson === "number") return t.roundTripPointsPerPerson * pax;
    return t.pointsPerPerson * 2 * pax;
  }
  return t.pointsPerPerson * pax;
}
