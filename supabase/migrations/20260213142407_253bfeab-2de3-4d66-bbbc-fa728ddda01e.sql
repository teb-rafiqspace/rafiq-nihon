
-- Create certificates table
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  test_type text NOT NULL,
  display_name text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  score_percent integer NOT NULL,
  passing_score integer NOT NULL,
  time_spent_seconds integer,
  section_scores jsonb,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own certificates
CREATE POLICY "Users can insert their own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
