/**
 * Central commerce configuration for Samral's paid consumer services.
 *
 * Everything that may need to change without touching page layouts lives here:
 * prices, external checkout / booking URLs, and the delivery-time promise.
 *
 * Environment overrides (optional):
 *   VITE_TRIP_PLAN_FORM_URL – Tally Points Trip Plan form (handles intake + Stripe payment)
 *   VITE_CARD_STRATEGY_BOOKING_URL – Cal.com event for Personal Card Strategy
 */

const env = import.meta.env as Record<string, string | undefined>;

/* ---------- Prices (USD) ---------- */

export const PRICES = {
  tripPlan: 99,
  cardStrategy: 149,
  bookingSupportFrom: 49,
} as const;

export const formatUsd = (n: number) => `US$${n}`;

export const CURRENCY_NOTE = "Local currency may be shown at checkout.";

/** Price presentation for the one-time Trip Plan purchase. */
export const TRIP_PLAN_PRICE_LABEL = `${formatUsd(PRICES.tripPlan)} · paid once`;

/* ---------- Points Trip Planning (Tally form handles intake + Stripe payment) ---------- */

export const TRIP_PLAN_FORM_URL =
  env.VITE_TRIP_PLAN_FORM_URL || "https://tally.so/r/KY9pAz";

/**
 * Cal.com event for Personal Card Strategy (Cal.com handles scheduling,
 * booking questions and Stripe payment).
 * Set the Cal.com "redirect on booking" to: https://www.samral.com/card-strategy-confirmed
 */
export const CARD_STRATEGY_BOOKING_URL =
  env.VITE_CARD_STRATEGY_BOOKING_URL || "https://cal.com/samral/card-strategy";

/** Free business conversation — business enquiries are never paid. */
export const BUSINESS_CALL_URL = "https://cal.com/samral/business-discovery-call";

/** Simple contact route for the optional Booking Support add-on. */
export const BOOKING_SUPPORT_CONTACT_URL =
  "mailto:samuel@samral.com?subject=" + encodeURIComponent("Booking Support (Trip Plan add-on)");

export const CONTACT_EMAIL = "samuel@samral.com";

/* ---------- Delivery promise ---------- */

/** Flip to false if the delivery promise can't be met operationally. */
export const SHOW_DELIVERY_TIME = true;

/** Change here to update the delivery-time copy everywhere. */
export const DELIVERY_TIME = "2 business days";

export const DELIVERY_COPY = `Delivered within ${DELIVERY_TIME}.`;

/* ---------- Analytics ---------- */

export const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as { datafast?: (e: string, p?: Record<string, unknown>) => void };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};

export const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);
