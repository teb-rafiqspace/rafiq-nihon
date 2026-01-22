
-- Create kana_characters table for storing hiragana and katakana data
CREATE TABLE public.kana_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('hiragana', 'katakana')),
  character text NOT NULL,
  romaji text NOT NULL,
  row_name text, -- 'a', 'ka', 'sa', etc.
  audio_url text,
  stroke_order_svg text,
  memory_tip_id text, -- Indonesian memory tip
  example_words jsonb DEFAULT '[]'::jsonb,
  order_index int NOT NULL DEFAULT 0,
  is_basic boolean DEFAULT true, -- false for dakuten, combinations
  created_at timestamptz DEFAULT now()
);

-- Create user_kana_progress table for tracking individual character progress
CREATE TABLE public.user_kana_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kana_id uuid NOT NULL REFERENCES public.kana_characters(id) ON DELETE CASCADE,
  status text DEFAULT 'not_learned' CHECK (status IN ('not_learned', 'learning', 'learned')),
  correct_count int DEFAULT 0,
  incorrect_count int DEFAULT 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, kana_id)
);

-- Enable RLS
ALTER TABLE public.kana_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kana_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for kana_characters (public read)
CREATE POLICY "Anyone can view kana characters"
  ON public.kana_characters FOR SELECT
  USING (true);

-- RLS policies for user_kana_progress
CREATE POLICY "Users can view their own kana progress"
  ON public.user_kana_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kana progress"
  ON public.user_kana_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kana progress"
  ON public.user_kana_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_kana_characters_type ON public.kana_characters(type);
CREATE INDEX idx_kana_characters_row ON public.kana_characters(row_name);
CREATE INDEX idx_user_kana_progress_user ON public.user_kana_progress(user_id);
CREATE INDEX idx_user_kana_progress_status ON public.user_kana_progress(status);

-- Trigger for updated_at
CREATE TRIGGER update_user_kana_progress_updated_at
  BEFORE UPDATE ON public.user_kana_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
