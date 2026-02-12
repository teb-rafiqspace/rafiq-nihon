-- 1. Certification test questions (separate pool from mock_test_questions)
CREATE TABLE public.certification_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type TEXT NOT NULL CHECK (test_type IN (
    'cert_jlpt_n5', 'cert_jlpt_n4', 'cert_jlpt_n3', 'cert_jlpt_n2', 'cert_kakunin'
  )),
  section TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certification_test_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view certification test questions
CREATE POLICY "Anyone can view certification test questions"
ON public.certification_test_questions
FOR SELECT
USING (true);

-- Create indexes for faster querying
CREATE INDEX idx_cert_questions_type ON public.certification_test_questions(test_type);
CREATE INDEX idx_cert_questions_section ON public.certification_test_questions(section);

-- 2. Certificates (earned by users)
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  test_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  score_percent INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  section_scores JSONB,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own certificates
CREATE POLICY "Users can insert their own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);

-- 3. Update test_attempts constraint to include certification test types
ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_test_type_check;
ALTER TABLE public.test_attempts ADD CONSTRAINT test_attempts_test_type_check
  CHECK (test_type IN ('kakunin', 'jlpt_n5', 'jlpt_n2', 'chapter_quiz', 'ielts_mock', 'toefl_mock', 'cert_kakunin', 'cert_jlpt_n5', 'cert_jlpt_n4', 'cert_jlpt_n3', 'cert_jlpt_n2'));
