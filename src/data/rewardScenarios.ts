import { comparisonTargets, returnMiles, type ComparisonCountry } from "./rewardComparison";

/** Hypothetical comparison inputs, not observed fares, verified taxes or offers.
 * Published mileage is used only for an exact existing itinerary match. */
const examples: Record<string, { SG?: [number, number]; MY: [number, number]; hypotheticalMiles: number }> = {
  Tokyo: { SG: [1100, 100], MY: [3000, 350], hypotheticalMiles: 51000 },
  Bangkok: { SG: [350, 80], MY: [900, 200], hypotheticalMiles: 26000 },
  Seoul: { SG: [900, 100], MY: [2500, 350], hypotheticalMiles: 51000 },
  "Hong Kong": { SG: [550, 100], MY: [1600, 300], hypotheticalMiles: 31000 },
  Taipei: { SG: [600, 100], MY: [1800, 300], hypotheticalMiles: 31000 },
  London: { SG: [1600, 180], MY: [5000, 650], hypotheticalMiles: 88000 },
  Singapore: { MY: [500, 120], hypotheticalMiles: 15000 },
};

export function rewardScenario(country: ComparisonCountry, city: string, cabin: "Economy" | "Business", programme: string, passengers = 1) {
  const example = examples[city]?.[country] ? examples[city] : examples.Tokyo;
  const [fare, taxes] = example[country] ?? examples.Tokyo[country] ?? [0, 0];
  const target = comparisonTargets(country, city, cabin, programme)[0];
  const cabinMultiplier = cabin === "Business" ? 3 : 1;
  return {
    cashFare: fare * cabinMultiplier * passengers,
    awardTaxes: taxes * passengers,
    awardMiles: target ? returnMiles(target, passengers) : example.hypotheticalMiles * (cabin === "Business" ? 2 : 1) * passengers,
    awardIsPublished: !!target,
    fareStatus: "hypothetical" as const,
    taxesStatus: "hypothetical" as const,
  };
}