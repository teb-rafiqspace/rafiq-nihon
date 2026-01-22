-- =====================================================
-- FLASHCARD SYSTEM TABLES
-- =====================================================

-- Flashcard Decks
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id TEXT PRIMARY KEY,
  title_jp TEXT NOT NULL,
  title_id TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  track TEXT,
  card_count INT DEFAULT 0,
  icon_name TEXT DEFAULT 'Layers',
  color TEXT DEFAULT '#3B82F6',
  order_index INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flashcard Cards
CREATE TABLE IF NOT EXISTS flashcard_cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  front_subtext TEXT,
  front_image_url TEXT,
  back_text TEXT NOT NULL,
  back_subtext TEXT,
  back_reading TEXT,
  back_example TEXT,
  audio_url TEXT,
  tags TEXT[],
  difficulty INT DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Flashcard Progress (Spaced Repetition)
CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id TEXT REFERENCES flashcard_cards(id) ON DELETE CASCADE,
  deck_id TEXT REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  status TEXT DEFAULT 'new',
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Flashcard Study Sessions
CREATE TABLE IF NOT EXISTS flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deck_id TEXT REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  cards_studied INT DEFAULT 0,
  cards_correct INT DEFAULT 0,
  cards_incorrect INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_cards_deck ON flashcard_cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user ON user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review ON user_flashcard_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcard_sessions_user ON flashcard_sessions(user_id);

-- RLS Policies
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcard decks are viewable by everyone" ON flashcard_decks FOR SELECT USING (true);
CREATE POLICY "Flashcard cards are viewable by everyone" ON flashcard_cards FOR SELECT USING (true);

CREATE POLICY "Users can view their own flashcard progress" ON user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard progress" ON user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard progress" ON user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own flashcard sessions" ON flashcard_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard sessions" ON flashcard_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard sessions" ON flashcard_sessions FOR UPDATE USING (auth.uid() = user_id);