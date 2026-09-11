// Shared helpers for the paid Points Trip Plan flow.
//
// Everything that touches Stripe or the `trip_plan_orders` table for the
// Trip Plan product goes through here so the checkout, webhook and intake
// functions agree on exactly what a valid, paid order looks like.

import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

export const PRODUCT_KEY = "points_trip_plan";
export const PRODUCT_NAME = "Samral Points Trip Plan";
export const PRODUCT_DESCRIPTION =
  "Personalised points research and a written recommendation for one round-trip journey, up to 2 travellers.";
export const AMOUNT_USD_CENTS = 7900;
export const DELIVERY_BUSINESS_DAYS = 2;

export const ALLOWED_ORIGINS = [
  "https://www.samral.com",
  "https://samral.com",
  "https://samral-ventures-hub.lovable.app",
  "https://id-preview--6015d7e4-db2c-4249-922d-55a1008f8ee9.lovable.app",
];
export const DEFAULT_ORIGIN = "https://www.samral.com";

export function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin)) return origin;
  if (/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/i.test(origin)) return origin;
  if (/^http:\/\/localhost(:\d+)?$/i.test(origin)) return origin;
  return DEFAULT_ORIGIN;
}

/* ------------------------------- clients ------------------------------- */

export function stripeClient(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, {
    apiVersion: "2025-08-27.basil",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

/* ------------------------------ product ------------------------------- */

/**
 * Find (or create once) the Stripe Product + Price for the Trip Plan.
 * Keyed by metadata so the same code works in test and live mode without
 * hard-coding environment-specific IDs.
 */
export async function resolveTripPlanPrice(stripe: Stripe): Promise<Stripe.Price> {
  const envPrice = Deno.env.get("STRIPE_TRIP_PLAN_PRICE_ID");
  if (envPrice) return await stripe.prices.retrieve(envPrice);

  const found = await stripe.prices.search({
    query: `metadata['samral_key']:'${PRODUCT_KEY}' AND active:'true'`,
    limit: 1,
  });
  const existing = found.data.find(
    (p) => p.unit_amount === AMOUNT_USD_CENTS && p.currency === "usd" && p.type === "one_time",
  );
  if (existing) return existing;

  const products = await stripe.products.search({
    query: `metadata['samral_key']:'${PRODUCT_KEY}' AND active:'true'`,
    limit: 1,
  });
  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: PRODUCT_NAME,
      description: PRODUCT_DESCRIPTION,
      metadata: { samral_key: PRODUCT_KEY },
    }));

  return await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: AMOUNT_USD_CENTS,
    metadata: { samral_key: PRODUCT_KEY },
  });
}

/* ---------------------------- verification ---------------------------- */

export type SessionCheck =
  | { ok: true; session: Stripe.Checkout.Session }
  | { ok: false; reason: "not_found" | "wrong_product" | "stripe_error"; message?: string };

export async function retrieveSession(stripe: Stripe, sessionId: string): Promise<SessionCheck> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "payment_intent"],
    });
    if (!isTripPlanSession(session)) return { ok: false, reason: "wrong_product" };
    return { ok: true, session };
  } catch (err) {
    const e = err as { code?: string; statusCode?: number; message?: string };
    if (e.code === "resource_missing" || e.statusCode === 404) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "stripe_error", message: e.message };
  }
}

/** Strict check that a Checkout Session is exactly one USD 79 Trip Plan. */
export function isTripPlanSession(session: Stripe.Checkout.Session): boolean {
  if (session.mode !== "payment") return false;
  if (session.metadata?.samral_service !== PRODUCT_KEY) return false;
  const items = session.line_items?.data ?? [];
  if (items.length !== 1) return false;
  const item = items[0];
  if (item.quantity !== 1) return false;
  const price = item.price;
  if (!price || price.currency !== "usd" || price.unit_amount !== AMOUNT_USD_CENTS) return false;
  const product = price.product;
  const productMeta = typeof product === "object" && product && "metadata" in product ? product.metadata : null;
  if (productMeta?.samral_key !== PRODUCT_KEY && price.metadata?.samral_key !== PRODUCT_KEY) return false;
  return true;
}

/* -------------------------------- orders ------------------------------- */

export type OrderRow = {
  id: string;
  order_number: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  payment_status: string;
  status: string;
  intake_status: string;
  purchased_at: string | null;
  intake_submitted_at: string | null;
  delivery_deadline: string | null;
  refund_status: string;
  stripe_livemode: boolean;
};

const ORDER_COLUMNS =
  "id, order_number, stripe_checkout_session_id, stripe_payment_intent_id, stripe_customer_id, customer_name, customer_email, payment_status, status, intake_status, purchased_at, intake_submitted_at, delivery_deadline, refund_status, stripe_livemode";

/**
 * Create or refresh the order for a verified Trip Plan session. Idempotent:
 * keyed on the Checkout Session ID, and never regresses intake/fulfilment
 * state that has already advanced.
 */
export async function reconcileOrder(
  db: ReturnType<typeof adminClient>,
  session: Stripe.Checkout.Session,
): Promise<OrderRow> {
  const paid = session.payment_status === "paid";
  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const { data: existing } = await db
    .from("trip_plan_orders")
    .select(ORDER_COLUMNS)
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  const base = {
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: customerId,
    stripe_livemode: Boolean(session.livemode),
    product_key: PRODUCT_KEY,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    amount_usd: AMOUNT_USD_CENTS,
    customer_name: session.customer_details?.name ?? existing?.customer_name ?? null,
    customer_email: session.customer_details?.email ?? session.customer_email ?? existing?.customer_email ?? null,
    payment_status: session.payment_status,
    metadata: {
      source: session.metadata?.source ?? null,
      utm_source: session.metadata?.utm_source ?? null,
      utm_medium: session.metadata?.utm_medium ?? null,
      utm_campaign: session.metadata?.utm_campaign ?? null,
    },
  };

  if (!existing) {
    const status = paid ? "paid_awaiting_intake" : "pending_payment";
    const { data, error } = await db
      .from("trip_plan_orders")
      .insert({ ...base, status, purchased_at: paid ? new Date().toISOString() : null })
      .select(ORDER_COLUMNS)
      .single();
    if (error) {
      // Lost a race with a concurrent insert (e.g. webhook + page load): read it back.
      if (error.code === "23505") {
        const { data: again } = await db
          .from("trip_plan_orders")
          .select(ORDER_COLUMNS)
          .eq("stripe_checkout_session_id", session.id)
          .single();
        if (again) return again as OrderRow;
      }
      throw error;
    }
    return data as OrderRow;
  }

  const patch: Record<string, unknown> = { ...base };
  if (paid && existing.status === "pending_payment") {
    patch.status = "paid_awaiting_intake";
    patch.purchased_at = existing.purchased_at ?? new Date().toISOString();
  }
  const { data, error } = await db
    .from("trip_plan_orders")
    .update(patch)
    .eq("id", existing.id)
    .select(ORDER_COLUMNS)
    .single();
  if (error) throw error;
  return data as OrderRow;
}

/* ------------------------------ deadlines ----------------------------- */

/** Adds N business days (Mon–Fri) to a date, preserving time of day. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return d;
}

export function publicOrder(order: OrderRow) {
  return {
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    status: order.status,
    intake_status: order.intake_status,
    intake_submitted_at: order.intake_submitted_at,
    delivery_deadline: order.delivery_deadline,
    livemode: order.stripe_livemode,
  };
}
