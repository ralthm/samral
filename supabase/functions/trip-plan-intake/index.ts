// Gatekeeper for /trip-intake.
//
//   verify  → confirms the Checkout Session is a PAID Samral Trip Plan,
//             creates/refreshes the order, returns order ref + prefill data.
//   submit  → stores the trip questionnaire against that verified order
//             (exactly once) and sets the delivery deadline.
//
// The Checkout Session ID is the only credential: it is unguessable, issued
// by Stripe, and every action re-checks payment status server-side.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import {
  DELIVERY_BUSINESS_DAYS,
  addBusinessDays,
  adminClient,
  publicOrder,
  reconcileOrder,
  retrieveSession,
  stripeClient,
  type OrderRow,
} from "../_shared/trip-plan.ts";

const SessionId = z.string().regex(/^cs_(test|live)_[A-Za-z0-9]{10,}$/, "Invalid session reference");

const IntakeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  departure_airport: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(200),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_flexibility: z.string().trim().min(1).max(60),
  travellers: z.number().int().min(1).max(2),
  adults: z.number().int().min(0).max(2),
  children: z.number().int().min(0).max(2),
  cabin_preference: z.string().trim().min(1).max(60),
  points_balances: z
    .array(z.object({ programme: z.string().trim().max(80), balance: z.string().trim().max(40) }))
    .max(12),
  priorities: z.array(z.string().trim().max(60)).max(2),
  found_cash_fare: z.boolean(),
  cash_fare_amount: z.string().trim().max(40).nullable().optional(),
  cash_fare_currency: z.string().trim().max(10).nullable().optional(),
  airlines_to_avoid: z.string().trim().max(300).nullable().optional(),
  airline_status: z.string().trim().max(300).nullable().optional(),
  special_requirements: z.string().trim().max(1000).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  acknowledged: z.literal(true),
});

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify"), session_id: SessionId }),
  z.object({ action: z.literal("submit"), session_id: SessionId, intake: IntakeSchema }),
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  const body = parsed.data;

  const db = adminClient();
  let stripe;
  try {
    stripe = stripeClient();
  } catch (err) {
    return json({ error: "stripe_unavailable", message: (err as Error).message }, 503);
  }

  // ---- Resolve + verify the order for this session --------------------
  const check = await retrieveSession(stripe, body.session_id);
  if (!check.ok) {
    if (check.reason === "not_found") return json({ error: "not_found" }, 404);
    if (check.reason === "wrong_product") return json({ error: "wrong_product" }, 403);
    console.error("Stripe error verifying session", check.message);
    return json({ error: "stripe_unavailable", message: check.message }, 503);
  }
  const session = check.session;

  if (session.payment_status !== "paid") {
    // Async methods (bank redirects etc.) may still be settling. Record what
    // we know but do not unlock the form.
    try {
      await reconcileOrder(db, session);
    } catch (err) {
      console.error("reconcile (unpaid) failed", err);
    }
    return json({ error: "unpaid", payment_status: session.payment_status, status: session.status }, 402);
  }

  let order: OrderRow;
  try {
    order = await reconcileOrder(db, session);
  } catch (err) {
    console.error("reconcile failed", err);
    return json({ error: "order_error" }, 500);
  }

  if (body.action === "verify") return json({ order: publicOrder(order) });

  // ---- Submit intake (idempotent per order) ----------------------------
  if (order.intake_status === "received") {
    return json({ order: publicOrder(order), already_submitted: true });
  }

  const i = body.intake;
  if (i.return_date < i.departure_date) return json({ error: "invalid_dates" }, 400);

  const cleanPoints = i.points_balances.filter((r) => r.programme || r.balance);
  const { data: inserted, error: insErr } = await db
    .from("trip_intake_submissions")
    .insert({
      order_id: order.id,
      name: i.name,
      email: i.email,
      departure_airport: i.departure_airport,
      destination: i.destination,
      departure_date: i.departure_date,
      return_date: i.return_date,
      date_flexibility: i.date_flexibility,
      travellers: i.travellers,
      adults: i.adults,
      children: i.children,
      cabin_preference: i.cabin_preference,
      points_balances: cleanPoints,
      priorities: i.priorities,
      found_cash_fare: i.found_cash_fare,
      cash_fare_amount: i.found_cash_fare ? i.cash_fare_amount || null : null,
      cash_fare_currency: i.found_cash_fare ? i.cash_fare_currency || null : null,
      airlines_to_avoid: i.airlines_to_avoid || null,
      airline_status: i.airline_status || null,
      special_requirements: i.special_requirements || null,
      notes: i.notes || null,
      acknowledged: true,
      stripe_session_id: session.id,
      source: "trip_intake_page",
    })
    .select("id")
    .single();

  if (insErr) {
    if (insErr.code === "23505") {
      // Concurrent double-submit: the other request won. Return current state.
      const { data: fresh } = await db
        .from("trip_plan_orders")
        .select("*")
        .eq("id", order.id)
        .single();
      return json({ order: publicOrder((fresh ?? order) as OrderRow), already_submitted: true });
    }
    console.error("intake insert failed", insErr);
    return json({ error: "intake_error" }, 500);
  }

  const now = new Date();
  const deadline = addBusinessDays(now, DELIVERY_BUSINESS_DAYS);
  const { data: updated, error: updErr } = await db
    .from("trip_plan_orders")
    .update({
      intake_status: "received",
      status: order.status === "paid_awaiting_intake" ? "intake_received" : order.status,
      intake_submitted_at: now.toISOString(),
      delivery_deadline: deadline.toISOString(),
      customer_name: order.customer_name ?? i.name,
    })
    .eq("id", order.id)
    .select("*")
    .single();
  if (updErr) {
    console.error("order update after intake failed", updErr, inserted?.id);
    return json({ error: "order_update_error" }, 500);
  }

  return json({ order: publicOrder(updated as OrderRow), already_submitted: false });
});
