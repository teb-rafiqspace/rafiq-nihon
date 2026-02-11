-- Fix: Allow NULL jlpt_level for English reading/listening content

-- reading_passages: drop NOT NULL on jlpt_level
ALTER TABLE reading_passages ALTER COLUMN jlpt_level DROP NOT NULL;

-- listening_items: drop NOT NULL on jlpt_level
ALTER TABLE listening_items ALTER COLUMN jlpt_level DROP NOT NULL;
