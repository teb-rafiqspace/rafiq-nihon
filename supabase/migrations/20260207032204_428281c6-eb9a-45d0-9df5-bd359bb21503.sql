-- Drop the SECURITY DEFINER view and replace with a regular function
DROP VIEW IF EXISTS public.admin_stats;

-- Create admin stats function instead of view (returns table, admin-only)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users_7d BIGINT,
  active_users_30d BIGINT,
  total_xp_earned BIGINT,
  total_chapters BIGINT,
  total_lessons BIGINT,
  total_decks BIGINT,
  total_flashcards BIGINT,
  total_quiz_sets BIGINT,
  total_quiz_questions BIGINT,
  premium_users BIGINT,
  avg_streak NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '7 days')::BIGINT,
    (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '30 days')::BIGINT,
    (SELECT COALESCE(SUM(total_xp), 0) FROM public.profiles)::BIGINT,
    (SELECT COUNT(*) FROM public.chapters)::BIGINT,
    (SELECT COUNT(*) FROM public.lessons)::BIGINT,
    (SELECT COUNT(*) FROM public.flashcard_decks)::BIGINT,
    (SELECT COUNT(*) FROM public.flashcard_cards)::BIGINT,
    (SELECT COUNT(*) FROM public.practice_quiz_sets)::BIGINT,
    (SELECT COUNT(*) FROM public.practice_quiz_questions)::BIGINT,
    (SELECT COUNT(*) FROM public.subscriptions WHERE plan_type = 'premium')::BIGINT,
    (SELECT COALESCE(AVG(current_streak), 0) FROM public.profiles WHERE current_streak > 0)::NUMERIC;
END;
$$;

-- Function to get all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  total_xp INT,
  current_level INT,
  current_streak INT,
  lessons_completed INT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  role app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY 
  SELECT 
    p.user_id,
    au.email::TEXT,
    p.full_name,
    p.avatar_url,
    p.total_xp,
    p.current_level,
    p.current_streak,
    p.lessons_completed,
    p.last_active_at,
    p.created_at,
    COALESCE(ur.role, 'user'::app_role) as role
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to assign role to user (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_role(_target_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert or update role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET updated_at = now();

  RETURN TRUE;
END;
$$;

-- Function to remove role from user (admin only)
CREATE OR REPLACE FUNCTION public.remove_user_role(_target_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  DELETE FROM public.user_roles 
  WHERE user_id = _target_user_id AND role = _role;

  RETURN TRUE;
END;
$$;