-- Allow authenticated users to read all profiles for leaderboard functionality
-- The leaderboard_profiles view (security_invoker=on) already limits visible columns
CREATE POLICY "Authenticated users can view profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);