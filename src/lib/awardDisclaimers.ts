/**
 * Award disclaimers shown under the destination-discovery grid.
 *
 * Programme-specific legal/detail text renders ONLY when that programme has
 * visible redemption opportunities in the current result set. Universal
 * wording always renders.
 */

export const UNIVERSAL_AWARD_DISCLAIMER =
  "Award-seat availability has not been checked. Taxes, fees and airline surcharges may apply in addition to the points requirement. Partner-airline awards on any programme require separate pricing and are not shown here.";

const PROGRAMME_DISCLAIMERS: Record<string, string> = {
  enrich:
    "Enrich Saver applies to point-to-point itineraries on Malaysia Airlines-operated flights only and is bookable one-way or return, with a return booking requiring twice the one-way points; codeshares and connecting sectors are priced separately.",
  krisflyer:
    "KrisFlyer Saver uses the Singapore Airlines award chart effective 1 November 2025 for Singapore Airlines-operated itineraries. Scoot redemptions made with KrisFlyer miles are priced separately by Scoot.",
  "asia-miles":
    "Asia Miles opportunities cover Cathay Pacific-operated flights only.",
};

/** Ordered programme-specific disclaimers for the programmes actually visible. */
export function awardDisclaimersFor(visibleProgrammeIds: Iterable<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of visibleProgrammeIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const text = PROGRAMME_DISCLAIMERS[id];
    if (text) out.push(text);
  }
  return out;
}

export function hasProgrammeDisclaimer(programmeId: string): boolean {
  return programmeId in PROGRAMME_DISCLAIMERS;
}
