-- Fix profiles RLS policies to restrict public exposure
-- Drop the overly permissive leaderboard policy
DROP POLICY IF EXISTS "Users can view leaderboard data" ON public.profiles;

-- Create a new restrictive policy for viewing own profile with full details
-- (This already exists via "Admins can view stats" policy)

-- Create a limited leaderboard view policy that only exposes non-sensitive data
-- This uses a secure approach: users can see profiles but through application filtering
-- For true leaderboard security, we'll create a view

-- Create a secure view for leaderboard data (only public info)
CREATE OR REPLACE VIEW public.leaderboard_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  total_xp,
  current_level,
  current_streak,
  lessons_completed
FROM public.profiles
ORDER BY total_xp DESC;

-- Grant access to the view
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT SELECT ON public.leaderboard_profiles TO anon;

-- Add a policy that allows users to only view their own full profile
-- Others can only query through the leaderboard_profiles view
CREATE POLICY "Users can view their own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add DELETE policy (was missing - users should be able to delete their own profile)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);