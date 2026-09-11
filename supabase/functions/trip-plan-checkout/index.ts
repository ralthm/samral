// Creates a Stripe-hosted Checkout Session for exactly one Samral Points
// Trip Plan (USD 79, one-time). No card data ever touches this code or the
// frontend: the browser is simply redirected to the returned Stripe URL.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import {
  DELIVERY_BUSINESS_DAYS,
  PRODUCT_KEY,
  resolveOrigin,
  resolveTripPlanPrice,
  stripeClient,
} from "../_shared/trip-plan.ts";

const BodySchema = z.object({
  source: z.string().max(60).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  const parsed = BodySchema.safeParse(raw ?? {});
  if (!parsed.success) return json({ error: "invalid_request", details: parsed.error.flatten().fieldErrors }, 400);
  const body = parsed.data;

  const origin = resolveOrigin(req);

  try {
    const stripe = stripeClient();
    const price = await resolveTripPlanPrice(stripe);

    const metadata: Record<string, string> = { samral_service: PRODUCT_KEY };
    if (body.source) metadata.source = body.source;
    if (body.utm_source) metadata.utm_source = body.utm_source;
    if (body.utm_medium) metadata.utm_medium = body.utm_medium;
    if (body.utm_campaign) metadata.utm_campaign = body.utm_campaign;

    const params = {
      mode: "payment" as const,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/trip-intake?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/trip-planning?checkout=cancelled`,
      customer_creation: "always" as const,
      billing_address_collection: "auto" as const,
      submit_type: "pay" as const,
      allow_promotion_codes: false,
      metadata,
      payment_intent_data: {
        description: "Samral Points Trip Plan (one-time)",
        metadata,
      },
      custom_text: {
        submit: {
          message: `One-time payment. Your written Trip Plan is delivered within ${DELIVERY_BUSINESS_DAYS} business days of completing the short trip form that follows.`,
        },
      },
    };

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ...params,
        // Lets Stripe present the USD price in the buyer's local currency.
        adaptive_pricing: { enabled: true },
      });
    } catch (err) {
      const e = err as { param?: string; message?: string };
      if (e.param?.startsWith("adaptive_pricing") || /adaptive_pricing/i.test(e.message ?? "")) {
        session = await stripe.checkout.sessions.create(params);
      } else {
        throw err;
      }
    }

    if (!session.url) return json({ error: "no_checkout_url" }, 502);
    return json({ url: session.url, id: session.id, livemode: session.livemode });
  } catch (err) {
    const e = err as { message?: string; statusCode?: number; type?: string };
    console.error("trip-plan-checkout failed", e.type, e.statusCode, e.message);
    return json({ error: "checkout_unavailable", message: e.message ?? "Unknown error" }, 502);
  }
});
