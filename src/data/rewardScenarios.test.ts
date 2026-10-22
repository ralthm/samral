import { describe, expect, it } from "vitest";
import { rewardScenario } from "./rewardScenarios";
import { DESTINATIONS, comparisonTargets, returnMiles } from "./rewardComparison";
import { compareRewards } from "../lib/rewardComparison";

describe("simplified comparison scenarios", () => {
  it("preserves the original Singapore mathematics with automatic defaults", () => {
    const flight = rewardScenario("SG", "Tokyo", "Economy", "krisflyer");
    const result = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4, ...flight });
    expect(flight.cashFare).toBe(1100);
    expect(flight.awardTaxes).toBe(100);
    expect(flight.awardMiles).toBe(51000);
    expect(result.netCashback).toBe(612);
    expect(result.annualMiles).toBe(50400);
    expect(result.netMilesValue).toBe(988.24);
    expect(result.breakEvenFare).toBe(719.29);
    expect(result.monthsNeeded).toBe(13);
  });
  for (const country of ["SG", "MY"] as const) {
    for (const destination of DESTINATIONS) {
      it(`provides an immediate, labelled ${country} ${destination.name} estimate`, () => {
        const programme = country === "SG" ? "krisflyer" : "enrich";
        const flight = rewardScenario(country, destination.name, "Economy", programme);
        const result = compareRewards({ monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4, ...flight });
        expect(flight.fareStatus).toBe("hypothetical");
        expect(flight.taxesStatus).toBe("hypothetical");
        expect(result.winner).not.toBe("incomplete");
        const target = comparisonTargets(country, destination.name, "Economy", programme)[0];
        expect(flight.awardIsPublished).toBe(!!target);
        if (target) expect(flight.awardMiles).toBe(returnMiles(target, 1));
      });
    }
  }
  it("uses actual quote overrides without changing reward earnings", () => {
    const flight = rewardScenario("SG", "Tokyo", "Economy", "krisflyer");
    const input = { monthlySpend: 3000, cashbackPercent: 1.7, earningRate: 1.4, ...flight };
    const result = compareRewards({ ...input, cashFare: 300, awardTaxes: 100 });
    expect(result.winner).toBe("cashback");
    expect(result.netCashback).toBe(612);
    expect(result.annualMiles).toBe(50400);
    expect(result.netMilesValue).toBe(197.65);
  });
  it("scales the same return itinerary by travellers", () => {
    const one = rewardScenario("SG", "Tokyo", "Economy", "krisflyer");
    const two = rewardScenario("SG", "Tokyo", "Economy", "krisflyer", 2);
    expect(two.cashFare).toBe(one.cashFare * 2);
    expect(two.awardTaxes).toBe(one.awardTaxes * 2);
    expect(two.awardMiles).toBe(102000);
  });
});