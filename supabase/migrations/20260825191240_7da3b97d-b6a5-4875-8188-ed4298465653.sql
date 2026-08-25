-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Card images (one row per exact internal card id)
CREATE TABLE public.card_images (
  card_id text PRIMARY KEY,
  bank_id text NOT NULL,
  card_name text NOT NULL,
  card_image_path text,
  card_image_variants jsonb NOT NULL DEFAULT '{}'::jsonb,
  card_image_source_url text,
  card_image_origin_url text,
  card_image_source_type text CHECK (
    card_image_source_type IN (
      'official_card_page',
      'official_bank_catalogue',
      'official_bank_pdf',
      'manual_upload'
    )
  ),
  card_image_verified_at timestamptz,
  card_image_status text NOT NULL DEFAULT 'needs_review' CHECK (
    card_image_status IN ('needs_review', 'verified', 'rejected', 'not_found', 'stale')
  ),
  image_sha256 text,
  image_width integer,
  image_height integer,
  source_content_hash text,
  last_checked_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX card_images_verified_sha_unique
  ON public.card_images (image_sha256)
  WHERE card_image_status = 'verified' AND image_sha256 IS NOT NULL;

CREATE INDEX card_images_status_idx ON public.card_images (card_image_status);

GRANT SELECT ON public.card_images TO anon;
GRANT SELECT ON public.card_images TO authenticated;
GRANT ALL ON public.card_images TO service_role;
ALTER TABLE public.card_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified card images"
ON public.card_images FOR SELECT TO anon, authenticated
USING (card_image_status = 'verified');

CREATE POLICY "Admins can read every card image"
ON public.card_images FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER card_images_updated_at
BEFORE UPDATE ON public.card_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ingestion candidates (never customer-facing)
CREATE TABLE public.card_image_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id text NOT NULL REFERENCES public.card_images(card_id) ON DELETE CASCADE,
  image_url text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL CHECK (
    source_type IN (
      'official_card_page',
      'official_bank_catalogue',
      'official_bank_pdf',
      'manual_upload'
    )
  ),
  discovery_method text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (card_id, image_url)
);

CREATE INDEX card_image_candidates_card_idx ON public.card_image_candidates (card_id);

GRANT SELECT ON public.card_image_candidates TO authenticated;
GRANT ALL ON public.card_image_candidates TO service_role;
ALTER TABLE public.card_image_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read candidates"
ON public.card_image_candidates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Single-flight locks for bulk ingestion
CREATE TABLE public.job_locks (
  job_name text PRIMARY KEY,
  locked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT SELECT ON public.job_locks TO authenticated;
GRANT ALL ON public.job_locks TO service_role;
ALTER TABLE public.job_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read job locks"
ON public.job_locks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));