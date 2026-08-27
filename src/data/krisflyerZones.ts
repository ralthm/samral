// Singapore Airlines KrisFlyer Saver — zonal award chart, effective 1 November
// 2025. Singapore (SIN) is Zone 1; every figure below is the published one-way
// Saver requirement PER PERSON departing Zone 1.
//
// Award pricing is stored ONCE per zone. Destinations only carry a zone number,
// so a chart revision is a single-line change instead of dozens of edits.
//
// A round-trip award requires exactly twice the one-way figure (official chart
// wording). No round-trip figure is invented anywhere in this file.
//
// Premium Economy and Suites/First figures are recorded for completeness, but a
// cabin is only published for a destination when route-level cabin availability
// has been verified (see `cabinsVerified` on each destination). The V1 dataset
// publishes Economy and Business only.

import type { Region } from "./redemptionTargets";

export const KRISFLYER_CHART_EFFECTIVE_FROM = "2025-11-01";
export const KRISFLYER_CHART_SOURCE =
  "Singapore Airlines One-way Saver Awards — effective 1 November 2025";

export interface KrisFlyerZone {
  id: number;
  name: string;
  economySaver?: number;
  premiumEconomySaver?: number;
  businessSaver?: number;
  firstSaver?: number;
  effectiveFrom: string;
  verificationStatus: "verified";
  officialSource: string;
}

const z = (
  id: number,
  name: string,
  economySaver: number | undefined,
  premiumEconomySaver: number | undefined,
  businessSaver: number | undefined,
  firstSaver: number | undefined,
): KrisFlyerZone => ({
  id,
  name,
  economySaver,
  premiumEconomySaver,
  businessSaver,
  firstSaver,
  effectiveFrom: KRISFLYER_CHART_EFFECTIVE_FROM,
  verificationStatus: "verified",
  officialSource: KRISFLYER_CHART_SOURCE,
});

/** One-way Saver requirements FROM Zone 1 (Singapore). */
export const KRISFLYER_ZONES_FROM_ZONE1: Record<number, KrisFlyerZone> = {
  2: z(2, "Malaysia, Indonesia & Brunei", 8000, undefined, 22000, 32000),
  3: z(3, "Philippines, Thailand, Vietnam, Myanmar & Cambodia", 13000, undefined, 25000, 38000),
  4: z(4, "South China, Hong Kong & Taiwan", 15500, 28000, 35500, 47500),
  5: z(5, "Beijing & Shanghai", 20500, 36000, 45000, 61500),
  6: z(6, "India, Sri Lanka, Maldives, Nepal & Bangladesh", 19000, 36000, 45000, 61500),
  7: z(7, "Japan & South Korea", 25500, 39500, 54500, 81000),
  8: z(8, "Perth & Darwin", 20500, undefined, 42500, 60500),
  9: z(9, "Australia (excluding Perth & Darwin) & New Zealand", 29000, 53500, 72000, 98000),
  10: z(10, "Africa, Middle East & Turkey", 32000, 51500, 68000, 95000),
  11: z(11, "Europe", 44000, 74500, 108500, 148000),
  12: z(12, "USA West Coast", 44000, 79000, 112500, 154000),
  13: z(13, "USA East Coast", 46000, 84500, 117000, 156000),
};

export type SqCabin = "Economy" | "Premium Economy" | "Business" | "First or Business Suite";

export interface SqDestination {
  airport: string;
  city: string;
  country: string;
  region: Region;
  singaporeAirlinesZone: number;
  operatingCarrier: "Singapore Airlines";
  originAirport: "SIN";
  /** Only true when current SIN nonstop service has been verified. */
  currentServiceVerified: boolean;
  /** Cabins published for this route. Never inferred from the zone chart. */
  cabinsVerified: SqCabin[];
  notes?: string;
}

const V1_CABINS: SqCabin[] = ["Economy", "Business"];

const d = (
  airport: string,
  city: string,
  country: string,
  region: Region,
  zone: number,
  notes?: string,
): SqDestination => ({
  airport,
  city,
  country,
  region,
  singaporeAirlinesZone: zone,
  operatingCarrier: "Singapore Airlines",
  originAirport: "SIN",
  currentServiceVerified: true,
  cabinsVerified: V1_CABINS,
  notes,
});

/** Current Singapore Airlines nonstop services from Singapore Changi (SIN),
 * mapped to their Saver award zone. A city is only listed when the nonstop
 * service and its zone mapping have both been checked. */
export const SQ_DESTINATIONS_FROM_SIN: SqDestination[] = [
  // Zone 2 — Malaysia, Indonesia & Brunei
  d("KUL", "Kuala Lumpur", "Malaysia", "Malaysia and Southeast Asia", 2),
  d("CGK", "Jakarta", "Indonesia", "Malaysia and Southeast Asia", 2),
  d("DPS", "Bali (Denpasar)", "Indonesia", "Malaysia and Southeast Asia", 2),
  d("SUB", "Surabaya", "Indonesia", "Malaysia and Southeast Asia", 2),
  d("PEN", "Penang", "Malaysia", "Malaysia and Southeast Asia", 2),

  // Zone 3 — Philippines, Thailand, Vietnam, Myanmar & Cambodia
  d("BKK", "Bangkok", "Thailand", "Malaysia and Southeast Asia", 3),
  d("MNL", "Manila", "Philippines", "Malaysia and Southeast Asia", 3),
  d("SGN", "Ho Chi Minh City", "Vietnam", "Malaysia and Southeast Asia", 3),
  d("HAN", "Hanoi", "Vietnam", "Malaysia and Southeast Asia", 3),
  d("HKT", "Phuket", "Thailand", "Malaysia and Southeast Asia", 3),

  // Zone 4 — South China, Hong Kong & Taiwan
  d("HKG", "Hong Kong", "Hong Kong SAR", "North Asia", 4),
  d("TPE", "Taipei", "Taiwan", "North Asia", 4),
  d("CAN", "Guangzhou", "China", "North Asia", 4),

  // Zone 5 — Beijing & Shanghai
  d("PEK", "Beijing (Capital)", "China", "North Asia", 5),
  d("PVG", "Shanghai (Pudong)", "China", "North Asia", 5),

  // Zone 6 — India, Sri Lanka, Maldives, Nepal & Bangladesh
  d("DEL", "Delhi", "India", "South Asia", 6),
  d("BOM", "Mumbai", "India", "South Asia", 6),
  d("BLR", "Bengaluru", "India", "South Asia", 6),
  d("MAA", "Chennai", "India", "South Asia", 6),
  d("CMB", "Colombo", "Sri Lanka", "South Asia", 6),
  d("MLE", "Malé", "Maldives", "South Asia", 6),

  // Zone 7 — Japan & South Korea
  d("NRT", "Tokyo (Narita)", "Japan", "North Asia", 7),
  d("HND", "Tokyo (Haneda)", "Japan", "North Asia", 7),
  d("KIX", "Osaka (Kansai)", "Japan", "North Asia", 7),
  d("ICN", "Seoul (Incheon)", "South Korea", "North Asia", 7),

  // Zone 8 — Perth & Darwin
  d("PER", "Perth", "Australia", "Australia and New Zealand", 8),
  d("DRW", "Darwin", "Australia", "Australia and New Zealand", 8),

  // Zone 9 — Rest of Australia & New Zealand
  d("SYD", "Sydney", "Australia", "Australia and New Zealand", 9),
  d("MEL", "Melbourne", "Australia", "Australia and New Zealand", 9),
  d("BNE", "Brisbane", "Australia", "Australia and New Zealand", 9),
  d("ADL", "Adelaide", "Australia", "Australia and New Zealand", 9),
  d("AKL", "Auckland", "New Zealand", "Australia and New Zealand", 9),

  // Zone 10 — Africa, Middle East & Turkey
  d("DXB", "Dubai", "United Arab Emirates", "Middle East", 10),
  d("IST", "Istanbul", "Turkey", "Middle East", 10),
  d("JNB", "Johannesburg", "South Africa", "Africa", 10),

  // Zone 11 — Europe
  d("LHR", "London (Heathrow)", "United Kingdom", "Europe", 11),
  d("CDG", "Paris (Charles de Gaulle)", "France", "Europe", 11),
  d("FRA", "Frankfurt", "Germany", "Europe", 11),
  d("MUC", "Munich", "Germany", "Europe", 11),
  d("MXP", "Milan (Malpensa)", "Italy", "Europe", 11),
  d("BCN", "Barcelona", "Spain", "Europe", 11),
  d("AMS", "Amsterdam", "Netherlands", "Europe", 11),
  d("CPH", "Copenhagen", "Denmark", "Europe", 11),
  d("ZRH", "Zurich", "Switzerland", "Europe", 11),

  // Zone 12 — USA West Coast
  d("LAX", "Los Angeles", "United States", "North America", 12),
  d("SFO", "San Francisco", "United States", "North America", 12),
  d("SEA", "Seattle", "United States", "North America", 12),

  // Zone 13 — USA East Coast
  d("JFK", "New York (JFK)", "United States", "North America", 13),
  d("EWR", "Newark", "United States", "North America", 13),
];

/** Published one-way Saver requirement for a destination and cabin, or null
 * when the cabin is not published for that route. */
export function saverMilesFor(dest: SqDestination, cabin: SqCabin): number | null {
  if (!dest.currentServiceVerified) return null;
  if (!dest.cabinsVerified.includes(cabin)) return null;
  const zone = KRISFLYER_ZONES_FROM_ZONE1[dest.singaporeAirlinesZone];
  if (!zone) return null;
  const map: Record<SqCabin, number | undefined> = {
    Economy: zone.economySaver,
    "Premium Economy": zone.premiumEconomySaver,
    Business: zone.businessSaver,
    "First or Business Suite": zone.firstSaver,
  };
  return map[cabin] ?? null;
}
