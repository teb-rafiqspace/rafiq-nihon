-- Migration: Add English tracks (IELTS, TOEFL) support
-- Extends the app from Japanese-only to multi-language platform

-- 1. Add 'language' column to chapters
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'japanese';

-- 2. Update chapters track CHECK constraint to include ielts/toefl
-- First drop existing constraint, then add new one
DO $$
BEGIN
  -- Drop old check constraint if exists
  ALTER TABLE chapters DROP CONSTRAINT IF EXISTS chapters_track_check;
  -- Add new check with English tracks
  ALTER TABLE chapters ADD CONSTRAINT chapters_track_check
    CHECK (track IN ('kemnaker', 'jlpt_n5', 'jlpt_n4', 'jlpt_n3', 'jlpt_n2', 'ielts', 'toefl'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update chapters track check: %', SQLERRM;
END $$;

-- 3. Add language CHECK constraint to chapters
DO $$
BEGIN
  ALTER TABLE chapters ADD CONSTRAINT chapters_language_check
    CHECK (language IN ('japanese', 'english'));
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'chapters_language_check already exists';
END $$;

-- 4. Add 'track' column to vocabulary (for filtering English vocab)
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS track TEXT;
ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS part_of_speech TEXT;

-- 5. Add 'track' column to reading_passages
ALTER TABLE reading_passages ADD COLUMN IF NOT EXISTS track TEXT;

-- 6. Add 'track' column to listening_items
ALTER TABLE listening_items ADD COLUMN IF NOT EXISTS track TEXT;

-- 7. Add 'language' column to speaking_lessons
ALTER TABLE speaking_lessons ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'japanese';

-- 8. Add 'language' column to flashcard_decks
ALTER TABLE flashcard_decks ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'japanese';

-- 9. Add 'language' column to practice_quiz_sets
ALTER TABLE practice_quiz_sets ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'japanese';

-- 10. Update profiles learning_goal CHECK to include ielts/toefl
DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_learning_goal_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_learning_goal_check
    CHECK (learning_goal IN ('kemnaker', 'jlpt', 'general', 'ielts', 'toefl'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update profiles learning_goal check: %', SQLERRM;
END $$;

-- 11. Backfill track column for vocabulary from lesson->chapter
UPDATE vocabulary v
SET track = c.track
FROM lessons l
JOIN chapters c ON l.chapter_id = c.id
WHERE v.lesson_id = l.id AND v.track IS NULL;

-- 12. Backfill track for reading_passages from jlpt_level
UPDATE reading_passages
SET track = CASE
  WHEN jlpt_level = 'N5' THEN 'jlpt_n5'
  WHEN jlpt_level = 'N4' THEN 'jlpt_n4'
  WHEN jlpt_level = 'N3' THEN 'jlpt_n3'
  WHEN jlpt_level = 'N2' THEN 'jlpt_n2'
  WHEN jlpt_level = 'N1' THEN 'jlpt_n1'
  ELSE NULL
END
WHERE track IS NULL AND jlpt_level IS NOT NULL;

-- 13. Backfill track for listening_items from jlpt_level
UPDATE listening_items
SET track = CASE
  WHEN jlpt_level = 'N5' THEN 'jlpt_n5'
  WHEN jlpt_level = 'N4' THEN 'jlpt_n4'
  WHEN jlpt_level = 'N3' THEN 'jlpt_n3'
  WHEN jlpt_level = 'N2' THEN 'jlpt_n2'
  WHEN jlpt_level = 'N1' THEN 'jlpt_n1'
  ELSE NULL
END
WHERE track IS NULL AND jlpt_level IS NOT NULL;

-- 14. Add ielts/toefl to mock_test_questions test_type
DO $$
BEGIN
  ALTER TABLE mock_test_questions DROP CONSTRAINT IF EXISTS mock_test_questions_test_type_check;
  ALTER TABLE mock_test_questions ADD CONSTRAINT mock_test_questions_test_type_check
    CHECK (test_type IN ('kakunin', 'jlpt_n5', 'jlpt_n2', 'ielts_mock', 'toefl_mock'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update mock_test_questions test_type check: %', SQLERRM;
END $$;
