-- Kanji Characters Table
CREATE TABLE public.kanji_characters (
  id TEXT PRIMARY KEY,
  character TEXT NOT NULL,
  jlpt_level TEXT NOT NULL DEFAULT 'N5',
  stroke_count INTEGER NOT NULL DEFAULT 1,
  meanings_id TEXT NOT NULL,
  meanings_en TEXT,
  kun_readings TEXT[] DEFAULT '{}',
  on_readings TEXT[] DEFAULT '{}',
  example_words JSONB DEFAULT '[]',
  stroke_order_svg TEXT,
  radicals TEXT[] DEFAULT '{}',
  mnemonic_id TEXT,
  mnemonic_en TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Kanji Progress
CREATE TABLE public.user_kanji_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kanji_id TEXT NOT NULL REFERENCES public.kanji_characters(id),
  status TEXT DEFAULT 'not_learned',
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, kanji_id)
);

-- Reading Passages Table
CREATE TABLE public.reading_passages (
  id TEXT PRIMARY KEY,
  title_jp TEXT NOT NULL,
  title_id TEXT NOT NULL,
  content_jp TEXT NOT NULL,
  content_reading TEXT,
  jlpt_level TEXT NOT NULL DEFAULT 'N5',
  category TEXT DEFAULT 'general',
  difficulty INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 5,
  vocabulary_hints JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reading Questions Table
CREATE TABLE public.reading_questions (
  id TEXT PRIMARY KEY,
  passage_id TEXT NOT NULL REFERENCES public.reading_passages(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Reading Progress
CREATE TABLE public.user_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  passage_id TEXT NOT NULL REFERENCES public.reading_passages(id),
  completed BOOLEAN DEFAULT false,
  score INTEGER,
  answers JSONB,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, passage_id)
);

-- Listening Items Table
CREATE TABLE public.listening_items (
  id TEXT PRIMARY KEY,
  title_jp TEXT NOT NULL,
  title_id TEXT NOT NULL,
  audio_url TEXT,
  transcript_jp TEXT NOT NULL,
  transcript_reading TEXT,
  transcript_id TEXT,
  jlpt_level TEXT NOT NULL DEFAULT 'N5',
  category TEXT DEFAULT 'conversation',
  difficulty INTEGER DEFAULT 1,
  duration_seconds INTEGER DEFAULT 30,
  speakers INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Listening Questions Table
CREATE TABLE public.listening_questions (
  id TEXT PRIMARY KEY,
  listening_id TEXT NOT NULL REFERENCES public.listening_items(id),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Listening Progress
CREATE TABLE public.user_listening_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listening_id TEXT NOT NULL REFERENCES public.listening_items(id),
  completed BOOLEAN DEFAULT false,
  score INTEGER,
  answers JSONB,
  play_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, listening_id)
);

-- Cultural Tips Table
CREATE TABLE public.cultural_tips (
  id TEXT PRIMARY KEY,
  title_jp TEXT NOT NULL,
  title_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_en TEXT,
  category TEXT NOT NULL DEFAULT 'etiquette',
  image_url TEXT,
  related_phrases JSONB DEFAULT '[]',
  do_list JSONB DEFAULT '[]',
  dont_list JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Cultural Tips Progress
CREATE TABLE public.user_cultural_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tip_id TEXT NOT NULL REFERENCES public.cultural_tips(id),
  read BOOLEAN DEFAULT false,
  bookmarked BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tip_id)
);

-- RLS Policies for Content Tables (Public Read)
ALTER TABLE public.kanji_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kanji characters viewable by everyone" ON public.kanji_characters FOR SELECT USING (true);
CREATE POLICY "Reading passages viewable by everyone" ON public.reading_passages FOR SELECT USING (true);
CREATE POLICY "Reading questions viewable by everyone" ON public.reading_questions FOR SELECT USING (true);
CREATE POLICY "Listening items viewable by everyone" ON public.listening_items FOR SELECT USING (true);
CREATE POLICY "Listening questions viewable by everyone" ON public.listening_questions FOR SELECT USING (true);
CREATE POLICY "Cultural tips viewable by everyone" ON public.cultural_tips FOR SELECT USING (true);

-- RLS Policies for User Progress Tables
ALTER TABLE public.user_kanji_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_listening_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cultural_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kanji progress" ON public.user_kanji_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kanji progress" ON public.user_kanji_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kanji progress" ON public.user_kanji_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reading progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reading progress" ON public.user_reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading progress" ON public.user_reading_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own listening progress" ON public.user_listening_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own listening progress" ON public.user_listening_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listening progress" ON public.user_listening_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cultural progress" ON public.user_cultural_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cultural progress" ON public.user_cultural_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cultural progress" ON public.user_cultural_progress FOR UPDATE USING (auth.uid() = user_id);