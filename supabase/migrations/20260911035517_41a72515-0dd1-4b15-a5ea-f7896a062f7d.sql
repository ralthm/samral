CREATE SEQUENCE IF NOT EXISTS public.trip_plan_order_seq START WITH 1001;

CREATE TABLE public.trip_plan_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT ('SAM-TP-' || lpad(nextval('public.trip_plan_order_seq')::text, 5, '0')),
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  stripe_livemode BOOLEAN NOT NULL DEFAULT false,
  product_key TEXT NOT NULL DEFAULT 'points_trip_plan',
  amount_total INTEGER,
  currency TEXT,
  amount_usd INTEGER NOT NULL DEFAULT 7900,
  customer_name TEXT,
  customer_email TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  status TEXT NOT NULL DEFAULT 'pending_payment',
  intake_status TEXT NOT NULL DEFAULT 'not_started',
  purchased_at TIMESTAMP WITH TIME ZONE,
  intake_submitted_at TIMESTAMP WITH TIME ZONE,
  delivery_deadline TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  refund_status TEXT NOT NULL DEFAULT 'none',
  refund_amount INTEGER,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.trip_plan_orders TO authenticated;
GRANT ALL ON public.trip_plan_orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.trip_plan_order_seq TO service_role;

ALTER TABLE public.trip_plan_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view trip plan orders"
ON public.trip_plan_orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trip plan orders"
ON public.trip_plan_orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trip_plan_orders_updated_at
BEFORE UPDATE ON public.trip_plan_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX trip_plan_orders_payment_intent_idx ON public.trip_plan_orders (stripe_payment_intent_id);
CREATE INDEX trip_plan_orders_status_idx ON public.trip_plan_orders (status, created_at DESC);

CREATE TABLE public.stripe_webhook_events (
  event_id TEXT NOT NULL PRIMARY KEY,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'processing',
  error TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

GRANT SELECT ON public.stripe_webhook_events TO authenticated;
GRANT ALL ON public.stripe_webhook_events TO service_role;

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
ON public.stripe_webhook_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.trip_intake_submissions
  ADD COLUMN order_id UUID UNIQUE REFERENCES public.trip_plan_orders(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Anyone can submit a trip intake" ON public.trip_intake_submissions;
REVOKE INSERT ON public.trip_intake_submissions FROM anon;
REVOKE INSERT ON public.trip_intake_submissions FROM authenticated;