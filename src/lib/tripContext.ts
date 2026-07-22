// Session-scoped trip planning context. Passed from the calculator's
// destination cards to /trip-planning. Never persisted; never sent to
// analytics.

export interface TripContext {
  origin: string;
  destination: string;
  destinationName: string;
  cabin: string;
  tripType: "one_way" | "return";
  travellers: number;
  loyaltyProgrammeId: string;
  loyaltyProgrammeName: string;
  operatingAirline?: string;
  redemptionType: string;
  requiredPoints: number;
  potentialProgrammeBalance: number;
  remainingAfterRedemption: number;
  verifiedOn: string;
  createdAt: string;
}

const KEY = "samral.tripContext";

export function saveTripContext(ctx: TripContext) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    /* no-op */
  }
}

export function readTripContext(): TripContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TripContext;
  } catch {
    return null;
  }
}

export function clearTripContext() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
