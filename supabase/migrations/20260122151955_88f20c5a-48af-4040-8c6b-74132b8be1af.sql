-- Practice Quiz Sets
CREATE TABLE IF NOT EXISTS practice_quiz_sets (
  id TEXT PRIMARY KEY,
  title_jp TEXT NOT NULL,
  title_id TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  track TEXT,
  difficulty TEXT DEFAULT 'easy',
  question_count INT DEFAULT 10,
  time_limit_seconds INT,
  icon_name TEXT DEFAULT 'HelpCircle',
  color TEXT DEFAULT '#3B82F6',
  xp_reward INT DEFAULT 20,
  order_index INT DEFAULT 0,
  is_daily BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Practice Quiz Questions
CREATE TABLE IF NOT EXISTS practice_quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_set_id TEXT REFERENCES practice_quiz_sets(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_audio_url TEXT,
  question_image_url TEXT,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  hint TEXT,
  difficulty INT DEFAULT 1,
  tags TEXT[],
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Quiz Practice History
CREATE TABLE IF NOT EXISTS user_practice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_set_id TEXT REFERENCES practice_quiz_sets(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  time_spent_seconds INT,
  xp_earned INT DEFAULT 0,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  quiz_set_ids TEXT[],
  bonus_xp INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Daily Challenge Progress
CREATE TABLE IF NOT EXISTS user_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  score INT,
  xp_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_practice_questions_set ON practice_quiz_questions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_history_user ON user_practice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user ON user_daily_progress(user_id);

-- RLS Policies
ALTER TABLE practice_quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice quiz sets viewable by everyone" ON practice_quiz_sets FOR SELECT USING (true);
CREATE POLICY "Practice questions viewable by everyone" ON practice_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Users can view own practice history" ON user_practice_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice history" ON user_practice_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Daily challenges viewable by everyone" ON daily_challenges FOR SELECT USING (true);
CREATE POLICY "Users can view own daily progress" ON user_daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily progress" ON user_daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily progress" ON user_daily_progress FOR UPDATE USING (auth.uid() = user_id);