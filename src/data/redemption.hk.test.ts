import { describe, expect, it } from "vitest";
import { cathayBandFor, CATHAY_BANDS } from "./redemption.hk";
import {
  computeRequiredPoints,
  isTargetVerified,
  targetsForCountry,
} from "./redemptionTargets";
import { classifyRedemption } from "@/lib/redemptionStatus";

const hk = targetsForCountry("HK");

function find(programmeId: string, destination: string, cabin: string) {
  return hk.find(
    (t) => t.programmeId === programmeId && t.destination === destination && t.cabin === cabin,
  );
}

describe("Hong Kong redemption engine", () => {
  it("only departs HKG", () => {
    expect(hk.length).toBeGreaterThan(0);
    expect(hk.every((t) => t.originAirport === "HKG")).toBe(true);
  });

  it("only activates the three deterministic programmes", () => {
    expect(new Set(hk.map((t) => t.programmeId))).toEqual(
      new Set(["asia-miles", "krisflyer", "eva"]),
    );
  });

  it("never invents flight awards for dynamic-pricing programmes", () => {
    for (const p of ["qatar", "ba", "avios", "flying-blue", "qantas", "etihad", "rop"]) {
      expect(hk.some((t) => t.programmeId === p)).toBe(false);
    }
  });

  it("applies the Type 2 designated-market rule, not distance alone", () => {
    expect(cathayBandFor(500, "Taiwan")).toBe("ultra_short");
    expect(cathayBandFor(1044, "Thailand")).toBe("short_type_1");
    expect(cathayBandFor(1800, "Japan")).toBe("short_type_2");
    expect(cathayBandFor(2050, "Nepal")).toBe("short_type_2");
    expect(cathayBandFor(4577, "Australia")).toBe("medium");
    expect(cathayBandFor(5990, "United Kingdom")).toBe("long");
    expect(cathayBandFor(8054, "United States")).toBe("ultra_long");
  });

  it("uses the May 2026 Cathay chart", () => {
    expect(CATHAY_BANDS.short_type_1.business).toBe(27000);
    expect(CATHAY_BANDS.short_type_2.premiumEconomy).toBe(23000);
    expect(CATHAY_BANDS.long.business).toBe(91000);
    expect(CATHAY_BANDS.ultra_long.first).toBe(160000);
  });

  it.each([
    ["TPE", "Economy", 7000],
    ["TPE", "Business", 16000],
    ["BKK", "Economy", 9000],
    ["BKK", "Business", 27000],
    ["SIN", "Economy", 9000],
    ["NRT", "Economy", 13000],
    ["NRT", "Business", 33000],
    ["NRT", "First or Business Suite", 50000],
    ["SYD", "Economy", 20000],
    ["LHR", "Economy", 27000],
    ["JFK", "Economy", 38000],
  ])("Asia Miles HKG-%s %s = %i", (dest, cabin, points) => {
    const t = find("asia-miles", dest, cabin);
    expect(t?.pointsPerPerson).toBe(points);
    expect(isTargetVerified(t!)).toBe(true);
  });

  it("prices KrisFlyer HKG-SIN on the Nov 2025 Saver chart", () => {
    expect(find("krisflyer", "SIN", "Economy")?.pointsPerPerson).toBe(15500);
    expect(find("krisflyer", "SIN", "Premium Economy")?.pointsPerPerson).toBe(25000);
    expect(find("krisflyer", "SIN", "Business")?.pointsPerPerson).toBe(35500);
  });

  it("does not generate KrisFlyer itineraries beyond Singapore", () => {
    const kf = hk.filter((t) => t.programmeId === "krisflyer");
    expect(new Set(kf.map((t) => t.destination))).toEqual(new Set(["SIN"]));
  });

  it("prices EVA HKG-TPE and doubles it for a return", () => {
    const y = find("eva", "TPE", "Economy")!;
    const j = find("eva", "TPE", "Business")!;
    expect(y.pointsPerPerson).toBe(10000);
    expect(j.pointsPerPerson).toBe(25000);
    expect(computeRequiredPoints(y, "return", 1)).toBe(20000);
    expect(computeRequiredPoints(j, "return", 1)).toBe(50000);
  });

  it("matches the launch test case balances", () => {
    const asiaMiles = 40500;
    const enough = ["TPE:Economy", "BKK:Business", "NRT:Business", "SYD:Economy", "LHR:Economy", "JFK:Economy"];
    for (const key of enough) {
      const [dest, cabin] = key.split(":");
      const t = find("asia-miles", dest, cabin)!;
      expect(classifyRedemption(asiaMiles, computeRequiredPoints(t, "one_way", 1)).status).toBe("reachable");
    }
    expect(classifyRedemption(18000, 15500).status).toBe("reachable"); // KrisFlyer SIN
    expect(classifyRedemption(18000, 10000).status).toBe("reachable"); // EVA TPE economy
    const evaJ = classifyRedemption(18000, 25000); // EVA TPE business
    expect(evaJ.status).toBe("close");
    expect(evaJ.shortfall).toBe(7000);
  });

  it("moves a two-traveller Tokyo Business award out of reachable", () => {
    const t = find("asia-miles", "NRT", "Business")!;
    const c = classifyRedemption(40500, computeRequiredPoints(t, "one_way", 2));
    expect(c.status).not.toBe("reachable");
    expect(c.shortfall).toBe(25500);
  });
});
