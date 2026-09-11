/**
 * Central commerce configuration for Samral's paid consumer services.
 *
 * Everything that may need to change without touching page layouts lives here:
 * prices, external checkout / booking URLs, and the delivery-time promise.
 *
 * Environment overrides (optional):
 *   VITE_CARD_STRATEGY_BOOKING_URL – Cal.com event for Personal Card Strategy
 */

import { supabase } from "@/integrations/supabase/client";

const env = import.meta.env as Record<string, string | undefined>;

/* ---------- Prices (USD) ---------- */

export const PRICES = {
  tripPlan: 79,
  cardStrategy: 99,
  bookingSupportFrom: 49,
} as const;

export const formatUsd = (n: number) => `$${n}`;

export const CURRENCY_NOTE = "Local currency may be shown at checkout.";

/** Price presentation for the one-time Trip Plan purchase. */
export const TRIP_PLAN_PRICE_LABEL = `${formatUsd(PRICES.tripPlan)} · paid once`;

/* ---------- Points Trip Planning checkout (Stripe-hosted) ---------- */

export type CheckoutResult = { ok: true } | { ok: false; message: string };

/**
 * Asks the backend to create a Stripe Checkout Session for exactly one
 * USD $79 Samral Points Trip Plan and redirects the browser to Stripe's hosted
 * payment page. No card details are ever handled by this site.
 */
export async function startTripPlanCheckout(source: string): Promise<CheckoutResult> {
  track("trip_plan_cta_clicked", { source, price_usd: PRICES.tripPlan });
  const params = new URLSearchParams(window.location.search);
  const utm = (k: string) => params.get(k)?.slice(0, 100) || undefined;

  const { data, error } = await supabase.functions.invoke("trip-plan-checkout", {
    body: { source, utm_source: utm("utm_source"), utm_medium: utm("utm_medium"), utm_campaign: utm("utm_campaign") },
  });

  if (error || !data?.url) {
    track("checkout_failed", { source });
    return {
      ok: false,
      message: `Checkout couldn't be started just now. Please try again in a moment, or email ${CONTACT_EMAIL}.`,
    };
  }
  track("checkout_started", { source, price_usd: PRICES.tripPlan, livemode: Boolean(data.livemode) });
  window.location.assign(data.url as string);
  return { ok: true };
}

/**
 * Cal.com event for Personal Card Strategy (Cal.com handles scheduling,
 * booking questions and Stripe payment).
 * Set the Cal.com "redirect on booking" to: https://www.samral.com/card-strategy-confirmed
 */
export const CARD_STRATEGY_BOOKING_URL =
  env.VITE_CARD_STRATEGY_BOOKING_URL || "https://cal.com/samral/card-strategy-discovery";

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
