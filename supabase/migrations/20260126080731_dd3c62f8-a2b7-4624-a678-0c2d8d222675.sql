-- =====================================================
-- RAFIQ NIHON - SPEAKING PRACTICE SYSTEM
-- =====================================================

-- Speaking Lessons/Modules
CREATE TABLE IF NOT EXISTS speaking_lessons (
  id TEXT PRIMARY KEY,
  title_ja TEXT NOT NULL,
  title_id TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  track TEXT DEFAULT 'general',
  category TEXT,
  estimated_minutes INT DEFAULT 5,
  xp_reward INT DEFAULT 20,
  order_index INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Speaking Practice Items
CREATE TABLE IF NOT EXISTS speaking_items (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES speaking_lessons(id),
  japanese_text TEXT NOT NULL,
  reading_hiragana TEXT,
  reading_romaji TEXT,
  meaning_id TEXT NOT NULL,
  meaning_en TEXT,
  audio_url TEXT,
  audio_slow_url TEXT,
  audio_duration_ms INT,
  pitch_pattern TEXT,
  pitch_visual TEXT,
  context_situation TEXT,
  formality_level TEXT,
  speaker_gender TEXT DEFAULT 'neutral',
  pronunciation_tips TEXT,
  common_mistakes TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Scripts
CREATE TABLE IF NOT EXISTS conversation_scripts (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES speaking_lessons(id),
  title_ja TEXT NOT NULL,
  title_id TEXT NOT NULL,
  scenario_description TEXT,
  location TEXT,
  participants TEXT[],
  difficulty TEXT DEFAULT 'beginner',
  estimated_turns INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Lines
CREATE TABLE IF NOT EXISTS conversation_lines (
  id TEXT PRIMARY KEY,
  script_id TEXT REFERENCES conversation_scripts(id),
  speaker TEXT NOT NULL,
  speaker_role TEXT,
  japanese_text TEXT NOT NULL,
  reading_hiragana TEXT,
  meaning_id TEXT NOT NULL,
  audio_url TEXT,
  is_user_turn BOOLEAN DEFAULT false,
  acceptable_responses TEXT[],
  response_hints TEXT[],
  ai_response_variations JSONB,
  line_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Role-Play Scenarios
CREATE TABLE IF NOT EXISTS roleplay_scenarios (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES speaking_lessons(id),
  title_ja TEXT NOT NULL,
  title_id TEXT NOT NULL,
  scenario_description_ja TEXT,
  scenario_description_id TEXT,
  user_role TEXT NOT NULL,
  ai_role TEXT NOT NULL,
  location TEXT,
  situation TEXT,
  objectives TEXT[],
  key_phrases TEXT[],
  difficulty TEXT DEFAULT 'intermediate',
  estimated_minutes INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Speaking Progress
CREATE TABLE IF NOT EXISTS user_speaking_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id TEXT REFERENCES speaking_items(id),
  attempts INT DEFAULT 0,
  best_score DECIMAL(5,2),
  average_score DECIMAL(5,2),
  last_practiced_at TIMESTAMPTZ,
  mastered BOOLEAN DEFAULT false,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Speaking Practice Sessions
CREATE TABLE IF NOT EXISTS speaking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id TEXT REFERENCES speaking_lessons(id),
  session_type TEXT NOT NULL,
  items_practiced INT DEFAULT 0,
  total_items INT,
  average_score DECIMAL(5,2),
  xp_earned INT DEFAULT 0,
  duration_seconds INT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- User Recordings
CREATE TABLE IF NOT EXISTS user_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id TEXT REFERENCES speaking_items(id),
  session_id UUID REFERENCES speaking_sessions(id),
  recording_url TEXT,
  duration_ms INT,
  pronunciation_score DECIMAL(5,2),
  fluency_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  feedback_text TEXT,
  problem_areas JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_speaking_items_lesson ON speaking_items(lesson_id);
CREATE INDEX IF NOT EXISTS idx_conversation_lines_script ON conversation_lines(script_id);
CREATE INDEX IF NOT EXISTS idx_user_speaking_progress_user ON user_speaking_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_speaking_sessions_user ON speaking_sessions(user_id);

-- RLS Policies
ALTER TABLE speaking_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_speaking_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Speaking lessons viewable by everyone" ON speaking_lessons FOR SELECT USING (true);
CREATE POLICY "Speaking items viewable by everyone" ON speaking_items FOR SELECT USING (true);
CREATE POLICY "Conversation scripts viewable by everyone" ON conversation_scripts FOR SELECT USING (true);
CREATE POLICY "Conversation lines viewable by everyone" ON conversation_lines FOR SELECT USING (true);
CREATE POLICY "Roleplay scenarios viewable by everyone" ON roleplay_scenarios FOR SELECT USING (true);
CREATE POLICY "Users manage own speaking progress" ON user_speaking_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own speaking sessions" ON speaking_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recordings" ON user_recordings FOR ALL USING (auth.uid() = user_id);