CREATE TABLE public.trip_intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  date_flexibility TEXT NOT NULL,
  travellers INTEGER NOT NULL,
  adults INTEGER,
  children INTEGER,
  cabin_preference TEXT NOT NULL,
  points_balances JSONB NOT NULL DEFAULT '[]'::jsonb,
  priorities TEXT[] NOT NULL DEFAULT '{}',
  found_cash_fare BOOLEAN NOT NULL DEFAULT false,
  cash_fare_amount TEXT,
  cash_fare_currency TEXT,
  airlines_to_avoid TEXT,
  airline_status TEXT,
  special_requirements TEXT,
  notes TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  stripe_session_id TEXT,
  source TEXT
);

GRANT INSERT ON public.trip_intake_submissions TO anon;
GRANT SELECT, INSERT ON public.trip_intake_submissions TO authenticated;
GRANT ALL ON public.trip_intake_submissions TO service_role;

ALTER TABLE public.trip_intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a trip intake"
ON public.trip_intake_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  acknowledged = true
  AND char_length(name) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 255
  AND char_length(destination) BETWEEN 1 AND 200
  AND char_length(departure_airport) BETWEEN 1 AND 120
  AND travellers BETWEEN 1 AND 2
);

CREATE POLICY "Admins can view trip intakes"
ON public.trip_intake_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));