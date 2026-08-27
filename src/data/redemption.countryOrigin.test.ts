import { describe, expect, it } from "vitest";
import {
  COUNTRY_ORIGINS,
  isTargetPublic,
  isTargetVerified,
  originLabelForCountry,
  redemptionTargets,
  targetsForCountry,
} from "@/data/redemptionTargets";
import { summaryCounters } from "@/data/milesCalculator";

describe("redemption records are market-scoped", () => {
  it("every record declares a market and an origin airport", () => {
    for (const t of redemptionTargets) {
      expect(["MY", "SG"]).toContain(t.country);
      expect(t.originAirport).toMatch(/^[A-Z]{3}$/);
      expect(t.originCountry.length).toBeGreaterThan(0);
    }
  });

  it("Malaysia records all depart KUL", () => {
    const my = targetsForCountry("MY");
    expect(my.length).toBeGreaterThan(0);
    for (const t of my) expect(t.originAirport).toBe("KUL");
  });

  it("Singapore records all depart SIN — no KUL-origin leakage", () => {
    const sg = targetsForCountry("SG");
    expect(sg.length).toBeGreaterThan(0);
    for (const t of sg) {
      expect(t.originAirport).toBe("SIN");
      expect(t.originCountry).toBe("Singapore");
      expect(t.destination).not.toBe("SIN");
    }
  });

  it("markets never share a record", () => {
    const my = new Set(targetsForCountry("MY").map((t) => t.id));
    for (const t of targetsForCountry("SG")) expect(my.has(t.id)).toBe(false);
  });

  it("origin labels come from the country registry", () => {
    expect(originLabelForCountry("SG")).toBe("Singapore (SIN)");
    expect(originLabelForCountry("MY")).toBe("Kuala Lumpur (KUL)");
    expect(COUNTRY_ORIGINS.SG[0].airport).toBe("SIN");
  });
});

describe("Singapore award data", () => {
  const sg = targetsForCountry("SG");

  it("prices SIN–KUL on the KrisFlyer Saver chart effective 1 Nov 2025", () => {
    const economy = sg.find((t) => t.id === "sg-kf-kul-y")!;
    const business = sg.find((t) => t.id === "sg-kf-kul-j")!;
    expect(economy.pointsPerPerson).toBe(8000);
    expect(business.pointsPerPerson).toBe(22000);
    for (const t of [economy, business]) {
      expect(t.operatingAirline).toBe("Singapore Airlines");
      expect(t.effectiveFrom).toBe("2025-11-01");
      expect(t.directOrConnecting).toBe("direct");
      expect(t.availabilityChecked).toBe(false);
      expect(isTargetVerified(t)).toBe(true);
    }
  });

  it("keeps unverified route pricing out of firm targets", () => {
    const scoot = sg.find((t) => t.id === "sg-scoot-kul-y")!;
    expect(scoot.status).toBe("supported_unverified");
    expect(isTargetVerified(scoot)).toBe(false);
    expect(isTargetPublic(scoot)).toBe(true);
  });

  it("carries a source and a taxes note on every record", () => {
    for (const t of sg) {
      expect(t.sourceUrl).toMatch(/^https:\/\//);
      expect(t.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(t.taxesAndFeesNote.length).toBeGreaterThan(0);
    }
  });
});

describe("hero counters are derived per market", () => {
  it("reports Singapore issuers from the dataset, not a fixed number", () => {
    const sg = summaryCounters("SG");
    const my = summaryCounters("MY");
    expect(sg.issuers).toBeGreaterThan(0);
    expect(my.issuers).toBeGreaterThan(0);
    expect(sg.routes).toBeGreaterThan(0);
    expect(sg.routes).not.toBe(my.routes);
  });
});
