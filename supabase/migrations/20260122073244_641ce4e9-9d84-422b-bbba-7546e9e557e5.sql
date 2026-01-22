-- Create a policy to allow users to see other users' leaderboard data
-- Only expose non-sensitive fields: name, avatar, XP for leaderboard

CREATE POLICY "Users can view leaderboard data"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive policy first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Note: This makes profiles readable by anyone for leaderboard purposes
-- Only public info (name, avatar, XP) should be displayed in the app