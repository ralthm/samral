import { describe, expect, it } from "vitest";
import {
  computeRequiredPoints,
  isTargetVerified,
  targetsForCountry,
  type Cabin,
  type RedemptionTarget,
} from "@/data/redemptionTargets";
import {
  EXCLUDED_FROM_SQ_SAVER_DATASET,
  KRISFLYER_ZONES_FROM_ZONE1,
  SQ_DESTINATIONS_FROM_SIN,
  saverMilesFor,
} from "@/data/krisflyerZones";
import { classifyRedemption } from "@/lib/redemptionStatus";

const sq = targetsForCountry("SG").filter(
  (t) => t.operatingAirline === "Singapore Airlines" && isTargetVerified(t),
);

const find = (airport: string, cabin: Cabin): RedemptionTarget => {
  const t = sq.find((x) => x.destination === airport && x.cabin === cabin);
  expect(t, `${airport} ${cabin} must exist`).toBeTruthy();
  return t!;
};

const dest = (airport: string) => {
  const d = SQ_DESTINATIONS_FROM_SIN.find((x) => x.airport === airport);
  expect(d, `${airport} must be in the SQ network dataset`).toBeTruthy();
  return d!;
};

describe("dataset integrity — every active Singapore KrisFlyer record", () => {
  it("is SIN-origin, SQ-operated, route-verified and zone-priced", () => {
    for (const t of sq) {
      expect(t.originAirport).toBe("SIN");
      expect(t.operatingAirline).toBe("Singapore Airlines");
      expect(t.pricingBasis).toBe("zone_based");
      expect(t.effectiveFrom).toBe("2025-11-01");
      const d = dest(t.destination);
      expect(d.currentServiceVerified).toBe(true);
      expect(d.verificationStatus).toBe("verified");
      expect(d.operatingCarrier).toBe("Singapore Airlines");
      expect(KRISFLYER_ZONES_FROM_ZONE1[d.singaporeAirlinesZone]).toBeTruthy();
      expect(t.pointsPerPerson).toBe(saverMilesFor(d, t.cabin as never));
    }
  });

  it("keeps route provenance separate from award provenance", () => {
    for (const d of SQ_DESTINATIONS_FROM_SIN) {
      expect(d.routeSource).toMatch(/route and schedule/i);
      expect(d.routeLastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const t of sq) {
      expect(t.source.sourceType).toBe("official_airline");
      expect(t.source.effectiveFrom).toBe("2025-11-01");
    }
  });

  it("contains no partner-only or excluded airport", () => {
    const airports = new Set(SQ_DESTINATIONS_FROM_SIN.map((d) => d.airport));
    for (const x of EXCLUDED_FROM_SQ_SAVER_DATASET) {
      expect(airports.has(x.airport), `${x.airport} must stay excluded`).toBe(false);
      expect(x.reason.length).toBeGreaterThan(10);
    }
  });

  it("publishes only Economy and Business", () => {
    expect(Array.from(new Set(sq.map((t) => t.cabin))).sort()).toEqual(["Business", "Economy"]);
  });
});

describe("zone mapping for named destinations", () => {
  it.each([
    ["CNS", 9, 29_000, 72_000],
    ["CHC", 9, 29_000, 72_000],
    ["LAX", 12, 44_000, 112_500],
    ["JFK", 13, 46_000, 117_000],
    ["LHR", 11, 44_000, 108_500],
    ["NRT", 7, 25_500, 54_500],
    ["PEK", 5, 20_500, 45_000],
    ["PVG", 5, 20_500, 45_000],
    ["CAN", 4, 15_500, 35_500],
    ["SZX", 4, 15_500, 35_500],
    ["RGN", 3, 13_000, 25_000],
    ["HYD", 6, 19_000, 45_000],
  ])("%s is zone %i at %i / %i one-way", (airport, zone, y, j) => {
    expect(dest(airport).singaporeAirlinesZone).toBe(zone);
    expect(find(airport, "Economy").pointsPerPerson).toBe(y);
    expect(find(airport, "Business").pointsPerPerson).toBe(j);
  });

  it("does not price New York in the West Coast zone", () => {
    expect(find("JFK", "Economy").pointsPerPerson).not.toBe(find("LAX", "Economy").pointsPerPerson);
    expect(dest("EWR").singaporeAirlinesZone).toBe(13);
  });

  it("keeps Beijing/Shanghai distinct from South China", () => {
    expect(dest("PEK").singaporeAirlinesZone).not.toBe(dest("CAN").singaporeAirlinesZone);
    expect(find("PEK", "Economy").pointsPerPerson).toBeGreaterThan(find("CAN", "Economy").pointsPerPerson);
  });
});

describe("requirement arithmetic across the whole dataset", () => {
  it("return is exactly twice one-way and scales by travellers", () => {
    for (const t of sq) {
      const one = computeRequiredPoints(t, "one_way", 1);
      expect(one).toBe(t.pointsPerPerson);
      expect(computeRequiredPoints(t, "return", 1)).toBe(one * 2);
      expect(computeRequiredPoints(t, "return", 3)).toBe(one * 6);
    }
  });

  it("exact balance is reachable, one mile below is not, and neither goes negative", () => {
    for (const t of sq) {
      const need = computeRequiredPoints(t, "return", 2);
      const exact = classifyRedemption(need, need);
      expect(exact.status).toBe("reachable");
      expect(exact.remaining).toBe(0);
      expect(exact.shortfall).toBeUndefined();

      const under = classifyRedemption(need - 1, need);
      expect(under.status).not.toBe("reachable");
      expect(under.shortfall).toBe(1);
      expect(under.remaining).toBeUndefined();

      const over = classifyRedemption(need + 5_000, need);
      expect(over.remaining).toBe(5_000);
    }
  });
});

describe("Australia and New Zealand coverage", () => {
  it("includes every current SQ gateway", () => {
    for (const a of ["ADL", "AKL", "BNE", "CNS", "CHC", "DRW", "MEL", "PER", "SYD"]) {
      expect(SQ_DESTINATIONS_FROM_SIN.some((d) => d.airport === a), `${a} missing`).toBe(true);
    }
  });

  it("prices Perth and Darwin in zone 8, not zone 9", () => {
    expect(dest("PER").singaporeAirlinesZone).toBe(8);
    expect(dest("DRW").singaporeAirlinesZone).toBe(8);
    expect(find("PER", "Economy").pointsPerPerson).toBe(20_500);
  });
});
