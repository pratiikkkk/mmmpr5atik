-- Add permissive INSERT policy for authenticated users on companies table
CREATE POLICY "Authenticated users can insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also add UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);