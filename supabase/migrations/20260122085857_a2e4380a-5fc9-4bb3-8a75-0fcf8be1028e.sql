-- Create mock_test_questions table for storing test questions
CREATE TABLE public.mock_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type TEXT NOT NULL, -- 'kakunin' or 'jlpt_n5'
  section TEXT NOT NULL, -- 'kosakata', 'grammar', 'membaca'
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mock_test_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view mock test questions
CREATE POLICY "Anyone can view mock test questions"
ON public.mock_test_questions
FOR SELECT
USING (true);

-- Add answers column to test_attempts for storing user responses
ALTER TABLE public.test_attempts 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false;

-- Create index for faster querying
CREATE INDEX idx_mock_test_questions_test_type ON public.mock_test_questions(test_type);
CREATE INDEX idx_mock_test_questions_section ON public.mock_test_questions(section);