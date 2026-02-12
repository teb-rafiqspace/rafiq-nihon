-- Add jlpt_n2 to chapters track check constraint
ALTER TABLE chapters DROP CONSTRAINT chapters_track_check;
ALTER TABLE chapters ADD CONSTRAINT chapters_track_check
CHECK (track = ANY (ARRAY['kemnaker'::text, 'jlpt_n5'::text, 'jlpt_n4'::text, 'jlpt_n3'::text, 'jlpt_n2'::text]));
