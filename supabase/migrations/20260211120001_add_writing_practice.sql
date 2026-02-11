-- Migration: Add writing practice tables for IELTS/TOEFL

-- Writing prompts table
CREATE TABLE IF NOT EXISTS writing_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('ielts', 'toefl')),
  task_type TEXT NOT NULL CHECK (task_type IN (
    'ielts_task1_academic', 'ielts_task1_general', 'ielts_task2',
    'toefl_integrated', 'toefl_independent'
  )),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  instructions TEXT,
  word_limit_min INTEGER DEFAULT 150,
  word_limit_max INTEGER DEFAULT 250,
  time_limit_minutes INTEGER DEFAULT 40,
  model_answer TEXT,
  scoring_criteria JSONB DEFAULT '{}',
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  order_index INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing submissions table
CREATE TABLE IF NOT EXISTS writing_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  submission_text TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  score NUMERIC(4,1),
  feedback JSONB DEFAULT '{}',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_writing_prompts_track ON writing_prompts(track);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_task_type ON writing_prompts(task_type);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user ON writing_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_prompt ON writing_submissions(prompt_id);

-- RLS Policies
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;

-- Writing prompts: public read
CREATE POLICY "Writing prompts are viewable by everyone"
  ON writing_prompts FOR SELECT
  USING (true);

-- Writing submissions: user-scoped
CREATE POLICY "Users can view their own submissions"
  ON writing_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
  ON writing_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON writing_submissions FOR UPDATE
  USING (auth.uid() = user_id);
