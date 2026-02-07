-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin());

-- Users can see their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create admin analytics view for dashboard stats
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '7 days') AS active_users_7d,
  (SELECT COUNT(*) FROM public.profiles WHERE last_active_at > now() - interval '30 days') AS active_users_30d,
  (SELECT SUM(total_xp) FROM public.profiles) AS total_xp_earned,
  (SELECT COUNT(*) FROM public.chapters) AS total_chapters,
  (SELECT COUNT(*) FROM public.lessons) AS total_lessons,
  (SELECT COUNT(*) FROM public.flashcard_decks) AS total_decks,
  (SELECT COUNT(*) FROM public.flashcard_cards) AS total_flashcards,
  (SELECT COUNT(*) FROM public.practice_quiz_sets) AS total_quiz_sets,
  (SELECT COUNT(*) FROM public.practice_quiz_questions) AS total_quiz_questions,
  (SELECT COUNT(*) FROM public.subscriptions WHERE plan_type = 'premium') AS premium_users,
  (SELECT AVG(current_streak) FROM public.profiles WHERE current_streak > 0) AS avg_streak;

-- Grant access to admin view
CREATE POLICY "Admins can view stats"
ON public.profiles
FOR SELECT
USING (public.is_admin() OR auth.uid() = user_id);

-- Add timestamp trigger
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();