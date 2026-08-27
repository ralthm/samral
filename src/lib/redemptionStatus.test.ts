import { describe, expect, it } from "vitest";
import { classifyRedemption } from "./redemptionStatus";
import { computeRequiredPoints, redemptionTargets } from "@/data/redemptionTargets";

describe("classifyRedemption", () => {
  it("240,000 vs 3,000 is reachable with 237,000 remaining and no shortfall", () => {
    const c = classifyRedemption(240_000, 3_000);
    expect(c.status).toBe("reachable");
    expect(c.remaining).toBe(237_000);
    expect(c.shortfall).toBeUndefined();
  });

  it("an exact match is reachable with zero remaining and no shortfall", () => {
    const c = classifyRedemption(3_000, 3_000);
    expect(c.status).toBe("reachable");
    expect(c.remaining).toBe(0);
    expect(c.shortfall).toBeUndefined();
  });

  it("one point short is not reachable and has a shortfall of 1", () => {
    const c = classifyRedemption(2_999, 3_000);
    expect(c.status).not.toBe("reachable");
    expect(c.shortfall).toBe(1);
    expect(c.remaining).toBeUndefined();
  });

  it("a zero balance is not reachable and owes the full requirement", () => {
    const c = classifyRedemption(0, 3_000);
    expect(c.status).toBe("future");
    expect(c.shortfall).toBe(3_000);
  });

  it("never yields a close card with a shortfall of zero or less", () => {
    for (let balance = 0; balance <= 6_000; balance += 37) {
      const c = classifyRedemption(balance, 3_000);
      if (c.status === "close" || c.status === "future") {
        expect(c.shortfall!).toBeGreaterThan(0);
      } else {
        expect(c.shortfall).toBeUndefined();
        expect(c.remaining!).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("traveller and trip-type multiplication happens before classification", () => {
  const target = { ...redemptionTargets[0], pointsPerPerson: 1_500 };

  it("multiplies party size and trip type into the requirement", () => {
    expect(computeRequiredPoints(target, "return", 1)).toBe(3_000);
    expect(computeRequiredPoints(target, "return", 2)).toBe(6_000);
    expect(computeRequiredPoints(target, "one_way", 1)).toBe(1_500);
  });

  it("classifies against the multiplied requirement", () => {
    const balance = 4_000;
    expect(classifyRedemption(balance, computeRequiredPoints(target, "return", 1)).status).toBe("reachable");
    const two = classifyRedemption(balance, computeRequiredPoints(target, "return", 2));
    expect(two.status).not.toBe("reachable");
    expect(two.shortfall).toBe(2_000);
  });
});
