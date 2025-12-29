-- Add INSERT policy for anonymous users (for testing without auth)
CREATE POLICY "Allow anon insert companies"
ON public.companies
FOR INSERT
TO anon
WITH CHECK (true);

-- Add SELECT policy for anonymous users to view companies
CREATE POLICY "Allow anon select companies"
ON public.companies
FOR SELECT
TO anon
USING (true);

-- Also fix branches table for anon access
CREATE POLICY "Allow anon insert branches"
ON public.branches
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon update branches"
ON public.branches
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon select branches"
ON public.branches
FOR SELECT
TO anon
USING (true);