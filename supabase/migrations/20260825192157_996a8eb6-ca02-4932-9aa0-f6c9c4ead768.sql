CREATE OR REPLACE FUNCTION public.grant_samral_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'samuel@samral.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_samral_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_samral_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_samral_admin();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_samral_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_samral_admin
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_samral_admin();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'samuel@samral.com'
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;