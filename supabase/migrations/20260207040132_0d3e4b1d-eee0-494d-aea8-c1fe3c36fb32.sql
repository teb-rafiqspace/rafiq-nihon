-- Fix Security Definer View issue by using SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_profiles;

CREATE VIEW public.leaderboard_profiles 
WITH (security_invoker = on) AS
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

-- Re-grant access to the view
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT SELECT ON public.leaderboard_profiles TO anon;