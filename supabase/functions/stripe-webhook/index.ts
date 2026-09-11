// Stripe webhook for the Points Trip Plan.
//
// - Verifies the Stripe-Signature header with STRIPE_WEBHOOK_SECRET.
// - De-duplicates events via `stripe_webhook_events` (Stripe retries).
// - Creates / updates the idempotent order keyed on the Checkout Session ID.
// - Marks refunds so the internal view stays accurate; refunds themselves
//   are issued manually in the Stripe dashboard.

import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import {
  adminClient,
  isTripPlanSession,
  reconcileOrder,
  stripeClient,
} from "../_shared/trip-plan.ts";

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.refund.updated",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await Stripe.webhooks.constructEventAsync(
      payload,
      signature,
      secret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  if (!HANDLED.has(event.type)) return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });

  const db = adminClient();

  // Idempotency: claim the event id first. A duplicate delivery lands on the
  // primary-key conflict and is acknowledged without reprocessing.
  const { error: claimErr } = await db.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    livemode: event.livemode,
    status: "processing",
  });
  if (claimErr) {
    if (claimErr.code === "23505") {
      const { data: prior } = await db
        .from("stripe_webhook_events")
        .select("status")
        .eq("event_id", event.id)
        .maybeSingle();
      if (prior?.status === "failed") {
        // Allow Stripe's retry to reprocess a previously failed event.
        await db.from("stripe_webhook_events").update({ status: "processing", error: null }).eq("event_id", event.id);
      } else {
        return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
      }
    } else {
      console.error("Failed to record webhook event", claimErr);
      return new Response("Database error", { status: 500 });
    }
  }

  try {
    await handle(event, db);
    await db
      .from("stripe_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    console.error(`Webhook ${event.type} ${event.id} failed:`, message);
    await db.from("stripe_webhook_events").update({ status: "failed", error: message.slice(0, 1000) }).eq("event_id", event.id);
    // Non-2xx so Stripe retries with backoff.
    return new Response("Processing error", { status: 500 });
  }
});

async function handle(event: Stripe.Event, db: ReturnType<typeof adminClient>) {
  const stripe = stripeClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const evtSession = event.data.object as Stripe.Checkout.Session;
      if (evtSession.metadata?.samral_service !== "points_trip_plan") return; // not ours (e.g. Cal.com)

      // Re-fetch from Stripe rather than trusting the event body for amounts.
      const session = await stripe.checkout.sessions.retrieve(evtSession.id, {
        expand: ["line_items.data.price.product", "payment_intent"],
      });
      if (!isTripPlanSession(session)) {
        console.warn("Session did not pass Trip Plan verification", session.id);
        return;
      }

      if (event.type === "checkout.session.expired") return; // nothing to record

      const order = await reconcileOrder(db, session);

      if (event.type === "checkout.session.async_payment_failed" && order.status === "pending_payment") {
        await db.from("trip_plan_orders").update({ status: "payment_failed" }).eq("id", order.id);
      }
      return;
    }

    case "charge.refunded":
    case "charge.refund.updated": {
      const obj = event.data.object as Stripe.Charge | Stripe.Refund;
      const charge: Stripe.Charge | null =
        obj.object === "charge"
          ? (obj as Stripe.Charge)
          : typeof (obj as Stripe.Refund).charge === "string"
            ? await stripe.charges.retrieve((obj as Stripe.Refund).charge as string)
            : null;
      if (!charge) return;
      const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!piId) return;

      const { data: order } = await db
        .from("trip_plan_orders")
        .select("id, status")
        .eq("stripe_payment_intent_id", piId)
        .maybeSingle();
      if (!order) return;

      const fully = charge.refunded || charge.amount_refunded >= charge.amount;
      const partial = !fully && charge.amount_refunded > 0;
      const patch: Record<string, unknown> = {
        refund_status: fully ? "refunded" : partial ? "partially_refunded" : "none",
        refund_amount: charge.amount_refunded,
        refunded_at: charge.amount_refunded > 0 ? new Date().toISOString() : null,
      };
      if (fully) patch.status = "refunded";
      await db.from("trip_plan_orders").update(patch).eq("id", order.id);
      return;
    }
  }
}
