-- HARD FIX: remove ALL profiles policies to eliminate recursion, then recreate minimal safe ones using SEC. DEFINER function

-- 1) Drop every existing policy on public.profiles dynamically
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END;
$$;

-- 2) Ensure helper function exists and is SECURE (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 3) Recreate minimal, non-recursive RLS policies for profiles
--    - Users can read/update their own row
--    - Admins (determined via security definer function) can read/update all
CREATE POLICY profiles_select ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR public.get_current_user_role() = 'admin'
);

CREATE POLICY profiles_insert_own ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR public.get_current_user_role() = 'admin'
);

-- 4) Optional: validate quick access without recursion
DO $$
DECLARE r TEXT;
BEGIN
  SELECT public.get_current_user_role() INTO r;
  -- no exception => ok
END;
$$;