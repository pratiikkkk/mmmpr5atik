-- Make user_id nullable to allow admin-created employee profiles
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add RLS policy for anonymous insert on profiles (for testing without auth)
CREATE POLICY "Allow anon insert profiles"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (true);

-- Add RLS policy for anonymous update on profiles
CREATE POLICY "Allow anon update profiles"
ON public.profiles
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Add RLS policy for anonymous select on profiles
CREATE POLICY "Allow anon select profiles"
ON public.profiles
FOR SELECT
TO anon
USING (true);