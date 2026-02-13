
-- Create certification test questions table
CREATE TABLE public.certification_test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type text NOT NULL,
  section text NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certification_test_questions ENABLE ROW LEVEL SECURITY;

-- Public read access (these are content questions, not user data)
CREATE POLICY "Certification questions viewable by everyone"
  ON public.certification_test_questions
  FOR SELECT
  USING (true);

-- Create index for fast lookups
CREATE INDEX idx_cert_questions_test_type ON public.certification_test_questions(test_type, sort_order);
