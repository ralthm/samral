// Alliance metadata for loyalty programmes. Educational-only layer.
// - Does NOT create separate alliance point balances.
// - Does NOT define new transfer routes or partner-award pricing.
// - Miles remain in the original loyalty programme; the alliance simply
//   indicates the programme MAY allow redemptions on partner-airline flights,
//   subject to the loyalty programme's own award rules and availability.

export type AllianceCode = "OW" | "SA";

export interface AllianceProgrammeInfo {
  programmeId: string;
  allianceCode: AllianceCode;
  allianceDisplayName: "oneworld" | "Star Alliance";
  primaryAirline: string;
  partnerAwardsSupported: true;
  /** Optional programme-specific disclaimer. Falls back to standard copy. */
  partnerAwardDisclaimer?: string;
  officialSourceUrl: string;
  verifiedAt: string; // YYYY-MM-DD
}

export const ALLIANCE_PROGRAMMES: Record<string, AllianceProgrammeInfo> = {
  enrich: {
    programmeId: "enrich",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "Malaysia Airlines",
    partnerAwardsSupported: true,
    partnerAwardDisclaimer:
      "Enrich Points may also be redeemed for eligible oneworld and other Enrich partner-airline awards. Partner pricing and conditions differ from Malaysia Airlines-operated redemptions, and some bookings may require Malaysia Airlines' contact centre or ticket office.",
    officialSourceUrl: "https://www.malaysiaairlines.com/my/en/enrich/use-enrich-points/redeem-flights.html",
    verifiedAt: "2026-07-23",
  },
  "asia-miles": {
    programmeId: "asia-miles",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "Cathay Pacific",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.cathaypacific.com/cx/en_HK/asia-miles/redeem-awards.html",
    verifiedAt: "2026-07-23",
  },
  qatar: {
    programmeId: "qatar",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "Qatar Airways",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.qatarairways.com/en/privilege-club.html",
    verifiedAt: "2026-07-23",
  },
  ba: {
    programmeId: "ba",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "British Airways",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.britishairways.com/en-gb/executive-club",
    verifiedAt: "2026-07-23",
  },
  jal: {
    programmeId: "jal",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "Japan Airlines",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.jal.co.jp/jalmile/en/",
    verifiedAt: "2026-07-23",
  },
  krisflyer: {
    programmeId: "krisflyer",
    allianceCode: "SA",
    allianceDisplayName: "Star Alliance",
    primaryAirline: "Singapore Airlines",
    partnerAwardsSupported: true,
    partnerAwardDisclaimer:
      "KrisFlyer miles may also be redeemed for eligible Star Alliance and other Singapore Airlines partner-airline awards. Some partner awards may not be available through the online search and may require KrisFlyer Membership Services.",
    officialSourceUrl: "https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/use-miles/flights/",
    verifiedAt: "2026-07-23",
  },
  eva: {
    programmeId: "eva",
    allianceCode: "SA",
    allianceDisplayName: "Star Alliance",
    primaryAirline: "EVA Air",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.evaair.com/en-global/infinity-mileagelands/use-miles/",
    verifiedAt: "2026-07-23",
  },
  turkish: {
    programmeId: "turkish",
    allianceCode: "SA",
    allianceDisplayName: "Star Alliance",
    primaryAirline: "Turkish Airlines",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.turkishairlines.com/en-int/miles-and-smiles/",
    verifiedAt: "2026-07-23",
  },
  qantas: {
    programmeId: "qantas",
    allianceCode: "OW",
    allianceDisplayName: "oneworld",
    primaryAirline: "Qantas",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.qantas.com/au/en/frequent-flyer/discover-and-join/earn-and-use-points.html",
    verifiedAt: "2026-08-27",
  },
  rop: {
    programmeId: "rop",
    allianceCode: "SA",
    allianceDisplayName: "Star Alliance",
    primaryAirline: "Thai Airways",
    partnerAwardsSupported: true,
    officialSourceUrl: "https://www.thaiairways.com/en/royal_orchid_plus/use_miles/",
    verifiedAt: "2026-08-27",
  },
};

/**
 * Programmes that are deliberately NOT alliance members. Kept explicit so no
 * future edit labels them oneworld or Star Alliance.
 */
export const NON_ALLIANCE_PROGRAMMES = ["etihad", "flying-blue", "emirates", "airasia", "batik"] as const;


export function getAllianceInfo(programmeId: string): AllianceProgrammeInfo | null {
  return ALLIANCE_PROGRAMMES[programmeId] ?? null;
}
