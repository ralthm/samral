import { describe, expect, it } from "vitest";
import {
  computeRequiredPoints,
  isTargetVerified,
  targetsForCountry,
  type Cabin,
  type RedemptionTarget,
  type TripType,
} from "@/data/redemptionTargets";
import {
  KRISFLYER_ZONES_FROM_ZONE1,
  SQ_DESTINATIONS_FROM_SIN,
  saverMilesFor,
} from "@/data/krisflyerZones";
import { classifyRedemption } from "@/lib/redemptionStatus";

const BALANCE = 410_000;
const sg = targetsForCountry("SG");
const sq = sg.filter((t) => t.operatingAirline === "Singapore Airlines" && isTargetVerified(t));

const find = (airport: string, cabin: Cabin): RedemptionTarget => {
  const t = sq.find((x) => x.destination === airport && x.cabin === cabin);
  expect(t, `${airport} ${cabin} must exist in the Singapore dataset`).toBeTruthy();
  return t!;
};

const required = (airport: string, cabin: Cabin, trip: TripType = "return", pax = 1) =>
  computeRequiredPoints(find(airport, cabin), trip, pax);

const reachable = (airport: string, cabin: Cabin, balance = BALANCE) =>
  classifyRedemption(balance, required(airport, cabin)).status;

/* Origin integrity */

describe("Singapore mode origin integrity", () => {
  it("every Singapore record departs SIN", () => {
    expect(sg.length).toBeGreaterThan(40);
    for (const t of sg) {
      expect(t.originAirport).toBe("SIN");
      expect(t.originCountry).toBe("Singapore");
      expect(t.country).toBe("SG");
    }
  });

  it("no Malaysia-origin record leaks into Singapore mode", () => {
    expect(sg.some((t) => t.originAirport === "KUL")).toBe(false);
  });

  it("Malaysia mode is unchanged and still departs KUL", () => {
    const my = targetsForCountry("MY");
    expect(my.length).toBeGreaterThan(0);
    for (const t of my) expect(t.originAirport).not.toBe("SIN");
  });
});

/* Zone-driven pricing */

describe("zone-based Saver pricing", () => {
  it("stores the 1 November 2025 chart once per zone", () => {
    const expected: Record<number, [number | undefined, number | undefined, number | undefined, number | undefined]> = {
      2: [8000, undefined, 22000, 32000],
      3: [13000, undefined, 25000, 38000],
      4: [15500, 28000, 35500, 47500],
      5: [20500, 36000, 45000, 61500],
      6: [19000, 36000, 45000, 61500],
      7: [25500, 39500, 54500, 81000],
      8: [20500, undefined, 42500, 60500],
      9: [29000, 53500, 72000, 98000],
      10: [32000, 51500, 68000, 95000],
      11: [44000, 74500, 108500, 148000],
      12: [44000, 79000, 112500, 154000],
      13: [46000, 84500, 117000, 156000],
    };
    for (const [id, [y, w, j, f]] of Object.entries(expected)) {
      const zone = KRISFLYER_ZONES_FROM_ZONE1[Number(id)];
      expect(zone, `zone ${id}`).toBeTruthy();
      expect(zone.economySaver).toBe(y);
      expect(zone.premiumEconomySaver).toBe(w);
      expect(zone.businessSaver).toBe(j);
      expect(zone.firstSaver).toBe(f);
      expect(zone.effectiveFrom).toBe("2025-11-01");
      expect(zone.verificationStatus).toBe("verified");
    }
  });

  it("every published record equals its zone rate — no route-by-route overrides", () => {
    for (const t of sq) {
      const dest = SQ_DESTINATIONS_FROM_SIN.find((d) => d.airport === t.destination)!;
      expect(dest).toBeTruthy();
      expect(t.pointsPerPerson).toBe(saverMilesFor(dest, t.cabin as never));
      expect(t.pricingBasis).toBe("zone_based");
    }
  });

  it("does not use any pre-1-November-2025 Saver rate", () => {
    for (const t of sq) {
      expect(t.effectiveFrom).toBe("2025-11-01");
      expect(t.source.effectiveFrom).toBe("2025-11-01");
      expect(t.awardType).toBe("KrisFlyer Saver");
      expect(t.operatingAirline).toBe("Singapore Airlines");
    }
    // Old KUL-origin figures must never appear on a SIN-origin record.
    const oldRates = [8500, 13500, 16000, 27000, 30500, 46000 /* old KUL LHR economy */];
    const kul = find("KUL", "Economy");
    expect(kul.pointsPerPerson).toBe(8000);
    expect(oldRates).not.toContain(find("BKK", "Economy").pointsPerPerson);
    expect(find("HKG", "Economy").pointsPerPerson).toBe(15500);
  });

  it("only publishes cabins verified for the route", () => {
    const cabins = new Set(sq.map((t) => t.cabin));
    expect(Array.from(cabins).sort()).toEqual(["Business", "Economy"]);
  });
});

/* Coverage */

describe("Singapore destination coverage", () => {
  it("is not limited to Kuala Lumpur", () => {
    const airports = new Set(sq.map((t) => t.destination));
    expect(airports.size).toBeGreaterThan(20);
    for (const a of ["KUL", "BKK", "HKG", "NRT", "DEL", "PER", "SYD", "LHR", "LAX", "JFK"]) {
      expect(airports.has(a), `${a} must be present`).toBe(true);
    }
  });

  it.each([
    ["Malaysia and Southeast Asia", 5],
    ["North Asia", 5],
    ["South Asia", 3],
    ["Australia and New Zealand", 4],
    ["Europe", 4],
    ["North America", 4],
  ])("region %s has at least %i verified opportunities", (region, min) => {
    expect(sq.filter((t) => t.region === region).length).toBeGreaterThanOrEqual(min);
  });

  it("only lists destinations with verified current SIN service", () => {
    for (const d of SQ_DESTINATIONS_FROM_SIN) {
      expect(d.originAirport).toBe("SIN");
      expect(d.operatingCarrier).toBe("Singapore Airlines");
      expect(d.currentServiceVerified).toBe(true);
      expect(KRISFLYER_ZONES_FROM_ZONE1[d.singaporeAirlinesZone]).toBeTruthy();
    }
  });

  it("skips destinations whose service is not verified", () => {
    const unverified = { ...SQ_DESTINATIONS_FROM_SIN[0], currentServiceVerified: false };
    expect(saverMilesFor(unverified, "Economy")).toBeNull();
  });

  it("does not check award-seat availability", () => {
    for (const t of sq) expect(t.availabilityChecked).toBe(false);
  });
});

/* 410,000 KrisFlyer integration case */

describe("410,000 KrisFlyer miles, one traveller, return", () => {
  it.each([
    ["KUL", 16_000],
    ["BKK", 26_000],
    ["HKG", 31_000],
    ["NRT", 51_000],
    ["DEL", 38_000],
    ["PER", 41_000],
    ["SYD", 58_000],
    ["LHR", 88_000],
    ["LAX", 88_000],
    ["JFK", 92_000],
  ])("%s Economy return costs %i miles and is reachable", (airport, miles) => {
    expect(required(airport, "Economy")).toBe(miles);
    expect(reachable(airport, "Economy")).toBe("reachable");
  });

  it.each([
    ["BKK", 50_000],
    ["HKG", 71_000],
    ["NRT", 109_000],
    ["DEL", 90_000],
    ["PER", 85_000],
    ["SYD", 144_000],
    ["LHR", 217_000],
    ["LAX", 225_000],
    ["JFK", 234_000],
  ])("%s Business return costs %i miles and is reachable", (airport, miles) => {
    expect(required(airport, "Business")).toBe(miles);
    expect(reachable(airport, "Business")).toBe("reachable");
  });

  it("reaches Australia, Europe and the United States, not just Kuala Lumpur", () => {
    const reachableRegions = new Set(
      sq.filter((t) => classifyRedemption(BALANCE, computeRequiredPoints(t, "return", 1)).status === "reachable")
        .map((t) => t.region),
    );
    expect(reachableRegions.has("Australia and New Zealand")).toBe(true);
    expect(reachableRegions.has("Europe")).toBe(true);
    expect(reachableRegions.has("North America")).toBe(true);
    expect(reachableRegions.has("North Asia")).toBe(true);
    expect(reachableRegions.has("South Asia")).toBe(true);
  });

  it("does not fall back to a single result", () => {
    const count = sq.filter(
      (t) => classifyRedemption(BALANCE, computeRequiredPoints(t, "return", 1)).status === "reachable",
    ).length;
    expect(count).toBeGreaterThan(30);
  });
});

/* Trip type, party size, boundaries */

describe("requirement arithmetic", () => {
  it("return is exactly twice one way", () => {
    expect(required("SYD", "Business", "one_way")).toBe(72_000);
    expect(required("SYD", "Business", "return")).toBe(144_000);
  });

  it("multiplies by travellers", () => {
    expect(required("LHR", "Economy", "return", 2)).toBe(176_000);
    expect(required("LHR", "Economy", "one_way", 4)).toBe(176_000);
  });

  it("two travellers to New York in Business is out of reach on 410,000", () => {
    expect(classifyRedemption(BALANCE, required("JFK", "Business", "return", 2)).status).not.toBe("reachable");
  });

  it("an exact balance is reachable with zero remaining and no shortfall", () => {
    const c = classifyRedemption(88_000, required("LHR", "Economy"));
    expect(c.status).toBe("reachable");
    expect(c.remaining).toBe(0);
    expect(c.shortfall).toBeUndefined();
  });

  it("an insufficient balance reports a positive shortfall", () => {
    const c = classifyRedemption(80_000, required("LHR", "Economy"));
    expect(c.status).not.toBe("reachable");
    expect(c.shortfall).toBeGreaterThan(0);
  });
});

/* Filters */

describe("filters operate on real data", () => {
  it("cabin filtering returns results for Economy and Business", () => {
    for (const cabin of ["Economy", "Business"] as Cabin[]) {
      expect(sq.filter((t) => t.cabin === cabin).length).toBeGreaterThan(20);
    }
  });

  it("region filtering returns only that region", () => {
    const europe = sq.filter((t) => t.region === "Europe");
    expect(europe.length).toBeGreaterThan(0);
    for (const t of europe) expect(t.region).toBe("Europe");
  });

  it("only KrisFlyer has verified Singapore redemption opportunities for now", () => {
    expect(new Set(sq.map((t) => t.programmeId))).toEqual(new Set(["krisflyer"]));
  });
});
