DROP TRIGGER IF EXISTS trip_plan_orders_updated_at ON public.trip_plan_orders;

DROP POLICY IF EXISTS "Admins can view trip intakes" ON public.trip_intake_submissions;
DROP POLICY IF EXISTS "Admins can view trip plan orders" ON public.trip_plan_orders;
DROP POLICY IF EXISTS "Admins can update trip plan orders" ON public.trip_plan_orders;
DROP POLICY IF EXISTS "Admins can view webhook events" ON public.stripe_webhook_events;

DROP TABLE IF EXISTS public.trip_intake_submissions;
DROP TABLE IF EXISTS public.trip_plan_orders;
DROP TABLE IF EXISTS public.stripe_webhook_events;

DROP SEQUENCE IF EXISTS public.trip_plan_order_seq;